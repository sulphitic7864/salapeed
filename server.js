import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: ['.env', '.env.print-shop'] });

const app = express();
const port = Number(process.env.PORT || 3001);
const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(rootDirectory, 'dist');

app.use(express.json({ limit: '36mb' }));

const ADMIN_SESSION_COOKIE = 'salapeed_admin_session';
const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PRINT_SHOP_RELEASE_TOKEN || '';
}

function getAdminSessionToken(sessionSecret) {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(`${expiresAt}.${randomBytes(24).toString('hex')}`).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function hasValidAdminSession(request, sessionSecret) {
  const cookie = request.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const token = cookie?.slice(ADMIN_SESSION_COOKIE.length + 1);
  const [payload, suppliedSignature] = token?.split('.') || [];
  if (!payload || !suppliedSignature) return false;

  const expectedSignature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;

  try {
    const expiresAt = Number(Buffer.from(payload, 'base64url').toString().split('.')[0]);
    return Number.isFinite(expiresAt) && expiresAt > Date.now();
  } catch {
    return false;
  }
}

function setAdminSessionCookie(response, token, maxAge) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `${ADMIN_SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`
  );
}

app.post('/api/admin/session', async (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const sessionSecret = getAdminSessionSecret();

  if (!email || !password) return response.status(400).json({ error: 'Email and password are required.' });
  if (!anonKey || !sessionSecret) {
    return response.status(503).json({ error: 'Supabase admin authentication is not configured on the server.' });
  }

  try {
    const { url } = getSupabaseSettings();
    const authResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!authResponse.ok) {
      return response.status(401).json({ error: 'Invalid email or password, or account is not confirmed.' });
    }

    const authResult = await authResponse.json();
    const userId = authResult.user?.id;
    if (!userId) return response.status(401).json({ error: 'Could not verify the Supabase user.' });

    const query = new URLSearchParams({ user_id: `eq.${userId}`, select: 'user_id', limit: '1' });
    const admins = await supabaseRequest(`admin_users?${query}`);
    if (!admins?.length) {
      return response.status(403).json({ error: 'This account is not authorized as an admin.' });
    }

    const token = getAdminSessionToken(sessionSecret);
    setAdminSessionCookie(response, token, ADMIN_SESSION_MAX_AGE_SECONDS);
    return response.json({ authenticated: true });
  } catch (error) {
    console.error('Supabase admin sign-in failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: 'Could not verify admin access with Supabase.' });
  }
});

app.get('/api/admin/session', (request, response) => {
  const sessionSecret = getAdminSessionSecret();
  if (!sessionSecret) return response.status(503).json({ authenticated: false });
  const authenticated = hasValidAdminSession(request, sessionSecret);
  return response.status(authenticated ? 200 : 401).json({ authenticated });
});

app.delete('/api/admin/session', (_request, response) => {
  setAdminSessionCookie(response, '', 0);
  return response.status(204).end();
});

function clearAdminSession(response) {
  setAdminSessionCookie(response, '', 0);
}

function requireAdminSession(request, response) {
  const sessionSecret = getAdminSessionSecret();
  if (!sessionSecret || !hasValidAdminSession(request, sessionSecret)) {
    clearAdminSession(response);
    response.status(401).json({ error: 'Admin session expired. Sign in again.' });
    return false;
  }
  return true;
}

function getSupabaseSettings() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    const error = new Error('Server-side Supabase credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }
  return { url, serviceKey };
}

async function supabaseRequest(path, options = {}) {
  const { url, serviceKey } = getSupabaseSettings();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const error = new Error(`Supabase request failed with status ${response.status}.`);
    error.statusCode = 502;
    throw error;
  }
  if (response.status === 204) return null;
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

function toOrderRecord(order) {
  if (!order || typeof order.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(order.id) || !Array.isArray(order.items)) {
    throw new Error('Invalid order data.');
  }
  return {
    id: order.id,
    created_at: order.createdAt,
    customer_name: order.customerName,
    customer_email: order.customerEmail || null,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    payment_method: order.paymentMethod,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    status: order.status,
    status_history: order.statusHistory || [],
    customer_notes: order.customerNotes || null,
  };
}

function fromOrderRecord(record) {
  return {
    id: record.id,
    createdAt: record.created_at,
    customerName: record.customer_name,
    customerEmail: record.customer_email || undefined,
    customerPhone: record.customer_phone,
    customerAddress: record.customer_address,
    paymentMethod: record.payment_method,
    items: record.items || [],
    subtotal: Number(record.subtotal),
    deliveryFee: Number(record.delivery_fee),
    total: Number(record.total),
    status: record.status,
    statusHistory: record.status_history || [],
    customerNotes: record.customer_notes || undefined,
  };
}

