import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, GraphicItem, AdminConfig, Product } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database helper functions with graceful fallbacks
export async function syncOrderToSupabase(order: Order): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      created_at: order.createdAt,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_address: order.customerAddress,
      payment_method: order.paymentMethod,
      items: order.items,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      total: order.total,
      status: order.status,
      status_history: order.statusHistory,
      customer_notes: order.customerNotes,
    });
    if (error) {
      console.warn('Supabase order sync error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync caught error:', err);
    return false;
  }
}

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      createdAt: d.created_at,
      customerName: d.customer_name,
      customerPhone: d.customer_phone,
      customerAddress: d.customer_address,
      paymentMethod: d.payment_method,
      items: d.items || [],
      subtotal: Number(d.subtotal),
      deliveryFee: Number(d.delivery_fee),
      total: Number(d.total),
      status: d.status,
      statusHistory: d.status_history || [],
      customerNotes: d.customer_notes,
    }));
  } catch (err) {
    console.warn('Supabase fetch orders error:', err);
    return null;
  }
}

export async function syncGraphicToSupabase(graphic: GraphicItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('graphics').upsert({
      id: graphic.id,
      name: graphic.name,
      category: graphic.category,
      svg_content: graphic.svgContent,
      preview_url: graphic.previewUrl,
      print_ready_url: graphic.printReadyUrl,
      is_custom: graphic.isCustomAdmin,
    });
    return !error;
  } catch {
    return false;
  }
}
