import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
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
const ORDER_ASSET_BUCKET = 'order-assets';
const BENEFIT_QR_BUCKET = 'benefit-payment-qr';
let orderAssetAdmin;
let orderAssetBucketInitialization;
let benefitQrBucketInitialization;

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

function getOrderAssetStorage() {
  if (!orderAssetAdmin) {
    const { url, serviceKey } = getSupabaseSettings();
    orderAssetAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }).storage.from(ORDER_ASSET_BUCKET);
  }
  return orderAssetAdmin;
}

async function ensureOrderAssetBucket() {
  if (!orderAssetBucketInitialization) {
    orderAssetBucketInitialization = (async () => {
      const { url, serviceKey } = getSupabaseSettings();
      const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error: lookupError } = await admin.storage.getBucket(ORDER_ASSET_BUCKET);
      if (!lookupError) return;
      if (Number(lookupError.statusCode) !== 404 && Number(lookupError.status) !== 404) {
        throw new Error(`Could not check order asset storage: ${lookupError.message}`);
      }

      async function ensureBenefitQrBucket() {
        if (!benefitQrBucketInitialization) {
          benefitQrBucketInitialization = (async () => {
            const { url, serviceKey } = getSupabaseSettings();
            const admin = createClient(url, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });
            const { error: lookupError } = await admin.storage.getBucket(BENEFIT_QR_BUCKET);
            if (!lookupError) return;
            if (Number(lookupError.statusCode) !== 404 && Number(lookupError.status) !== 404) {
              throw new Error(`Could not check BenefitPay QR storage: ${lookupError.message}`);
            }

            const { error: createError } = await admin.storage.createBucket(BENEFIT_QR_BUCKET, {
              public: true,
              fileSizeLimit: 2 * 1024 * 1024,
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
            });
            if (
              createError &&
              Number(createError.statusCode) !== 409 &&
              Number(createError.status) !== 409
            ) {
              throw new Error(`Could not create BenefitPay QR storage: ${createError.message}`);
            }
          })().catch((error) => {
            benefitQrBucketInitialization = undefined;
            throw error;
          });
        }
        await benefitQrBucketInitialization;
      }

      const { error: createError } = await admin.storage.createBucket(ORDER_ASSET_BUCKET, {
        public: false,
        fileSizeLimit: 20 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
      });
      if (
        createError &&
        Number(createError.statusCode) !== 409 &&
        Number(createError.status) !== 409
      ) {
        throw new Error(`Could not create order asset storage: ${createError.message}`);
      }
    })().catch((error) => {
      orderAssetBucketInitialization = undefined;
      throw error;
    });
  }
  await orderAssetBucketInitialization;
}

async function createOrderAssetSignedUrl(path, expiresIn = 60 * 60 * 24 * 7) {
  const { data, error } = await getOrderAssetStorage().createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(`Could not create a preview link for an order design: ${error?.message || 'Unknown storage error.'}`);
  }
  return data.signedUrl;
}

async function signOrderAssetUrls(value) {
  const signedUrls = new Map();
  const visit = async (nestedValue) => {
    if (typeof nestedValue === 'string') {
      const match = nestedValue.match(/^storage:\/\/order-assets\/(.+)$/);
      if (!match) return nestedValue;
      if (!signedUrls.has(match[1])) {
        signedUrls.set(match[1], createOrderAssetSignedUrl(match[1]));
      }
      return signedUrls.get(match[1]);
    }
    if (Array.isArray(nestedValue)) return Promise.all(nestedValue.map(visit));
    if (nestedValue && typeof nestedValue === 'object') {
      const entries = await Promise.all(
        Object.entries(nestedValue).map(async ([key, value]) => [key, await visit(value)])
      );
      return Object.fromEntries(entries);
    }
    return nestedValue;
  };
  return visit(value);
}