function toGraphicRecord(graphic) {
  if (!graphic || typeof graphic.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(graphic.id)) {
    throw new Error('Invalid graphic data.');
  }
  return {
    id: graphic.id,
    name: graphic.name,
    category: graphic.category,
    tags: graphic.tags || [],
    svg_content: graphic.svgContent || null,
    preview_url: graphic.previewUrl || null,
    print_ready_url: graphic.printReadyUrl || null,
    is_custom: graphic.isCustomAdmin !== false,
  };
}

function fromGraphicRecord(record) {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    tags: Array.isArray(record.tags) ? record.tags : [],
    svgContent: record.svg_content || undefined,
    previewUrl: record.preview_url || undefined,
    printReadyUrl: record.print_ready_url || undefined,
    isCustomAdmin: Boolean(record.is_custom),
  };
}

function toProductRecord(product) {
  if (!product || typeof product.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(product.id)) {
    throw new Error('Invalid product data.');
  }
  return {
    id: product.id,
    name: product.name,
    brochure_title: product.brochureTitle || null,
    description: product.desc,
    kind: product.kind,
    base_price: Number(product.basePrice || 0),
    colors: product.colors || [],
    sizes: product.sizes || [],
    image_type: product.imageType || 'pullover',
    size_chart: product.sizeChart || { headers: [], rows: [] },
    photo_url: product.photoUrl || null,
    color_photos: product.colorPhotos || {},
    brochure_page: product.brochurePage ?? null,
  };
}

function fromProductRecord(record) {
  return {
    id: record.id,
    name: record.name,
    brochureTitle: record.brochure_title || undefined,
    desc: record.description,
    kind: record.kind,
    basePrice: Number(record.base_price || 0),
    colors: Array.isArray(record.colors) ? record.colors : [],
    sizes: Array.isArray(record.sizes) ? record.sizes : [],
    imageType: record.image_type || 'pullover',
    sizeChart: record.size_chart || { headers: [], rows: [] },
    photoUrl: record.photo_url || undefined,
    colorPhotos: record.color_photos || {},
    brochurePage: record.brochure_page ?? undefined,
  };
}

function toFaqRecord(faq) {
  if (!faq || typeof faq.id !== 'string' || !faq.q || !faq.a) {
    throw new Error('Invalid FAQ data.');
  }
  return {
    id: faq.id,
    q: faq.q,
    a: faq.a,
  };
}

function fromFaqRecord(record) {
  return {
    id: record.id,
    q: record.q,
    a: record.a,
  };
}

function toAdminConfigRecord(config) {
  if (!config || typeof config !== 'object') throw new Error('Invalid admin config.');
  return {
    id: 'main',
    print_fee: Number(config.printFee || 0),
    delivery_fee: Number(config.deliveryFee || 0),
    shop_phone: config.shopPhone || '',
    shop_address: config.shopAddress || '',
    shop_email: config.shopEmail || '',
    benefit_iban: config.benefitIban || '',
    benefit_phone: config.benefitPhone || '',
    website: config.website || null,
    instagram: config.instagram || null,
    slogan_en: config.sloganEn || null,
    brand_name_en: config.brandNameEn || null,
  };
}

function fromAdminConfigRecord(record) {
  return {
    printFee: Number(record.print_fee || 0),
    deliveryFee: Number(record.delivery_fee || 0),
    shopPhone: record.shop_phone || '',
    shopAddress: record.shop_address || '',
    shopEmail: record.shop_email || '',
    benefitIban: record.benefit_iban || '',
    benefitPhone: record.benefit_phone || '',
    website: record.website || undefined,
    instagram: record.instagram || undefined,
    sloganEn: record.slogan_en || undefined,
    brandNameEn: record.brand_name_en || undefined,
  };
}

app.get('/api/products', async (_request, response) => {
  try {
    const rows = await supabaseRequest('products?select=*&order=name.asc');
    return response.json((rows || []).map(fromProductRecord));
  } catch (error) {
    console.error('Supabase products read failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'Could not load products from Supabase.' });
  }
});

app.post('/api/admin/products', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  try {
    const record = toProductRecord(request.body);
    await supabaseRequest('products?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(record),
    });
    return response.json({ saved: true });
  } catch (error) {
    console.error('Supabase product write failed:', error.message);
    return response.status(error.statusCode || 400).json({ error: error.statusCode === 503 ? error.message : 'Could not save the product to Supabase.' });
  }
});

