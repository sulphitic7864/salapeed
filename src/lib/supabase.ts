import { Order, GraphicItem, Product, FaqItem, AdminConfig } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

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

export async function syncOrderToSupabase(order: Order, adminUpdate = false): Promise<boolean> {
  const result = await requestJson<{ saved: boolean }>(
    adminUpdate ? '/api/admin/orders' : '/api/orders',
    { method: 'POST', body: JSON.stringify(order) }
  );
  return result?.saved === true;
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
