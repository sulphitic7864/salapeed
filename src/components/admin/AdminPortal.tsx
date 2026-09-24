import React, { useState } from 'react';
import {
  Order,
  Product,
  GraphicItem,
  AdminConfig,
  OrderStatus,
} from '../../types';
import { formatBHD } from '../../lib/store';
import { COLOR_OPTIONS } from '../../data/mockData';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  Settings,
  DollarSign,
  Printer,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Search,
  ExternalLink,
  Lock,
  Database,
  ArrowLeft,
  X,
  MessageCircle,
  Download,
  Send,
  Palette,
  Ruler,
} from 'lucide-react';
import { downloadPrintShopElectronicFile, openPrintShopSpecSheet } from '../../lib/printShopExport';

interface AdminPortalProps {
  isAdmin: boolean;
  onLogin: (pass: string) => boolean;
  onLogout: () => void;
  orders: Order[];
  products: Product[];
  graphics: GraphicItem[];
  categories: string[];
  config: AdminConfig;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onUpdateConfig: (patch: Partial<AdminConfig>) => void;
  onUpdateProduct: (id: string, patch: Partial<Product>) => void;
  onAddGraphic: (g: Omit<GraphicItem, 'id'>) => void;
  onDeleteGraphic: (id: string) => void;
  onAddCategory: (cat: string) => void;
  onExitAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isAdmin,
  onLogin,
  onLogout,
  orders,
  products,
  graphics,
  categories,
  config,
  onUpdateOrderStatus,
  onUpdateConfig,
  onUpdateProduct,
  onAddGraphic,
  onDeleteGraphic,
  onAddCategory,
  onExitAdmin,
}) => {
  // Login form state
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Admin tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'pricing' | 'graphics' | 'settings'
  >('dashboard');

  // Spec Sheet Modal
  const [specModalOrder, setSpecModalOrder] = useState<Order | null>(null);

  // New graphic state
  const [newGraphicName, setNewGraphicName] = useState('');
  const [newGraphicCategory, setNewGraphicCategory] = useState(categories[0] || 'Cars');
  const [newGraphicSvg, setNewGraphicSvg] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Orders search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('All');

  // Custom Color and Size input state per product
  const [customColorName, setCustomColorName] = useState<Record<string, string>>({});
  const [customColorHex, setCustomColorHex] = useState<Record<string, string>>({});
  const [customSizeInput, setCustomSizeInput] = useState<Record<string, string>>({});

  // WhatsApp admin messaging custom input per order
  const [customWaText, setCustomWaText] = useState<Record<string, string>>({});

  if (!isAdmin) {
    return (
      <div className="py-12 max-w-sm mx-auto space-y-4 text-center">
        <button
          onClick={onExitAdmin}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>

        <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center mx-auto text-[#39FF14]">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-heading font-black text-white uppercase tracking-wider">
            Brand Admin Sign In
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Access Salapeed orders, print shop spec sheets, and graphics CMS.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const ok = onLogin(passInput.trim());
            if (!ok) setLoginError(true);
          }}
          className="blueprint-card p-5 space-y-3.5 text-left"
        >
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Admin Password</label>
            <input
              type="password"
              value={passInput}
              onChange={(e) => {
                setPassInput(e.target.value);
                setLoginError(false);
              }}
              placeholder="Enter password (default: salapeed2026)"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#39FF14]"
              autoFocus
            />
            {loginError && (
              <span className="text-[11px] text-red-400 mt-1 block">
                Invalid password. Try "salapeed2026" or "admin".
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase rounded-lg transition cursor-pointer"
          >
            Authenticate Admin
          </button>
        </form>

        <div className="text-[11px] text-neutral-500 font-mono">
          Salapeed Brand Portal v1.0 · Bahrain
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingProduction = orders.filter((o) => o.status === 'In production / printing').length;
  const readyDelivery = orders.filter((o) => o.status === 'Ready for delivery / pickup').length;

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
    const matchesSearch =
      !orderSearch ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-16">
      {/* Admin Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black border border-[#39FF14]/40 p-1 flex items-center justify-center">
            <img src="/assets/salapeed-logo.svg" alt="Salapeed" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-heading font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Salapeed Brand CMS</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#39FF14]/15 text-[#39FF14] font-bold">
                ADMIN
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-mono">
              Fulfillment Hub · Kingdom of Bahrain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExitAdmin}
            className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
          >
            Storefront
          </button>
          <button
            onClick={onLogout}
            className="px-2.5 py-1 text-xs rounded border border-neutral-700 text-neutral-400 hover:text-red-400 transition cursor-pointer flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-800">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { key: 'orders', label: `Orders (${orders.length})`, icon: Package },
          { key: 'products', label: 'Products & Sizes', icon: ShoppingBag },
          { key: 'pricing', label: 'Pricing & Fees', icon: DollarSign },
          { key: 'graphics', label: `Graphics (${graphics.length})`, icon: Sparkles },
          { key: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition cursor-pointer border-b-2 ${
                isAct
                  ? 'border-[#39FF14] text-[#39FF14] bg-[#39FF14]/5'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="blueprint-card p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Total Orders</span>
              <div className="text-2xl font-heading font-black text-white">{orders.length}</div>
              <span className="text-[10px] text-neutral-500">Recorded to date</span>
            </div>

            <div className="blueprint-card p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Revenue (BHD)</span>
              <div className="text-2xl font-heading font-black text-[#39FF14]">
                {formatBHD(totalRevenue)}
              </div>
              <span className="text-[10px] text-neutral-500">Gross sales</span>
            </div>

            <div className="blueprint-card p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">In Production</span>
              <div className="text-2xl font-heading font-black text-amber-400">{pendingProduction}</div>
              <span className="text-[10px] text-neutral-500">At Bahrain print shop</span>
            </div>

            <div className="blueprint-card p-3.5 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Ready / Dispatch</span>
              <div className="text-2xl font-heading font-black text-blue-400">{readyDelivery}</div>
              <span className="text-[10px] text-neutral-500">Awaiting driver</span>
            </div>
          </div>

          {/* Quick Actions & Recent Orders */}
          <div className="blueprint-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Recent Orders Queue
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-[#39FF14] hover:underline"
              >
                View all orders →
              </button>
            </div>

            <div className="space-y-2">
              {orders.slice(0, 4).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-white">#{o.id}</span>
                      <span className="text-neutral-300 font-medium">{o.customerName}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {o.items.length} item(s) · {o.paymentMethod} · {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#39FF14] font-bold">
                      {formatBHD(o.total)}
                    </span>
                    <button
                      onClick={() => setSpecModalOrder(o)}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3 text-[#39FF14]" />
                      <span>Print Spec</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT VIEW */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders by ID, customer name, or phone..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#39FF14]"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Order placed', 'In production / printing', 'Ready for delivery / pickup'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                      orderFilter === st
                        ? 'bg-[#39FF14] text-black font-bold'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.map((o) => (
              <div
                key={o.id}
                className="blueprint-card p-4 space-y-3 border border-neutral-800 bg-[#121419]"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-lg text-white">#{o.id}</span>
                      <span className="text-xs text-neutral-300 font-semibold">{o.customerName}</span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        ({o.customerPhone})
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Address: {o.customerAddress}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status updater dropdown */}
                    <select
                      value={o.status}
                      onChange={(e) =>
                        onUpdateOrderStatus(
                          o.id,
                          e.target.value as OrderStatus,
                          `Admin manual status change to ${e.target.value}`
                        )
                      }
                      className="bg-neutral-900 border border-neutral-700 text-[#39FF14] font-mono text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                    >
                      <option value="Order placed">Order placed</option>
                      <option value="In production / printing">In production / printing</option>
                      <option value="Ready for delivery / pickup">Ready for delivery / pickup</option>
                      <option value="Delivered">Delivered</option>
                    </select>

                    <button
                      onClick={() => setSpecModalOrder(o)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition cursor-pointer flex items-center gap-1 text-xs"
                      title="Generate Bahrain print shop spec sheet"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span className="hidden sm:inline">Spec Sheet</span>
                    </button>

                    <button
                      onClick={() => downloadPrintShopElectronicFile(o)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[#39FF14] transition cursor-pointer flex items-center gap-1 text-xs border border-neutral-700"
                      title="Download Electronic File (.JSON) for Workshop RIP Printers"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">JSON</span>
                    </button>

                    <button
                      onClick={() => openPrintShopSpecSheet(o)}
                      className="p-1.5 rounded-lg bg-[#39FF14]/15 hover:bg-[#39FF14]/25 text-[#39FF14] border border-[#39FF14]/40 transition cursor-pointer flex items-center gap-1 text-xs"
                      title="Open printable HD workshop spec sheet"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">HD Sheet</span>
                    </button>
                  </div>
                </div>

                {/* Items breakdown */}
                <div className="space-y-1.5 text-xs">
                  {o.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-neutral-900/80 flex items-center justify-between text-neutral-300"
                    >
                      <div>
                        <strong className="text-white">{it.productName}</strong> ({it.color}, {it.size}) × {it.qty}
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          Zones: {it.summary}
                        </div>
                      </div>
                      <span className="font-mono text-neutral-200">
                        {formatBHD(it.unitPrice * it.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 font-mono">
                  <span>
                    Payment: <strong className="text-white">{o.paymentMethod}</strong>
                  </span>
                  <span>
                    Total: <strong className="text-[#39FF14] text-sm">{formatBHD(o.total)}</strong>
                  </span>
                </div>

                {/* WHATSAPP NOTIFICATION DISPATCHER (ADMIN ONLY) */}
                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                      <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                      <span>WhatsApp Customer Notification (Admin Only)</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Target: {o.customerPhone}
                    </span>
                  </div>

                  {/* Preset message buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Hi ${o.customerName}, your Salapeed custom hoodie order #${o.id} is confirmed and queued for printing at our Bahrain workshop! Live tracking: ${window.location.origin}`;
                        const phone = o.customerPhone.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] rounded cursor-pointer transition flex items-center gap-1"
                    >
                      <span>1. Notify: Queued for Print</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Update for ${o.customerName}: Your Salapeed hoodie (Order #${o.id}) is actively printing on our direct-to-garment press in Bahrain. Quality inspection up next!`;
                        const phone = o.customerPhone.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] rounded cursor-pointer transition flex items-center gap-1"
                    >
                      <span>2. Notify: On Press</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Great news ${o.customerName}! Your custom hoodie order #${o.id} has passed QC and is out for delivery to your address in Bahrain. Tracking: ${window.location.origin}`;
                        const phone = o.customerPhone.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="px-2 py-1 bg-green-950/60 hover:bg-green-900/60 text-green-300 border border-green-800 text-[10px] rounded cursor-pointer transition flex items-center gap-1"
                    >
                      <span>3. Notify: Out for Delivery</span>
                    </button>
                  </div>

                  {/* Custom Message Dispatch */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder={`Send custom WhatsApp message to ${o.customerName}...`}
                      value={customWaText[o.id] || ''}
                      onChange={(e) =>
                        setCustomWaText({ ...customWaText, [o.id]: e.target.value })
                      }
                      className="flex-1 px-3 py-1.5 bg-black/60 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const customMsg =
                          customWaText[o.id] ||
                          `Hello ${o.customerName}, this is Salapeed Streetwear regarding your order #${o.id}.`;
                        const phone = o.customerPhone.replace(/[^0-9]/g, '');
                        window.open(
                          `https://wa.me/${phone}?text=${encodeURIComponent(customMsg)}`,
                          '_blank'
                        );
                      }}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-black font-heading font-black text-xs uppercase rounded-lg flex items-center gap-1 cursor-pointer transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-neutral-500 text-xs">
                No orders match your filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PRODUCTS & SIZES / COLORS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400">
            Edit blank garment base prices, colors, and sizes without code deployment. Changes persist across reloads and sync to customers.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="blueprint-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h3 className="text-sm font-bold text-white uppercase">{prod.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {prod.kind}
                  </span>
                </div>

                {/* Base price editor */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Base Garment Price (BHD)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={prod.basePrice}
                    onChange={(e) =>
                      onUpdateProduct(prod.id, { basePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-[#39FF14] focus:outline-none"
                  />
                </div>

                {/* Available Colors Editor */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-[#39FF14]" />
                      <span>Available Colors ({prod.colors.length})</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">Click to toggle or remove</span>
                  </div>

                  {/* Active Color Chips with Remove 'x' */}
                  <div className="flex flex-wrap gap-1.5">
                    {prod.colors.map((col) => (
                      <span
                        key={col}
                        className="px-2 py-1 rounded bg-[#39FF14]/15 border border-[#39FF14] text-white text-[11px] font-mono font-bold flex items-center gap-1.5 shadow"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-white/40"
                          style={{ backgroundColor: COLOR_OPTIONS[col]?.hex || '#444' }}
                        />
                        <span>{col}</span>
                        {prod.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = prod.colors.filter((c) => c !== col);
                              onUpdateProduct(prod.id, { colors: remaining });
                            }}
                            className="text-neutral-400 hover:text-red-400 cursor-pointer ml-0.5"
                            title="Remove color"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Color Presets & Custom Color Form */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-neutral-400 font-mono block">Preset Colorways:</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(COLOR_OPTIONS).map((presetCol) => {
                        const isAlreadyAdded = prod.colors.includes(presetCol);
                        return (
                          <button
                            key={presetCol}
                            type="button"
                            onClick={() => {
                              if (!isAlreadyAdded) {
                                onUpdateProduct(prod.id, { colors: [...prod.colors, presetCol] });
                              }
                            }}
                            disabled={isAlreadyAdded}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition flex items-center gap-1 ${
                              isAlreadyAdded
                                ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-[#39FF14] hover:text-white cursor-pointer'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: COLOR_OPTIONS[presetCol]?.hex }}
                            />
                            <span>{presetCol}</span>
                            {!isAlreadyAdded && <Plus className="w-2.5 h-2.5 text-[#39FF14]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Color Input */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Custom Color Name (e.g. Sage)"
                        value={customColorName[prod.id] || ''}
                        onChange={(e) =>
                          setCustomColorName({ ...customColorName, [prod.id]: e.target.value })
                        }
                        className="flex-1 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#39FF14]"
                      />
                      <input
                        type="color"
                        value={customColorHex[prod.id] || '#336699'}
                        onChange={(e) =>
                          setCustomColorHex({ ...customColorHex, [prod.id]: e.target.value })
                        }
                        className="w-8 h-7 bg-transparent border-0 cursor-pointer rounded"
                        title="Pick color hex"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const name = (customColorName[prod.id] || '').trim();
                          if (name && !prod.colors.includes(name)) {
                            onUpdateProduct(prod.id, { colors: [...prod.colors, name] });
                            setCustomColorName({ ...customColorName, [prod.id]: '' });
                          }
                        }}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-[#39FF14] text-white hover:text-black rounded text-[11px] font-mono font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Available Sizes Editor */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-[#39FF14]" />
                      <span>Available Sizes ({prod.sizes.length})</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">Manage garment size scale</span>
                  </div>

                  {/* Active Size Chips with Remove 'x' */}
                  <div className="flex flex-wrap gap-1.5">
                    {prod.sizes.map((sz) => (
                      <span
                        key={sz}
                        className="px-2 py-1 rounded bg-neutral-800 border border-neutral-600 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 shadow"
                      >
                        <span>{sz}</span>
                        {prod.sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = prod.sizes.filter((s) => s !== sz);
                              onUpdateProduct(prod.id, { sizes: remaining });
                            }}
                            className="text-neutral-400 hover:text-red-400 cursor-pointer ml-0.5"
                            title="Remove size"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Size Presets & Custom Input */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-neutral-400 font-mono block">Standard Sizes:</span>
                    <div className="flex flex-wrap gap-1">
                      {(prod.kind === 'kids'
                        ? ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y']
                        : ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
                      ).map((stdSz) => {
                        const isAdded = prod.sizes.includes(stdSz);
                        return (
                          <button
                            key={stdSz}
                            type="button"
                            onClick={() => {
                              if (!isAdded) {
                                onUpdateProduct(prod.id, { sizes: [...prod.sizes, stdSz] });
                              }
                            }}
                            disabled={isAdded}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition flex items-center gap-1 ${
                              isAdded
                                ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-[#39FF14] hover:text-white cursor-pointer'
                            }`}
                          >
                            <span>{stdSz}</span>
                            {!isAdded && <Plus className="w-2.5 h-2.5 text-[#39FF14]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Size Input */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Custom Size (e.g. Oversized L, 5XL)"
                        value={customSizeInput[prod.id] || ''}
                        onChange={(e) =>
                          setCustomSizeInput({ ...customSizeInput, [prod.id]: e.target.value })
                        }
                        className="flex-1 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#39FF14]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const sizeVal = (customSizeInput[prod.id] || '').trim().toUpperCase();
                          if (sizeVal && !prod.sizes.includes(sizeVal)) {
                            onUpdateProduct(prod.id, { sizes: [...prod.sizes, sizeVal] });
                            setCustomSizeInput({ ...customSizeInput, [prod.id]: '' });
                          }
                        }}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-[#39FF14] text-white hover:text-black rounded text-[11px] font-mono font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Size</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Customer Description</label>
                  <textarea
                    rows={2}
                    value={prod.desc}
                    onChange={(e) => onUpdateProduct(prod.id, { desc: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRICING & FEES TAB */}
      {activeTab === 'pricing' && (
        <div className="space-y-4 animate-fadeIn max-w-md">
          <div className="blueprint-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Global Price Matrix (BHD)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 block">Custom Print / Customization Fee (BHD)</label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-500">BD</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={config.printFee}
                    onChange={(e) =>
                      onUpdateConfig({ printFee: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[#39FF14] text-sm focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-neutral-500">
                  Applied on top of garment base price for customer printing.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 block">Flat Delivery Fee (All Bahrain)</label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-500">BD</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={config.deliveryFee}
                    onChange={(e) =>
                      onUpdateConfig({ deliveryFee: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[#39FF14] text-sm focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-neutral-500">
                  Standard island-wide courier rate across Bahrain.
                </span>
              </div>
            </div>

            <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800 text-[11px] text-neutral-300">
              Live Example: A Zipper Hoodie (BD 11.500) + Print Fee ({formatBHD(config.printFee)}) ={' '}
              <strong className="text-[#39FF14]">{formatBHD(11.5 + config.printFee)}</strong>.
            </div>
          </div>
        </div>
      )}

      {/* 5. GRAPHICS LIBRARY CMS */}
      {activeTab === 'graphics' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Add Graphic Form Card */}
          <div className="blueprint-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#39FF14]" />
              <span>Add New Graphic to Library</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Graphic Title</label>
                <input
                  type="text"
                  value={newGraphicName}
                  onChange={(e) => setNewGraphicName(e.target.value)}
                  placeholder="e.g. Sakhir Night Neon"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Category</label>
                <select
                  value={newGraphicCategory}
                  onChange={(e) => setNewGraphicCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-400 block mb-1">SVG Vector Content</label>
                <textarea
                  rows={3}
                  value={newGraphicSvg}
                  onChange={(e) => setNewGraphicSvg(e.target.value)}
                  placeholder="Paste <svg ...> code or leave empty for default placeholder"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-300 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!newGraphicName.trim()) return;
                onAddGraphic({
                  name: newGraphicName.trim(),
                  category: newGraphicCategory,
                  svgContent:
                    newGraphicSvg.trim() ||
                    `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="20" y="20" width="60" height="60" rx="8" fill="#1b2028" stroke="#39FF14" stroke-width="2"/>
                      <text x="50" y="55" text-anchor="middle" fill="#39FF14" font-family="sans-serif" font-weight="900" font-size="14">${newGraphicName.slice(
                        0,
                        8
                      )}</text>
                    </svg>`,
                });
                setNewGraphicName('');
                setNewGraphicSvg('');
              }}
              disabled={!newGraphicName.trim()}
              className="px-4 py-2 bg-[#39FF14] hover:bg-[#32e012] disabled:opacity-50 text-black font-heading font-black text-xs uppercase rounded-lg transition cursor-pointer"
            >
              Add to Catalogue
            </button>
          </div>

          {/* Add Category Section */}
          <div className="blueprint-card p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Category Manager
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name (e.g. Retro, Cyberpunk)..."
                className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none"
              />
              <button
                onClick={() => {
                  if (newCategoryName.trim()) {
                    onAddCategory(newCategoryName.trim());
                    setNewCategoryName('');
                  }
                }}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] text-neutral-300 font-mono"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Current Graphics List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Active Library Assets ({graphics.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {graphics.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-2"
                >
                  <div className="w-full aspect-square bg-[#0a0a0a] rounded flex items-center justify-center p-2">
                    {g.svgContent ? (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: g.svgContent }}
                      />
                    ) : (
                      <img src={g.previewUrl} alt={g.name} className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate">{g.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{g.category}</div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                    <span className="text-[9px] text-neutral-500 font-mono">
                      {g.isCustomAdmin ? 'custom' : 'brochure'}
                    </span>
                    <button
                      onClick={() => onDeleteGraphic(g.id)}
                      className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                      title="Delete graphic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-4 animate-fadeIn max-w-lg">
          <div className="blueprint-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Bahrain Fulfillment & Payment Config
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">
                  Print Shop WhatsApp Phone (with +973)
                </label>
                <input
                  type="text"
                  value={config.shopPhone}
                  onChange={(e) => onUpdateConfig({ shopPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Print Shop Address / Location</label>
                <textarea
                  rows={2}
                  value={config.shopAddress}
                  onChange={(e) => onUpdateConfig({ shopAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">BenefitPay Mobile Number</label>
                <input
                  type="text"
                  value={config.benefitPhone}
                  onChange={(e) => onUpdateConfig({ benefitPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-[#39FF14] font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">BenefitPay Account IBAN</label>
                <input
                  type="text"
                  value={config.benefitIban}
                  onChange={(e) => onUpdateConfig({ benefitIban: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Database / Cloud Status */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Database className="w-4 h-4 text-[#39FF14]" />
                <span>Supabase Database Backend</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isSupabaseConfigured
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL REPO (STANDALONE)'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {isSupabaseConfigured
                ? 'App is syncing orders and graphics directly with live Supabase database.'
                : 'Using robust client-side storage with instant persistence. To connect your cloud Supabase instance, supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in project secrets.'}
            </p>
          </div>
        </div>
      )}

      {/* BAHRAIN PRINT SHOP SPEC SHEET GENERATOR MODAL */}
      {specModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#111317] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4 my-8 text-left">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#39FF14] text-black font-mono font-bold text-[10px]">
                    PRINT SHOP PRODUCTION SPEC
                  </span>
                  <h3 className="text-lg font-heading font-black text-white">
                    Order #{specModalOrder.id}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Fulfillment Hand-off Sheet for Print Shop in Bahrain
                </p>
              </div>
              <button
                onClick={() => setSpecModalOrder(null)}
                className="p-1 rounded text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Sheet Contents */}
            <div className="p-4 bg-white text-black rounded-xl font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-bold text-sm">SALAPEED APPAREL BAHRAIN</div>
                  <div className="text-[11px] text-neutral-600">
                    Workshop: {config.shopAddress}
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <div>Date: {new Date(specModalOrder.createdAt).toLocaleDateString()}</div>
                  <div>Status: {specModalOrder.status.toUpperCase()}</div>
                </div>
              </div>

              {/* Customer summary */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-neutral-100 p-2 rounded">
                <div>
                  <strong>Customer:</strong> {specModalOrder.customerName}
                </div>
                <div>
                  <strong>Mobile:</strong> {specModalOrder.customerPhone}
                </div>
                <div className="col-span-2">
                  <strong>Delivery:</strong> {specModalOrder.customerAddress}
                </div>
              </div>

              {/* Garment Details & Placement Specs */}
              <div className="space-y-3">
                <div className="font-bold uppercase tracking-wider text-[11px] text-neutral-700">
                  Garment & Print Placement Details:
                </div>
                {specModalOrder.items.map((it, idx) => (
                  <div key={idx} className="border border-neutral-300 p-3 rounded space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span>
                        Garment #{idx + 1}: {it.productName}
                      </span>
                      <span>QTY: {it.qty}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        Blank Color: <strong>{it.color}</strong>
                      </div>
                      <div>
                        Blank Size: <strong>{it.size}</strong>
                      </div>
                      <div>
                        Item Ref: <strong>{it.imageType}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200">
                      <div className="font-bold text-[10px] text-neutral-600 uppercase mb-1">
                        Applied Print Zones ({it.placements.length}):
                      </div>
                      {it.placements.map((p, pIdx) => (
                        <div key={pIdx} className="text-[11px] bg-neutral-50 p-1.5 rounded mb-1">
                          • Side: <strong>{p.side.toUpperCase()}</strong> | Zone:{' '}
                          <strong>{p.zone}</strong> | Type: <strong>{p.type}</strong>
                          <br />
                          Coordinates: X={p.x}%, Y={p.y}%, Scale={p.scale}x, Rot={p.rotation}°
                          {p.type === 'text' && (
                            <div>
                              Text: "{p.textContent}" (Font: {p.textFont}, Ink: {p.textColor}, Arc: {p.textCurve ? 'YES' : 'NO'})
                            </div>
                          )}
                          {p.type === 'graphic' && (
                            <div>Graphic ID: {p.graphicId || p.graphicName}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-300 text-[11px]">
                <div>Payment Method: {specModalOrder.paymentMethod}</div>
                <div className="font-bold">Total Amount: {formatBHD(specModalOrder.total)}</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-neutral-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Spec Sheet</span>
              </button>
              <button
                onClick={() => setSpecModalOrder(null)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-lg hover:text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