app.get('/api/faqs', async (_request, response) => {
  try {
    const rows = await supabaseRequest('faqs?select=*&order=id.asc');
    return response.json((rows || []).map(fromFaqRecord));
  } catch (error) {
    console.error('Supabase FAQs read failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'Could not load FAQs from Supabase.' });
  }
});

app.post('/api/admin/faqs', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  try {
    const record = toFaqRecord(request.body);
    await supabaseRequest('faqs?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(record),
    });
    return response.json({ saved: true });
  } catch (error) {
    console.error('Supabase FAQ write failed:', error.message);
    return response.status(error.statusCode || 400).json({ error: error.statusCode === 503 ? error.message : 'Could not save the FAQ to Supabase.' });
  }
});

app.delete('/api/admin/faqs/:id', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(request.params.id)) {
    return response.status(400).json({ error: 'Invalid FAQ ID.' });
  }
  try {
    const query = new URLSearchParams({ id: `eq.${request.params.id}` });
    await supabaseRequest(`faqs?${query}`, { method: 'DELETE' });
    return response.json({ deleted: true });
  } catch (error) {
    console.error('Supabase FAQ delete failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'Could not delete the FAQ from Supabase.' });
  }
});

app.get('/api/admin/config', async (request, response) => {
  try {
    const rows = await supabaseRequest('admin_config?select=*&limit=1');
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) {
      const fallback = { printFee: 0, deliveryFee: 0, shopPhone: '', shopAddress: '', shopEmail: '', benefitIban: '', benefitPhone: '' };
      return response.json(fallback);
    }
    return response.json(fromAdminConfigRecord(row));
  } catch (error) {
    console.error('Supabase admin config read failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'Could not load admin config from Supabase.' });
  }
});

app.post('/api/admin/config', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  try {
    const record = toAdminConfigRecord(request.body);
    await supabaseRequest('admin_config?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(record),
    });
    return response.json({ saved: true });
  } catch (error) {
    console.error('Supabase admin config write failed:', error.message);
    return response.status(error.statusCode || 400).json({ error: error.statusCode === 503 ? error.message : 'Could not save admin config to Supabase.' });
  }
});

app.get('/api/graphics', async (_request, response) => {
  try {
    const rows = await supabaseRequest('graphics?select=*&order=name.asc');
    return response.json((rows || []).map(fromGraphicRecord));
  } catch (error) {
    console.error('Supabase graphics read failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'Could not load graphics from Supabase.' });
  }
});

app.get('/api/admin/orders', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  try {
    const rows = await supabaseRequest('orders?select=*&order=created_at.desc');
    return response.json((rows || []).map(fromOrderRecord));
  } catch (error) {
    console.error('Supabase orders read failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'Could not load orders from Supabase.' });
  }
});

async function saveOrder(request, response, adminOnly) {
  if (adminOnly && !requireAdminSession(request, response)) return;
  try {
    const record = toOrderRecord(request.body);
    await supabaseRequest('orders?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(record),
    });
    return response.json({ saved: true });
  } catch (error) {
    console.error('Supabase order write failed:', error.message);
    return response.status(error.statusCode || 400).json({ error: error.statusCode === 503 ? error.message : 'Could not save the order to Supabase.' });
  }
}

app.post('/api/orders', (request, response) => saveOrder(request, response, false));
app.post('/api/admin/orders', (request, response) => saveOrder(request, response, true));

app.get('/api/orders/track', async (request, response) => {
  const lookup = typeof request.query.lookup === 'string' ? request.query.lookup.trim() : '';
  if (!lookup) return response.status(400).json({ error: 'Enter an order number or registered phone number.' });

  try {
    let query;
    const orderId = lookup.toUpperCase();
    const phoneDigits = lookup.replace(/\D/g, '');
    const isOrderId = /^SP-[A-Z0-9_-]{4,80}$/.test(orderId);
    if (isOrderId) {
      query = new URLSearchParams({ id: `eq.${orderId}`, select: '*', limit: '1' });
    } else {
      if (phoneDigits.length < 7) {
        return response.status(400).json({ error: 'Enter a valid order number or phone number.' });
      }
      query = new URLSearchParams({
        customer_phone: `ilike.*${phoneDigits.slice(-4)}*`,
        select: '*',
        order: 'created_at.desc',
        limit: '100',
      });
    }

    const rows = await supabaseRequest(`orders?${query}`);
    const matchedOrder = isOrderId
      ? rows?.[0]
      : rows?.find((row) => {
        const storedDigits = String(row.customer_phone || '').replace(/\D/g, '');
        const suffixLength = Math.min(phoneDigits.length, 8);
        return storedDigits.slice(-suffixLength) === phoneDigits.slice(-suffixLength);
      });
    if (!matchedOrder) return response.status(404).json({ error: 'Order not found.' });
    return response.json(fromOrderRecord(matchedOrder));
  } catch (error) {
    console.error('Supabase order tracking lookup failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: 'Could not look up the order right now.' });
  }
});

app.post('/api/admin/graphics', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  try {
    const record = toGraphicRecord(request.body);
    await supabaseRequest('graphics?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(record),
    });
    return response.json({ saved: true });
  } catch (error) {
    console.error('Supabase graphic write failed:', error.message);
    return response.status(error.statusCode || 400).json({ error: error.statusCode === 503 ? error.message : 'Could not save the graphic to Supabase.' });
  }
});

