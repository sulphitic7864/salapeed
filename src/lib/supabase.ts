import { Order, GraphicItem, Product, FaqItem, AdminConfig } from '../types';
import { createClient } from '@supabase/supabase-js';

export interface OrderSyncResult {
  saved: boolean;
  order?: Order;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

const ORDER_ASSET_BUCKET = 'order-assets';
const MAX_ORDER_ASSETS = 100;
const MAX_ORDER_ASSET_BYTES = 20 * 1024 * 1024;
const orderAssetStorage = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey).storage.from(ORDER_ASSET_BUCKET)
  : null;

interface PendingOrderAsset {
  path: string;
  contentType: string;
  blob: Blob;
}

function getInlineAsset(value: string): { blob: Blob; extension: string } | null {
  const base64Image = value.match(/^data:(image\/(?:jpeg|png|svg\+xml|webp))(?:;charset=[^;,]+)?;base64,([\s\S]*)$/i);
  if (base64Image) {
    const contentType = base64Image[1].toLowerCase();
    const extension = contentType === 'image/svg+xml'
      ? 'svg'
      : contentType.split('/')[1].replace('jpeg', 'jpg');
    if (base64Image[2].length > Math.ceil(MAX_ORDER_ASSET_BYTES / 3) * 4 + 4) {
      throw new Error('A hoodie design image is empty or exceeds the 20 MB per-file limit.');
    }
    let binary: string;
    try {
      binary = atob(base64Image[2]);
    } catch {
      throw new Error('A hoodie design image is not valid base64 data.');
    }
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    const blob = new Blob([bytes], { type: contentType });
    if (!blob.size || blob.size > MAX_ORDER_ASSET_BYTES) {
      throw new Error('A hoodie design image is empty or exceeds the 20 MB per-file limit.');
    }
    return { blob, extension };
  }

  const svgDataUrl = value.match(/^data:image\/svg\+xml(?:;charset=[^;,]+)?,([\s\S]*)$/i);
  let svg: string | null = null;
  if (svgDataUrl) {
    try {
      svg = decodeURIComponent(svgDataUrl[1]);
    } catch {
      throw new Error('A hoodie design SVG is not valid URL-encoded data.');
    }
  } else if (/^\s*(?:<\?xml[\s\S]*?\?>\s*)?<svg\b/i.test(value)) {
    svg = value;
  }
  if (!svg && /^data:image\//i.test(value)) {
    throw new Error('A hoodie design image uses an unsupported format. Use JPEG, PNG, SVG, or WebP.');
  }
  if (svg !== null) {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    if (!blob.size || blob.size > MAX_ORDER_ASSET_BYTES) {
      throw new Error('A hoodie design image is empty or exceeds the 20 MB per-file limit.');
    }
    return { blob, extension: 'svg' };
  }

  return null;
}

async function externalizeOrderAssets(order: Order): Promise<Order> {
  const assets: PendingOrderAsset[] = [];
  const replacements = new Map<string, string>();

  const visit = (value: unknown): unknown => {
    if (typeof value === 'string') {
      const inlineAsset = getInlineAsset(value);
      if (!inlineAsset) return value;
      const existingReference = replacements.get(value);
      if (existingReference) return existingReference;
      if (assets.length >= MAX_ORDER_ASSETS) {
        throw new Error(`An order may contain no more than ${MAX_ORDER_ASSETS} design images.`);
      }

      const path = `${order.id}/asset-${assets.length}.${inlineAsset.extension}`;
      const reference = `storage://${ORDER_ASSET_BUCKET}/${path}`;
      assets.push({ path, contentType: inlineAsset.blob.type, blob: inlineAsset.blob });
      replacements.set(value, reference);
      return reference;
    }
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, visit(nestedValue)])
      );
    }
    return value;
  };

  const compactOrder = visit(order) as Order;
  if (!assets.length) return compactOrder;
  if (!orderAssetStorage) throw new Error('Order asset storage is not configured.');

  const signResponse = await fetch('/api/orders/assets/sign', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      assets: assets.map(({ path, contentType }) => ({ path, contentType })),
    }),
  });
  const signResult = await signResponse.json().catch(() => ({}));
  if (
    !signResponse.ok ||
    !Array.isArray(signResult.uploads) ||
    signResult.uploads.length !== assets.length
  ) {
    throw new Error(signResult.error || 'Could not prepare secure storage for your design files.');
  }

  for (let start = 0; start < assets.length; start += 4) {
    await Promise.all(assets.slice(start, start + 4).map(async (asset, batchIndex) => {
      const upload = signResult.uploads[start + batchIndex];
      if (upload?.path !== asset.path || typeof upload.token !== 'string') {
        throw new Error('Secure upload authorization did not match the order design files.');
      }
      const { error } = await orderAssetStorage.uploadToSignedUrl(
        asset.path,
        upload.token,
        asset.blob,
        { contentType: asset.contentType, upsert: true }
      );
      if (error) throw new Error(`Could not upload a hoodie design file: ${error.message}`);
    }));
  }

  return compactOrder;
}