function validateOrderAssetReferences(order) {
  const expectedPath = new RegExp(`^${order.id}/asset-(?:[0-9]|[1-9][0-9])\\.(?:jpg|png|svg|webp)$`);
  const visit = (value) => {
    if (typeof value === 'string' && value.startsWith('storage://order-assets/')) {
      const path = value.slice('storage://order-assets/'.length);
      if (!expectedPath.test(path)) {
        throw new Error('Order design files must belong to the order being saved.');
      }
    } else if (Array.isArray(value)) {
      value.forEach(visit);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(visit);
    }
  };
  visit(order);
}

function restoreOrderAssetReferences(order) {
  const { url: supabaseUrl } = getSupabaseSettings();
  const storageOrigin = new URL(supabaseUrl).origin;
  const restore = (value) => {
    if (typeof value === 'string' && /^https:\/\//i.test(value)) {
      try {
        const assetUrl = new URL(value);
        const prefix = '/storage/v1/object/sign/order-assets/';
        if (assetUrl.origin === storageOrigin && assetUrl.pathname.startsWith(prefix)) {
          const path = decodeURIComponent(assetUrl.pathname.slice(prefix.length));
          const expectedPath = new RegExp(`^${order.id}/asset-(?:[0-9]|[1-9][0-9])\\.(?:jpg|png|svg|webp)$`);
          if (expectedPath.test(path)) return `storage://order-assets/${path}`;
        }
      } catch {
        return value;
      }
    }
    if (Array.isArray(value)) return value.map(restore);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, restore(nested)]));
    }
    return value;
  };
  return restore(order);
}

function toOrderRecord(order) {
  if (!order || typeof order.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(order.id) || !Array.isArray(order.items)) {
    throw new Error('Invalid order data.');
  }
  order = restoreOrderAssetReferences(order);
  validateOrderAssetReferences(order);
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
    benefit_qr_url: config.benefitQrUrl || null,
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
    benefitQrUrl: record.benefit_qr_url || '',
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
      const fallback = {
        printFee: 0,
        deliveryFee: 0,
        shopPhone: '',
        shopAddress: '',
        shopEmail: '',
        benefitIban: '',
        benefitPhone: '',
        benefitQrUrl: '',
      };
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

app.post('/api/admin/benefit-qr', async (request, response) => {
  if (!requireAdminSession(request, response)) return;

  const dataUrl = request.body?.dataUrl;
  const match = typeof dataUrl === 'string'
    ? dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/)
    : null;
  if (!match || match[2].length > Math.ceil((2 * 1024 * 1024) / 3) * 4) {
    return response.status(400).json({ error: 'Upload a PNG, JPEG, or WebP QR image no larger than 2 MB.' });
  }

  const contentType = match[1];
  const image = Buffer.from(match[2], 'base64');
  if (!image.length || image.length > 2 * 1024 * 1024) {
    return response.status(400).json({ error: 'Upload a QR image no larger than 2 MB.' });
  }

  try {
    await ensureBenefitQrBucket();
    const { url, serviceKey } = getSupabaseSettings();
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: uploadError } = await admin.storage
      .from(BENEFIT_QR_BUCKET)
      .upload('benefitpay/merchant-qr', image, { contentType, upsert: true });
    if (uploadError) throw new Error(`Could not upload BenefitPay QR image: ${uploadError.message}`);

    const { data } = admin.storage.from(BENEFIT_QR_BUCKET).getPublicUrl('benefitpay/merchant-qr');
    await supabaseRequest('admin_config?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: 'main', benefit_qr_url: data.publicUrl }),
    });
    return response.json({ url: data.publicUrl });
  } catch (error) {
    console.error('BenefitPay QR upload failed:', error.message);
    return response.status(error.statusCode || 502).json({
      error: error.statusCode === 503 ? error.message : 'Could not save the BenefitPay QR image to Supabase.',
    });
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

app.get('/api/graphic-categories', async (_request, response) => {
  try {
    const rows = await supabaseRequest('graphic_categories?select=name&order=name.asc');
    return response.json((rows || []).map((row) => row.name));
  } catch (error) {
    console.error('Supabase graphic categories read failed:', error.message);
    return response.status(error.statusCode || 502).json({
      error: error.statusCode === 503 ? error.message : 'Could not load graphic categories from Supabase.',
    });
  }
});

app.post('/api/admin/graphic-categories', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  const { categories } = request.body || {};
  if (
    !Array.isArray(categories) ||
    categories.length > 30 ||
    categories.some((category) => (
      typeof category !== 'string' ||
      !category.trim() ||
      category.trim().length > 100
    ))
  ) {
    return response.status(400).json({ error: 'Provide up to 30 valid graphic categories.' });
  }

  const records = Array.from(new Set(categories.map((category) => category.trim())))
    .map((name) => ({ name }));
  if (!records.length) return response.json({ saved: true });

  try {
    await supabaseRequest('graphic_categories?on_conflict=name', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(records),
    });
    return response.json({ saved: true });
  } catch (error) {
    console.error('Supabase graphic categories write failed:', error.message);
    return response.status(error.statusCode || 502).json({
      error: error.statusCode === 503 ? error.message : 'Could not save graphic categories to Supabase.',
    });
  }
});