app.delete('/api/admin/graphics/:id', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(request.params.id)) {
    return response.status(400).json({ error: 'Invalid graphic ID.' });
  }
  try {
    const query = new URLSearchParams({ id: `eq.${request.params.id}` });
    await supabaseRequest(`graphics?${query}`, { method: 'DELETE' });
    return response.json({ deleted: true });
  } catch (error) {
    console.error('Supabase graphic delete failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'Could not delete the graphic from Supabase.' });
  }
});

app.post('/api/print-shop/dispatch', async (request, response) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const username = process.env.SMTP_USER;
  const password = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const sessionSecret = getAdminSessionSecret();
  const from = process.env.PRINT_SHOP_FROM_EMAIL;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !sessionSecret || !from || (!!username !== !!password)) {
    return response.status(503).json({ error: 'SMTP email or server-side admin authentication is not configured correctly.' });
  }
  if (!hasValidAdminSession(request, sessionSecret)) {
    clearAdminSession(response);
    return response.status(401).json({ error: 'Admin session expired. Sign in again before releasing this order.' });
  }

  const { orderId, to, subject, html, text, bankConfirmed, attachments } = request.body || {};
  if (!bankConfirmed) return response.status(400).json({ error: 'Confirm the bank payment before releasing this order.' });
  if (typeof orderId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(orderId)) {
    return response.status(400).json({ error: 'Invalid order number.' });
  }
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return response.status(400).json({ error: 'Enter a valid print-shop email address.' });
  }
  if (typeof subject !== 'string' || typeof html !== 'string' || typeof text !== 'string' || !Array.isArray(attachments)) {
    return response.status(400).json({ error: 'The production email package is incomplete.' });
  }

  const emailAttachments = [];
  let totalBytes = 0;
  for (const attachment of attachments) {
    if (
      typeof attachment?.filename !== 'string' ||
      typeof attachment?.contentType !== 'string' ||
      typeof attachment?.content !== 'string' ||
      !/^[a-zA-Z0-9_.-]{1,180}$/.test(attachment.filename) ||
      !/^[a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+$/.test(attachment.contentType) ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(attachment.content)
    ) {
      return response.status(400).json({ error: 'A print attachment is invalid.' });
    }
    totalBytes += Buffer.byteLength(attachment.content, 'base64');
    emailAttachments.push({
      filename: attachment.filename,
      content: attachment.content,
      content_type: attachment.contentType,
    });
  }
  if (!emailAttachments.length || totalBytes > 25 * 1024 * 1024) {
    return response.status(413).json({ error: 'The print package is empty or exceeds the 25 MB email attachment limit.' });
  }

  const emailHtml = html.replace(/src=(['"])data:[\s\S]*?\1/gi, '');
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: username ? { user: username, pass: password } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });

  try {
    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html: emailHtml,
      text,
      attachments: emailAttachments.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, 'base64'),
        contentType: attachment.content_type,
      })),
    });

    return response.json({ id: result.messageId });
  } catch (error) {
    console.error('SMTP print-shop dispatch failed:', error);
    return response.status(502).json({ error: 'SMTP could not send the print package. Check the SMTP host, credentials, and sender address.' });
  } finally {
    transporter.close();
  }
});

if (existsSync(distDirectory)) {
  app.use(express.static(distDirectory));
  app.get('*', (_request, response) => response.sendFile(path.join(distDirectory, 'index.html')));
}

const isDirectExecution = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  app.listen(port, () => {
    console.log(`Salapeed server listening on port ${port}`);
  });
}

export default app;