export async function requestPasswordRecovery(email: string): Promise<string | null> {
  try {
    const redirectTo = `${window.location.origin}/?reset-password=1`;
    const response = await fetch(`${supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: 'POST',
      headers: { apikey: supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (response.ok) return null;
    const result = await response.json().catch(() => ({}));
    return result.msg || result.message || result.error_description || 'Could not send the recovery email.';
  } catch {
    return 'Could not contact Supabase. Check your connection and try again.';
  }
}

export async function updatePasswordWithRecoveryToken(
  accessToken: string,
  password: string
): Promise<string | null> {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    if (response.ok) return null;
    const result = await response.json().catch(() => ({}));
    return result.msg || result.message || result.error_description || 'Could not update the password.';
  } catch {
    return 'Could not contact Supabase. Check your connection and try again.';
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      console.warn(`Supabase API request failed (${response.status}):`, result.error || response.statusText);
      return null;
    }
    if (response.status === 204) return null;
    return await response.json() as T;
  } catch (error) {
    console.warn('Supabase API request could not be completed:', error);
    return null;
  }
}

export async function syncOrderToSupabase(
  order: Order,
  adminUpdate = false
): Promise<OrderSyncResult> {
  const orderToSave = await externalizeOrderAssets(order);
  const result = await requestJson<OrderSyncResult>(
    adminUpdate ? '/api/admin/orders' : '/api/orders',
    {
      method: 'POST',
      body: JSON.stringify(orderToSave),
    }
  );
  return result ? { ...result, order: result.order || orderToSave } : { saved: false };
}

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  return requestJson<Order[]>('/api/admin/orders');
}

export async function fetchTrackedOrderFromSupabase(lookup: string): Promise<Order | null> {
  return requestJson<Order>(`/api/orders/track?lookup=${encodeURIComponent(lookup)}`);
}

export async function fetchGraphicsFromSupabase(): Promise<GraphicItem[] | null> {
  return requestJson<GraphicItem[]>('/api/graphics');
}

export async function fetchGraphicCategoriesFromSupabase(): Promise<string[] | null> {
  return requestJson<string[]>('/api/graphic-categories');
}

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  return requestJson<Product[]>('/api/products');
}

export async function fetchFaqsFromSupabase(): Promise<FaqItem[] | null> {
  return requestJson<FaqItem[]>('/api/faqs');
}

export async function fetchAdminConfigFromSupabase(): Promise<AdminConfig | null> {
  return requestJson<AdminConfig>('/api/admin/config');
}

export async function syncGraphicToSupabase(graphic: GraphicItem): Promise<boolean> {
  const result = await requestJson<{ saved: boolean }>(
    '/api/admin/graphics',
    { method: 'POST', body: JSON.stringify(graphic) }
  );
  return result?.saved === true;
}

export async function syncGraphicCategoriesToSupabase(categories: string[]): Promise<boolean> {
  const result = await requestJson<{ saved: boolean }>(
    '/api/admin/graphic-categories',
    { method: 'POST', body: JSON.stringify({ categories }) }
  );
  return result?.saved === true;
}

export async function deleteGraphicCategoryFromSupabase(
  category: string,
  replacementCategory: string
): Promise<boolean> {
  const result = await requestJson<{ deleted: boolean }>(
    `/api/admin/graphic-categories/${encodeURIComponent(category)}`,
    {
      method: 'DELETE',
      body: JSON.stringify({ replacementCategory }),
    }
  );
  return result?.deleted === true;
}

export async function syncProductToSupabase(product: Product): Promise<boolean> {
  const result = await requestJson<{ saved: boolean }>(
    '/api/admin/products',
    { method: 'POST', body: JSON.stringify(product) }
  );
  return result?.saved === true;
}

export async function syncAdminConfigToSupabase(config: AdminConfig): Promise<boolean> {
  const result = await requestJson<{ saved: boolean }>(
    '/api/admin/config',
    { method: 'POST', body: JSON.stringify(config) }
  );
  return result?.saved === true;
}

export async function syncFaqToSupabase(faq: FaqItem): Promise<boolean> {
  const result = await requestJson<{ saved: boolean }>(
    '/api/admin/faqs',
    { method: 'POST', body: JSON.stringify(faq) }
  );
  return result?.saved === true;
}

export async function deleteFaqFromSupabase(id: string): Promise<boolean> {
  const result = await requestJson<{ deleted: boolean }>(
    `/api/admin/faqs/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  return result?.deleted === true;
}

export async function deleteGraphicFromSupabase(id: string): Promise<boolean> {
  const result = await requestJson<{ deleted: boolean }>(
    `/api/admin/graphics/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  return result?.deleted === true;
}