app.delete('/api/admin/graphic-categories/:name', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  const category = request.params.name.trim();
  const replacementCategory = typeof request.body?.replacementCategory === 'string'
    ? request.body.replacementCategory.trim()
    : '';
  if (!category || category.length > 100 || !replacementCategory || replacementCategory.length > 100 || replacementCategory === category) {
    return response.status(400).json({ error: 'A valid replacement category is required.' });
  }

  try {
    const categoryQuery = new URLSearchParams({ name: `eq.${replacementCategory}`, select: 'name', limit: '1' });
    const replacementRows = await supabaseRequest(`graphic_categories?${categoryQuery}`);
    if (!Array.isArray(replacementRows) || !replacementRows.length) {
      return response.status(400).json({ error: 'The replacement category does not exist.' });
    }

    const graphicQuery = new URLSearchParams({ category: `eq.${category}` });
    await supabaseRequest(`graphics?${graphicQuery}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ category: replacementCategory }),
    });

    const deleteQuery = new URLSearchParams({ name: `eq.${category}` });
    await supabaseRequest(`graphic_categories?${deleteQuery}`, { method: 'DELETE' });
    return response.json({ deleted: true });
  } catch (error) {
    console.error('Supabase graphic category delete failed:', error.message);
    return response.status(error.statusCode || 502).json({
      error: error.statusCode === 503 ? error.message : 'Could not delete the graphic category from Supabase.',
    });
  }
});

app.get('/api/admin/orders', async (request, response) => {
  if (!requireAdminSession(request, response)) return;
  try {
    const rows = await supabaseRequest('orders?select=*&order=created_at.desc');
    const orders = await Promise.all((rows || []).map((row) => signOrderAssetUrls(fromOrderRecord(row))));
    return response.json(orders);
  } catch (error) {
    console.error('Supabase orders read failed:', error.message);
    return response.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'Could not load orders from Supabase.' });
  }
});

app.post('/api/orders/assets/sign', async (request, response) => {
  const { orderId, assets } = request.body || {};
  if (typeof orderId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(orderId)) {
    return response.status(400).json({ error: 'Invalid order number for design upload.' });
  }
  if (!Array.isArray(assets) || assets.length < 1 || assets.length > 100) {
    return response.status(400).json({ error: 'The order design asset list is invalid.' });
  }

  try {
    await ensureOrderAssetBucket();
    const uploads = await Promise.all(assets.map(async (asset, index) => {
      const pathMatch = typeof asset?.path === 'string'
        ? asset.path.match(new RegExp(`^${orderId}/asset-${index}\\.(jpg|png|svg|webp)$`))
        : null;
      const contentTypes = {
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        webp: 'image/webp',
      };
      if (!pathMatch || contentTypes[pathMatch[1]] !== asset.contentType) {
        throw new Error('The order design asset metadata is invalid.');
      }

      const { data, error } = await getOrderAssetStorage().createSignedUploadUrl(asset.path, {
        upsert: true,
      });
      if (error || !data?.token) {
        throw new Error(`Could not authorize a design upload: ${error?.message || 'Missing upload token.'}`);
      }
      return { path: asset.path, token: data.token };
    }));
    return response.json({ uploads });
  } catch (error) {
    console.error('Order design upload authorization failed:', error);
    return response.status(error.statusCode || 502).json({
      error: error.message || 'Could not prepare secure storage for the order design files.',
    });
  }
});

function safePrintFilename(value) {
  return String(value || 'ARTWORK').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80);
}

function decodeImageDataUrl(value, filename) {
  const match = typeof value === 'string'
    ? value.match(/^data:(image\/(?:jpeg|png|svg\+xml|webp));(base64),([\s\S]*)$/i)
      || value.match(/^data:(image\/svg\+xml)(?:;charset=[^;,]+)?,([\s\S]*)$/i)
    : null;
  if (!match) throw new Error(`Print asset "${filename}" is not a supported embedded image.`);

  const isBase64 = match.length === 4;
  const contentType = match[1].toLowerCase();
  const data = isBase64 ? match[3] : decodeURIComponent(match[2]);
  const buffer = Buffer.from(data, isBase64 ? 'base64' : 'utf8');
  if (!buffer.length || buffer.length > 20 * 1024 * 1024) {
    throw new Error(`Print asset "${filename}" is empty or exceeds the 20 MB per-file limit.`);
  }
  return { buffer, contentType };
}

async function loadPrintImage(source, filename) {
  if (typeof source !== 'string' || !source) {
    throw new Error(`Print asset "${filename}" is missing its image data.`);
  }
  if (/^\s*<svg\b/i.test(source)) {
    return { buffer: Buffer.from(source), contentType: 'image/svg+xml' };
  }
  if (source.startsWith('data:')) return decodeImageDataUrl(source, filename);
  const storedAsset = source.match(/^storage:\/\/order-assets\/(.+)$/);
  if (storedAsset) {
    const { data, error } = await getOrderAssetStorage().download(storedAsset[1]);
    if (error || !data) {
      throw new Error(`Could not download print asset "${filename}" from order storage.`);
    }
    const contentType = data.type.split(';')[0].toLowerCase();
    const buffer = Buffer.from(await data.arrayBuffer());
    if (!['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(contentType)) {
      throw new Error(`Print asset "${filename}" is not a supported image format.`);
    }
    if (!buffer.length || buffer.length > 20 * 1024 * 1024) {
      throw new Error(`Print asset "${filename}" is empty or exceeds the 20 MB per-file limit.`);
    }
    return { buffer, contentType };
  }

  let assetUrl;
  try {
    assetUrl = new URL(source);
  } catch {
    throw new Error(`Print asset "${filename}" has an invalid source URL.`);
  }
  const { url: supabaseUrl } = getSupabaseSettings();
  if (assetUrl.protocol !== 'https:' || assetUrl.origin !== new URL(supabaseUrl).origin) {
    throw new Error(`Print asset "${filename}" must use embedded data or the configured Supabase storage URL.`);
  }
  const result = await fetch(assetUrl, { signal: AbortSignal.timeout(10000) });
  if (!result.ok) throw new Error(`Could not download print asset "${filename}" from Supabase storage.`);
  const contentType = (result.headers.get('content-type') || '').split(';')[0].toLowerCase();
  if (!['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(contentType)) {
    throw new Error(`Print asset "${filename}" is not a supported image format.`);
  }
  const buffer = Buffer.from(await result.arrayBuffer());
  if (!buffer.length || buffer.length > 20 * 1024 * 1024) {
    throw new Error(`Print asset "${filename}" is empty or exceeds the 20 MB per-file limit.`);
  }
  return { buffer, contentType };
}

async function buildPrintShopAttachments(order) {
  const orderPart = safePrintFilename(order.id);
  const attachments = [];
  let totalBytes = 0;
  const addAttachment = (filename, contentType, content) => {
    totalBytes += content.length;
    if (totalBytes > 25 * 1024 * 1024) {
      throw new Error('The print package exceeds the 25 MB email attachment limit.');
    }
    attachments.push({ filename, contentType, content });
  };

  for (const [itemIndex, item] of order.items.entries()) {
    const itemPart = String(itemIndex + 1).padStart(2, '0');
    const front = item.designPreviews?.front
      || (item.designPreviewSide === 'front' ? item.designPreview : undefined);
    const back = item.designPreviews?.back
      || (item.designPreviewSide === 'back' ? item.designPreview : undefined);
    for (const [side, preview] of [['FRONT', front], ['BACK', back]]) {
      if (!preview) throw new Error(`Item ${itemIndex + 1} is missing its ${side.toLowerCase()} design preview.`);
      const image = await loadPrintImage(preview, `${side} mockup`);
      if (!['image/jpeg', 'image/png'].includes(image.contentType)) {
        throw new Error(`${side} mockups must be saved as JPEG or PNG images.`);
      }
      const mockup = await sharp(image.buffer, { limitInputPixels: 100_000_000 })
        .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
      addAttachment(`SALAPEED-${orderPart}-ITEM-${itemPart}-${side}.jpg`, 'image/jpeg', mockup);
    }

    for (const [placementIndex, placement] of (item.placements || []).entries()) {
      if (placement.type !== 'graphic' && placement.type !== 'upload') continue;
      const name = safePrintFilename(placement.graphicName || `ARTWORK-${placementIndex + 1}`);
      const source = placement.svgContent || placement.printReadyUrl || placement.imageUrl;
      const image = await loadPrintImage(source, name);
      const artwork = await sharp(image.buffer, { limitInputPixels: 100_000_000 })
        .resize({ width: 4096, height: 4096, fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
      addAttachment(
        `SALAPEED-${orderPart}-ITEM-${itemPart}-ART-${String(placementIndex + 1).padStart(2, '0')}-${name}.png`,
        'image/png',
        artwork
      );
    }
  }
  if (!attachments.length) throw new Error('The print package does not contain any attachments.');
  return attachments;
}

function validatePrintShopEmailSettings() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const username = process.env.SMTP_USER;
  const password = process.env.SMTP_PASS;
  const from = process.env.PRINT_SHOP_FROM_EMAIL;
  if (
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !from ||
    (!!username !== !!password)
  ) {
    throw new Error('SMTP email is not configured correctly on the server.');
  }
  return { host, port, username, password, from, secure: process.env.SMTP_SECURE === 'true' || port === 465 };
}

async function sendPrintShopEmail({ to, subject, html, text, attachments }) {
  const settings = validatePrintShopEmailSettings();
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.username ? { user: settings.username, pass: settings.password } : undefined,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 120000,
  });
  try {
    const result = await transporter.sendMail({
      from: settings.from,
      to,
      subject,
      html: html.replace(/src=(['"])data:[\s\S]*?\1/gi, ''),
      text,
      attachments: attachments.map(({ filename, contentType, content }) => ({
        filename,
        content,
        contentType,
      })),
    });
    return result.messageId;
  } catch (error) {
    const details = [error.code, error.command].filter(Boolean).join(' during ');
    throw new Error(
      details ? `SMTP ${details}: ${error.message}` : `SMTP sending failed: ${error.message}`,
      { cause: error }
    );
  } finally {
    transporter.close();
  }
}

async function getSavedOrder(orderId) {
  const query = new URLSearchParams({ id: `eq.${orderId}`, select: '*', limit: '1' });
  const rows = await supabaseRequest(`orders?${query}`);
  return Array.isArray(rows) && rows[0] ? fromOrderRecord(rows[0]) : null;
}

async function getConfiguredPrintShopEmail() {
  const rows = await supabaseRequest('admin_config?select=shop_email&limit=1');
  const email = Array.isArray(rows) ? rows[0]?.shop_email : '';
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('A valid print-shop email address is not configured.');
  }
  return email;
}

async function saveOrder(request, response, adminOnly) {
  if (adminOnly && !requireAdminSession(request, response)) return;
  let record;
  try {
    record = toOrderRecord(request.body);
    await supabaseRequest('orders?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(record),
    });
  } catch (error) {
    console.error('Supabase order write failed:', error.message);
    return response.status(error.statusCode || 400).json({ error: error.statusCode === 503 ? error.message : 'Could not save the order to Supabase.' });
  }

  const savedOrder = fromOrderRecord(record);
  try {
    return response.json({ saved: true, order: await signOrderAssetUrls(savedOrder) });
  } catch (error) {
    console.error(`Order ${record.id} was saved, but preview links could not be signed:`, error);
    return response.json({ saved: true, order: savedOrder });
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
    return response.json(await signOrderAssetUrls(fromOrderRecord(matchedOrder)));
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
  const sessionSecret = getAdminSessionSecret();
  const {
    dispatchType = 'production_release',
    orderId,
    to,
    subject,
    html,
    text,
    bankConfirmed,
  } = request.body || {};
  const isOrderPlacedNotification = dispatchType === 'order_placed';

  if (!isOrderPlacedNotification && !sessionSecret) {
    return response.status(503).json({ error: 'Server-side admin authentication is not configured correctly.' });
  }
  if (dispatchType !== 'production_release' && !isOrderPlacedNotification) {
    return response.status(400).json({ error: 'Invalid print-shop dispatch type.' });
  }
  if (!isOrderPlacedNotification && !hasValidAdminSession(request, sessionSecret)) {
    clearAdminSession(response);
    return response.status(401).json({ error: 'Admin session expired. Sign in again before releasing this order.' });
  }

  if (isOrderPlacedNotification && bankConfirmed !== false) {
    return response.status(400).json({ error: 'New-order notifications must remain pending payment verification.' });
  }
  if (!isOrderPlacedNotification && bankConfirmed !== true) {
    return response.status(400).json({ error: 'Confirm the bank payment before releasing this order.' });
  }
  if (typeof orderId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(orderId)) {
    return response.status(400).json({ error: 'Invalid order number.' });
  }
  if (!isOrderPlacedNotification && (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))) {
    return response.status(400).json({ error: 'Enter a valid print-shop email address.' });
  }
  if (
    typeof subject !== 'string' || subject.length > 200 ||
    typeof html !== 'string' || html.length > 200_000 ||
    typeof text !== 'string' || text.length > 100_000
  ) {
    return response.status(400).json({ error: 'The production email package is incomplete.' });
  }
  try {
    validatePrintShopEmailSettings();
    const order = await getSavedOrder(orderId);
    if (!order) return response.status(404).json({ error: 'The order must be saved before its print package can be sent.' });
    if (isOrderPlacedNotification && order.status !== 'Order placed') {
      return response.status(409).json({ error: 'Order notifications are only allowed before production release.' });
    }
    if (isOrderPlacedNotification) {
      const configuredRecipient = await getConfiguredPrintShopEmail();
      if (typeof to === 'string' && configuredRecipient.toLowerCase() !== to.toLowerCase()) {
        return response.status(403).json({ error: 'Order notifications can only be sent to the configured print-shop email.' });
      }
    }
    const attachments = await buildPrintShopAttachments(order);
    const messageId = await sendPrintShopEmail({
      to: isOrderPlacedNotification ? await getConfiguredPrintShopEmail() : to,
      subject: isOrderPlacedNotification
        ? `Order Received: #${order.id} - ${order.customerName}`
        : subject,
      html,
      text,
      attachments,
    });
    return response.json({ id: messageId });
  } catch (error) {
    console.error('Print-shop dispatch failed:', error);
    const statusCode = /25 MB|20 MB|missing its|supported image|invalid source|configured print-shop email|not configured correctly|must be saved/i.test(error.message)
      ? 400
      : error.statusCode || 502;
    return response.status(statusCode).json({ error: error.message || 'SMTP could not send the print package.' });
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

export function handleApiRequest(request, response, next) {
  app(request, response, next);
}

export default app;