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

function getAdminSessionToken(adminPassword) {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(`${expiresAt}.${randomBytes(24).toString('hex')}`).toString('base64url');
  const signature = createHmac('sha256', adminPassword).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function hasValidAdminSession(request, adminPassword) {
  const cookie = request.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const token = cookie?.slice(ADMIN_SESSION_COOKIE.length + 1);
  const [payload, suppliedSignature] = token?.split('.') || [];
  if (!payload || !suppliedSignature) return false;

  const expectedSignature = createHmac('sha256', adminPassword).update(payload).digest('base64url');
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

app.post('/api/admin/session', (request, response) => {
  const adminPassword = process.env.PRINT_SHOP_RELEASE_TOKEN;
  if (!adminPassword) {
    return response.status(503).json({ error: 'Admin authentication is not configured on the server.' });
  }

  const suppliedPassword = typeof request.body?.password === 'string' ? Buffer.from(request.body.password) : Buffer.alloc(0);
  const configuredPassword = Buffer.from(adminPassword);
  if (suppliedPassword.length !== configuredPassword.length || !timingSafeEqual(suppliedPassword, configuredPassword)) {
    return response.status(401).json({ error: 'Incorrect admin password.' });
  }

  const token = getAdminSessionToken(adminPassword);
  setAdminSessionCookie(response, token, ADMIN_SESSION_MAX_AGE_SECONDS);
  return response.json({ authenticated: true });
});

app.get('/api/admin/session', (request, response) => {
  const adminPassword = process.env.PRINT_SHOP_RELEASE_TOKEN;
  if (!adminPassword) return response.status(503).json({ authenticated: false });
  const authenticated = hasValidAdminSession(request, adminPassword);
  return response.status(authenticated ? 200 : 401).json({ authenticated });
});

app.delete('/api/admin/session', (_request, response) => {
  setAdminSessionCookie(response, '', 0);
  return response.status(204).end();
});

function clearAdminSession(response) {
  setAdminSessionCookie(response, '', 0);
}

app.post('/api/print-shop/dispatch', async (request, response) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const username = process.env.SMTP_USER;
  const password = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const adminPassword = process.env.PRINT_SHOP_RELEASE_TOKEN;
  const from = process.env.PRINT_SHOP_FROM_EMAIL;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !adminPassword || !from || (!!username !== !!password)) {
    return response.status(503).json({ error: 'SMTP email or server-side admin authentication is not configured correctly.' });
  }
  if (!hasValidAdminSession(request, adminPassword)) {
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

app.listen(port, () => {
  console.log(`Salapeed server listening on port ${port}`);
});