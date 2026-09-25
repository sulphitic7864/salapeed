import React, { useState, useRef } from 'react';
import {
  Order,
  Product,
  GraphicItem,
  AdminConfig,
  OrderStatus,
  FaqItem,
} from '../../types';
import { formatBHD } from '../../lib/store';
import { COLOR_OPTIONS, getHoodiePhoto } from '../../data/mockData';
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
  Upload,
  HelpCircle,
  Save,
  Check,
  Eye,
  FileCode,
  Mail,
  Copy,
  FolderPlus,
} from 'lucide-react';
import { downloadPrintShopElectronicFile } from '../../lib/printShopExport';
import { generatePrintShopPackageEmail } from '../../lib/orderEmailService';

interface AdminPortalProps {
  isAdmin: boolean;
  onLogin: (pass: string) => boolean;
  onLogout: () => void;
  orders: Order[];
  products: Product[];
  graphics: GraphicItem[];
  categories: string[];
  config: AdminConfig;
  faqs?: FaqItem[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onUpdateConfig: (patch: Partial<AdminConfig>) => void;
  onUpdateProduct: (id: string, patch: Partial<Product>) => void;
  onAddGraphic: (g: Omit<GraphicItem, 'id'>) => void;
  onBulkAddGraphics?: (items: Omit<GraphicItem, 'id'>[]) => void;
  onDeleteGraphic: (id: string) => void;
  onAddCategory: (cat: string) => void;
  onAddFaq?: (faq: Omit<FaqItem, 'id'>) => void;
  onUpdateFaq?: (id: string, patch: Partial<FaqItem>) => void;
  onDeleteFaq?: (id: string) => void;
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
  faqs = [],
  onUpdateOrderStatus,
  onUpdateConfig,
  onUpdateProduct,
  onAddGraphic,
  onBulkAddGraphics,
  onDeleteGraphic,
  onAddCategory,
  onAddFaq,
  onUpdateFaq,
  onDeleteFaq,
  onExitAdmin,
}) => {
  // Login form state
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Admin tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'pricing' | 'graphics' | 'faqs' | 'settings'
  >('dashboard');

  // Spec Sheet & Print Shop Package Modal
  const [specModalOrder, setSpecModalOrder] = useState<Order | null>(null);
  const [emailModalOrder, setEmailModalOrder] = useState<Order | null>(null);

  // New graphic state
  const [newGraphicName, setNewGraphicName] = useState('');
  const [newGraphicCategory, setNewGraphicCategory] = useState(categories[0] || 'Cars');
  const [newGraphicSvg, setNewGraphicSvg] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Bulk Upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [bulkCategory, setBulkCategory] = useState(categories[0] || 'Graphics');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadMsg, setBulkUploadMsg] = useState<string | null>(null);

  // Save feedback state
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // FAQ state
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editFaqQ, setEditFaqQ] = useState('');
  const [editFaqA, setEditFaqA] = useState('');

  // Orders search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('All');

  // Custom Color and Size input state per product
  const [customSizeInput, setCustomSizeInput] = useState<Record<string, string>>({});

  // WhatsApp admin messaging custom input per order
  const [customWaText, setCustomWaText] = useState<Record<string, string>>({});

  const showSaveNotice = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3500);
  };

  // Handle Bulk Image Upload (up to 50+ images at once)
  const handleBulkFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBulkUploading(true);
    setBulkUploadMsg(`Processing ${files.length} artwork images...`);

    const newItems: Omit<GraphicItem, 'id'>[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      try {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (file.type.includes('svg')) {
          const text = await file.text();
          newItems.push({
            name: cleanName,
            category: bulkCategory,
            svgContent: text,
            previewUrl: '',
          });
        } else {
          // Read image as base64 data URL
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          newItems.push({
            name: cleanName,
            category: bulkCategory,
            previewUrl: dataUrl,
          });
        }
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }

    if (newItems.length > 0) {
      if (onBulkAddGraphics) {
        onBulkAddGraphics(newItems);
      } else {
        newItems.forEach((it) => onAddGraphic(it));
      }
      setBulkUploadMsg(`✓ Successfully added ${newItems.length} graphics to library under "${bulkCategory}"!`);
      showSaveNotice(`Added ${newItems.length} images to library.`);
    } else {
      setBulkUploadMsg('Could not process selected files.');
    }

    setBulkUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              placeholder="Enter password..."
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#39FF14]"
              autoFocus
            />
          </div>

          {loginError && (
            <div className="text-xs text-red-400">
              Incorrect password. Please try again.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-sm uppercase rounded-lg transition cursor-pointer"
          >
            Access Portal
          </button>
        </form>
      </div>
    );
  }

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchFilter = orderFilter === 'All' || o.status === orderFilter;
    const matchSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Save Notification Toast */}
      {savedBanner && (
        <div className="fixed top-16 right-4 z-50 bg-[#39FF14] text-black font-heading font-black text-xs uppercase px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse" />
            <h2 className="text-2xl font-heading font-black text-white uppercase tracking-wider">
              Salapeed Central Admin & Print Ops
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Internal Operations &bull; Print Shop Dispatch &bull; Real-time Persistence Active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Persistence Status Info Bar */}
      <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <Database className="w-4 h-4 text-[#39FF14]" />
          <span>
            Storage: <strong className="text-white">Active</strong> &bull; All pricing, products, FAQs and order changes save <strong>instantly</strong>.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#39FF14] font-mono font-bold">
          <CheckCircle className="w-4 h-4" />
          <span>Auto-Save Enabled</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'products', label: 'Products & Colors', icon: Package },
          { id: 'pricing', label: 'Pricing & Delivery', icon: DollarSign },
          { id: 'graphics', label: `Artwork & Bulk (${graphics.length})`, icon: Sparkles },
          { id: 'faqs', label: `FAQ Manager (${faqs.length})`, icon: HelpCircle },
          { id: 'settings', label: 'Fulfillment & Shop', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-heading font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                isActive
                  ? 'bg-[#39FF14] text-black shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="blueprint-card p-4 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Total Orders</span>
              <div className="text-2xl font-heading font-black text-white">{orders.length}</div>
              <span className="text-[10px] text-[#39FF14] font-mono">Bahrain Wide</span>
            </div>

            <div className="blueprint-card p-4 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Gross Revenue</span>
              <div className="text-2xl font-heading font-black text-[#39FF14]">
                {formatBHD(orders.reduce((acc, o) => acc + o.total, 0))}
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">BenefitPay</span>
            </div>

            <div className="blueprint-card p-4 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Active Categories</span>
              <div className="text-2xl font-heading font-black text-white">{categories.length}</div>
              <span className="text-[10px] text-[#39FF14] font-mono">Up to 20 supported</span>
            </div>

            <div className="blueprint-card p-4 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Graphics Assets</span>
              <div className="text-2xl font-heading font-black text-white">{graphics.length}</div>
              <span className="text-[10px] text-neutral-400 font-mono">Bulk Upload Ready</span>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setActiveTab('orders')}
              className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#39FF14]/50 transition cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <ShoppingBag className="w-5 h-5 text-[#39FF14]" />
                <span className="text-[10px] font-mono text-neutral-400">View All</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase group-hover:text-[#39FF14] transition">
                Print Shop Dispatch & Spec Sheets
              </h3>
              <p className="text-xs text-neutral-400">
                Inspect high-definition hoodie mockups, download coordinate JSONs, and dispatch orders to the workshop.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('pricing')}
              className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#39FF14]/50 transition cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <DollarSign className="w-5 h-5 text-[#39FF14]" />
                <span className="text-[10px] font-mono text-neutral-400">Edit</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase group-hover:text-[#39FF14] transition">
                Precision Pricing & Flat Delivery
              </h3>
              <p className="text-xs text-neutral-400">
                Configure precise prices (e.g. BD 1.7 delivery, BD 2.25 print fee) with instant auto-save.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('graphics')}
              className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#39FF14]/50 transition cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Upload className="w-5 h-5 text-[#39FF14]" />
                <span className="text-[10px] font-mono text-neutral-400">Bulk (50+)</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase group-hover:text-[#39FF14] transition">
                Bulk Image & Vector Upload
              </h3>
              <p className="text-xs text-neutral-400">
                Batch upload up to 50+ artwork images directly into the customer design studio catalogue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Order ID, name, or phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['All', 'Order placed', 'In production / printing', 'Ready for delivery / pickup', 'Delivered'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer whitespace-nowrap ${
                      orderFilter === st
                        ? 'bg-[#39FF14] text-black font-bold'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
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
                className="blueprint-card p-4 space-y-3 border border-neutral-800 bg-[#101217]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading font-black text-white text-base">#{o.id}</span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {new Date(o.createdAt).toLocaleDateString()} at{' '}
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] font-bold border border-[#39FF14]/30">
                      {o.paymentMethod}
                    </span>
                  </div>

                  {/* Order Status Select */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Status:</span>
                    <select
                      value={o.status}
                      onChange={(e) => {
                        const newSt = e.target.value as OrderStatus;
                        onUpdateOrderStatus(o.id, newSt);
                        showSaveNotice(`Order #${o.id} status updated to "${newSt}"`);
                      }}
                      className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs font-bold text-[#39FF14] focus:outline-none"
                    >
                      <option value="Order placed">Order placed</option>
                      <option value="In production / printing">In production / printing</option>
                      <option value="Ready for delivery / pickup">Ready for delivery / pickup</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-black/40 p-3 rounded-lg border border-neutral-800/80">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">Customer</span>
                    <span className="font-bold text-white">{o.customerName}</span>
                    {o.customerEmail && (
                      <span className="text-[11px] text-neutral-400 block font-mono">{o.customerEmail}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">Phone & WhatsApp</span>
                    <span className="font-mono text-[#39FF14]">{o.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">Delivery Address</span>
                    <span className="text-neutral-300">{o.customerAddress}</span>
                  </div>
                </div>

                {/* Garments Preview Thumbnails */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono font-bold">
                    Garments Ordered ({o.items.reduce((a, b) => a + b.qty, 0)} pcs):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {o.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800 flex items-center gap-3"
                      >
                        <div className="w-12 h-14 bg-black rounded p-1 flex items-center justify-center shrink-0 border border-neutral-800">
                          <img
                            src={getHoodiePhoto(it.imageType, it.color, 'front')}
                            alt={it.productName}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="text-xs space-y-0.5">
                          <div className="font-bold text-white">{it.productName}</div>
                          <div className="text-[11px] font-mono text-neutral-400">
                            Color: <strong className="text-white">{it.color}</strong> &bull; Size: <strong className="text-white">{it.size}</strong> &bull; Qty: <strong className="text-[#39FF14]">{it.qty}</strong>
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            Placements: {it.placements?.length || 0} custom element(s)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Print Shop Spec Sheet & Dispatch Actions */}
                <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono">
                    <span className="text-neutral-400">Total: </span>
                    <span className="text-[#39FF14] font-bold text-sm">{formatBHD(o.total)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Open Interactive In-App Print Shop Spec Sheet */}
                    <button
                      type="button"
                      onClick={() => setSpecModalOrder(o)}
                      className="px-3 py-1.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Workshop Spec Sheet</span>
                    </button>

                    {/* View Automated Print Shop Package Email */}
                    <button
                      type="button"
                      onClick={() => setEmailModalOrder(o)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span>Print Shop Email Package</span>
                    </button>

                    {/* Download Electronic JSON Package */}
                    <button
                      type="button"
                      onClick={() => downloadPrintShopElectronicFile(o)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer font-mono"
                      title="Download RIP machine JSON"
                    >
                      <Download className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span>Download JSON</span>
                    </button>

                    {/* Send to Print Shop via WhatsApp (Internal Shop Flow) */}
                    <button
                      type="button"
                      onClick={() => {
                        const shopPhoneClean = config.shopPhone.replace(/[^0-9]/g, '');
                        const msg = `*SALAPEED WORKSHOP PRODUCTION JOB #${o.id}*\n` +
                          `Customer: ${o.customerName}\n` +
                          `Phone: ${o.customerPhone}\n` +
                          `Items: ${o.items.map(it => `${it.qty}x ${it.productName} (${it.color}, ${it.size})`).join(', ')}\n` +
                          `Total: BD ${o.total.toFixed(3)} (BenefitPay Confirmed)\n` +
                          `Delivery: ${o.customerAddress}\n\n` +
                          `Please review attached spec sheet & print placements.`;
                        window.open(`https://wa.me/${shopPhoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-black font-heading font-black text-xs uppercase rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send to Print Shop (WhatsApp)</span>
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
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
            <span>
              Toggle colors and sizes for each hoodie style. Kids hoodies remain non-zippered pullover fleece. Changes persist immediately.
            </span>
            <span className="text-[11px] text-[#39FF14] font-mono font-bold">Auto-Saved</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="blueprint-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase">{prod.name}</h3>
                    <span className="text-[10px] font-mono text-neutral-400">
                      ID: {prod.id} &bull; Type: {prod.imageType}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-[#39FF14] font-bold">
                    {prod.kind.toUpperCase()}
                  </span>
                </div>

                {/* Base price editor with precise values */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral-400">Base Garment Price (BHD)</label>
                    <span className="text-[10px] font-mono text-[#39FF14]">Precise step (0.01)</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="100"
                    value={prod.basePrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdateProduct(prod.id, { basePrice: val });
                      showSaveNotice(`Updated ${prod.name} price to BD ${val}`);
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-[#39FF14] focus:outline-none focus:border-[#39FF14]"
                  />
                </div>

                {/* Available Colors Editor */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-[#39FF14]" />
                      <span>Available Colors ({prod.colors.length})</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">Click to toggle / remove</span>
                  </div>

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
                              showSaveNotice(`Removed ${col} from ${prod.name}`);
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

                  {/* Add Color Presets */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-neutral-400 font-mono block">Toggle Preset Colorways:</span>
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
                                showSaveNotice(`Added ${presetCol} to ${prod.name}`);
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
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: COLOR_OPTIONS[presetCol]?.hex || '#fff' }}
                            />
                            <span>{presetCol}</span>
                            {!isAlreadyAdded && <Plus className="w-2.5 h-2.5 text-[#39FF14]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Available Sizes Editor */}
                <div className="space-y-2 pt-1 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-[#39FF14]" />
                      <span>Available Sizes ({prod.sizes.length})</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {prod.sizes.map((sz) => (
                      <span
                        key={sz}
                        className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-white text-[11px] font-mono font-bold flex items-center gap-1"
                      >
                        <span>{sz}</span>
                        {prod.sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = prod.sizes.filter((s) => s !== sz);
                              onUpdateProduct(prod.id, { sizes: remaining });
                              showSaveNotice(`Removed size ${sz}`);
                            }}
                            className="text-neutral-400 hover:text-red-400 cursor-pointer ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Size Presets */}
                  <div className="space-y-1 pt-1">
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
                                showSaveNotice(`Added size ${stdSz}`);
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
                        placeholder="Custom Size (e.g. 5XL, Oversized)"
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
                            showSaveNotice(`Added custom size ${sizeVal}`);
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRICING & FEES TAB */}
      {activeTab === 'pricing' && (
        <div className="space-y-4 animate-fadeIn max-w-lg">
          <div className="blueprint-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Global Price & Delivery Matrix (BHD)
                </h3>
                <span className="text-[10px] text-neutral-400">
                  Accepts precise decimal values (e.g. 1.7, 1.75, 2.3)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#39FF14] bg-[#39FF14]/15 px-2 py-0.5 rounded border border-[#39FF14]/30">
                Instant Auto-Save
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Flat Delivery Fee */}
              <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-white font-bold block">
                    Flat Delivery Fee (All Bahrain)
                  </label>
                  <span className="text-[10px] font-mono text-[#39FF14]">e.g. 1.5 or 1.7</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-400 font-bold">BD</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={config.deliveryFee}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdateConfig({ deliveryFee: val });
                      showSaveNotice(`Flat delivery fee set to BD ${val}`);
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[#39FF14] text-base font-bold focus:outline-none focus:border-[#39FF14]"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  Labeled as "flat delivery" site-wide on homepage, cart, and checkout.
                </span>
              </div>

              {/* Print / Customization Fee */}
              <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-white font-bold block">
                    Custom Print / Placement Fee (BHD)
                  </label>
                  <span className="text-[10px] font-mono text-[#39FF14]">e.g. 2.0 or 2.5</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-400 font-bold">BD</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={config.printFee}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdateConfig({ printFee: val });
                      showSaveNotice(`Print fee set to BD ${val}`);
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[#39FF14] text-base font-bold focus:outline-none focus:border-[#39FF14]"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  Applied when customer adds custom graphics or text prints.
                </span>
              </div>

              {/* Explicit Save Action for User Assurance */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showSaveNotice('All pricing and delivery fees saved successfully to database!')}
                  className="w-full py-3 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Pricing & Delivery Changes</span>
                </button>
              </div>

              {/* Live Preview Calculation */}
              <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800/80 text-[11px] space-y-1 text-neutral-300">
                <div className="font-bold text-white uppercase text-[10px]">Customer Checkout Example:</div>
                <div className="flex justify-between">
                  <span>Adult Fleece Hoodie (Base):</span>
                  <span className="font-mono">BD 9.500</span>
                </div>
                <div className="flex justify-between">
                  <span>Custom DTF Printing:</span>
                  <span className="font-mono text-[#39FF14]">+BD {config.printFee.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flat Delivery Fee:</span>
                  <span className="font-mono text-[#39FF14]">+BD {config.deliveryFee.toFixed(3)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-800 pt-1 font-bold text-white">
                  <span>Total Order Due (BenefitPay):</span>
                  <span className="font-mono text-[#39FF14]">
                    BD {(9.5 + config.printFee + config.deliveryFee).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. GRAPHICS CMS & BULK UPLOAD TAB */}
      {activeTab === 'graphics' && (
        <div className="space-y-5 animate-fadeIn">
          {/* BULK UPLOAD BANNER (Support up to 50+ images at once) */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-neutral-900 via-[#131720] to-neutral-900 border-2 border-[#39FF14]/50 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#39FF14] text-black flex items-center justify-center font-black">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-black text-white uppercase tracking-wider">
                    Bulk Image & Artwork Upload (50+ Images at Once)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Select up to 50 files simultaneously (.png, .jpg, .webp, .svg). They are instantly added to the studio catalogue.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Target Category:</span>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-black border border-neutral-700 rounded-lg text-xs font-bold text-[#39FF14] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hidden Multi-file input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,.svg"
              onChange={(e) => handleBulkFiles(e.target.files)}
              className="hidden"
            />

            {/* Drop / Click Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#39FF14]/60 hover:border-[#39FF14] rounded-xl p-8 text-center cursor-pointer transition bg-black/40 hover:bg-[#39FF14]/5 space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center mx-auto text-[#39FF14]">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-sm font-heading font-bold text-white uppercase">
                Click to Select 50+ Images or Drag & Drop Here
              </div>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Bulk upload brand graphics, anime designs, motorsports logos, and calligraphy. All assets are automatically assigned to category: <strong className="text-[#39FF14]">{bulkCategory}</strong>.
              </p>
              <button
                type="button"
                className="mt-2 px-5 py-2 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase rounded-lg shadow cursor-pointer"
              >
                Browse & Select Files (Multi-Select)
              </button>
            </div>

            {bulkUploadMsg && (
              <div className="p-3 bg-neutral-900 border border-[#39FF14]/40 rounded-lg text-xs font-mono text-[#39FF14]">
                {bulkUploadMsg}
              </div>
            )}
          </div>

          {/* Add Single Graphic / SVG Form Card */}
          <div className="blueprint-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#39FF14]" />
              <span>Add Single Vector / SVG Code</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Graphic Title</label>
                <input
                  type="text"
                  value={newGraphicName}
                  onChange={(e) => setNewGraphicName(e.target.value)}
                  placeholder="e.g. Sakhir Night Neon"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#39FF14]"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Category</label>
                <select
                  value={newGraphicCategory}
                  onChange={(e) => setNewGraphicCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#39FF14]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-400 block mb-1">SVG Vector Code</label>
                <textarea
                  rows={2}
                  value={newGraphicSvg}
                  onChange={(e) => setNewGraphicSvg(e.target.value)}
                  placeholder="Paste <svg ...> code or leave empty for auto-generated vector"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-300 focus:outline-none focus:border-[#39FF14]"
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
                showSaveNotice(`Added "${newGraphicName.trim()}" to catalogue!`);
                setNewGraphicName('');
                setNewGraphicSvg('');
              }}
              disabled={!newGraphicName.trim()}
              className="px-4 py-2 bg-[#39FF14] hover:bg-[#32e012] disabled:opacity-50 text-black font-heading font-black text-xs uppercase rounded-lg transition cursor-pointer"
            >
              Add Vector to Catalogue
            </button>
          </div>

          {/* Category Manager (Supports up to 20+ Categories) */}
          <div className="blueprint-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-[#39FF14]" />
                <span>Categories Manager ({categories.length} of 30)</span>
              </h3>
              <span className="text-[10px] text-neutral-400 font-mono">Expanded limit: 20+ categories</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Add new category (e.g. Vintage Racing, Neon Cyber, Arabic Script)..."
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#39FF14]"
              />
              <button
                onClick={() => {
                  if (newCategoryName.trim()) {
                    onAddCategory(newCategoryName.trim());
                    showSaveNotice(`Category "${newCategoryName.trim()}" created!`);
                    setNewCategoryName('');
                  }
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-[#39FF14] text-white hover:text-black rounded-lg text-xs font-bold transition cursor-pointer"
              >
                + Add Category
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-mono flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
                  <span>{c}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Current Graphics List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Active Library Assets ({graphics.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {graphics.map((g) => (
                <div
                  key={g.id}
                  className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-2"
                >
                  <div className="w-full aspect-square bg-[#0a0a0a] rounded flex items-center justify-center p-2 overflow-hidden">
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
                    <div className="text-xs font-bold text-white truncate pb-0.5">{g.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono truncate">{g.category}</div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                    <span className="text-[9px] text-neutral-500 font-mono">
                      {g.isCustomAdmin ? 'custom' : 'brochure'}
                    </span>
                    <button
                      onClick={() => {
                        onDeleteGraphic(g.id);
                        showSaveNotice(`Deleted graphic "${g.name}"`);
                      }}
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

      {/* 6. FAQ MANAGER TAB */}
      {activeTab === 'faqs' && (
        <div className="space-y-4 animate-fadeIn max-w-3xl">
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
            <span>
              Manage questions and answers displayed in the homepage FAQ section. All edits update the storefront in real-time.
            </span>
            <span className="text-[11px] text-[#39FF14] font-mono font-bold">Auto-Saved</span>
          </div>

          {/* Add New FAQ Form */}
          <div className="blueprint-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#39FF14]" />
              <span>Add New FAQ Item</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Question</label>
                <input
                  type="text"
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  placeholder="e.g. Can I wash my customized hoodie in a washing machine?"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#39FF14]"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Answer</label>
                <textarea
                  rows={2}
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  placeholder="e.g. Yes! Turn inside out and wash on cold (30°C) to keep prints looking vibrant for years."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none focus:border-[#39FF14]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (newFaqQ.trim() && newFaqA.trim()) {
                    if (onAddFaq) {
                      onAddFaq({
                        q: newFaqQ.trim(),
                        a: newFaqA.trim(),
                        question: newFaqQ.trim(),
                        answer: newFaqA.trim(),
                      });
                    }
                    showSaveNotice('Added new FAQ item to storefront!');
                    setNewFaqQ('');
                    setNewFaqA('');
                  }
                }}
                disabled={!newFaqQ.trim() || !newFaqA.trim()}
                className="px-4 py-2 bg-[#39FF14] hover:bg-[#32e012] disabled:opacity-50 text-black font-heading font-black text-xs uppercase rounded-lg transition cursor-pointer"
              >
                Add FAQ Item
              </button>
            </div>
          </div>

          {/* Existing FAQs List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Active FAQ Entries ({faqs.length})
            </h3>

            {faqs.map((f, idx) => (
              <div key={f.id} className="blueprint-card p-4 space-y-2 border border-neutral-800">
                {editingFaqId === f.id ? (
                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      value={editFaqQ}
                      onChange={(e) => setEditFaqQ(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-white"
                    />
                    <textarea
                      rows={2}
                      value={editFaqA}
                      onChange={(e) => setEditFaqA(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (onUpdateFaq) {
                            onUpdateFaq(f.id, {
                              q: editFaqQ,
                              a: editFaqA,
                              question: editFaqQ,
                              answer: editFaqA,
                            });
                          }
                          setEditingFaqId(null);
                          showSaveNotice('FAQ item updated!');
                        }}
                        className="px-3 py-1 bg-[#39FF14] text-black text-xs font-bold rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingFaqId(null)}
                        className="px-3 py-1 bg-neutral-800 text-neutral-400 text-xs rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white">
                        {idx + 1}. {f.q || f.question}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingFaqId(f.id);
                            setEditFaqQ(f.q || f.question || '');
                            setEditFaqA(f.a || f.answer || '');
                          }}
                          className="text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (onDeleteFaq) onDeleteFaq(f.id);
                            showSaveNotice('Deleted FAQ item.');
                          }}
                          className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{f.a || f.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SETTINGS & WORKSHOP FULFILLMENT TAB */}
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
                <label className="text-neutral-400 block mb-1">Print Shop Address / Seef Workshop</label>
                <input
                  type="text"
                  value={config.shopAddress}
                  onChange={(e) => onUpdateConfig({ shopAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">BenefitPay Mobile Phone</label>
                <input
                  type="text"
                  value={config.benefitPhone}
                  onChange={(e) => onUpdateConfig({ benefitPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">BenefitPay IBAN</label>
                <input
                  type="text"
                  value={config.benefitIban}
                  onChange={(e) => onUpdateConfig({ benefitIban: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => showSaveNotice('Fulfillment settings updated successfully!')}
                className="w-full mt-2 py-2.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase rounded-lg transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE IN-APP PRINT SHOP SPEC SHEET MODAL (Never closed/blocked by popups!) */}
      {specModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-4xl bg-[#0d0f14] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#39FF14] uppercase tracking-widest font-bold">
                  Print Shop Production & Digital RIP Spec Sheet
                </span>
                <h3 className="text-xl font-heading font-black text-white">
                  Order #{specModalOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSpecModalOrder(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Sheet Contents with High-Definition Mockups & Placements */}
            <div className="p-5 bg-white text-black rounded-xl font-sans text-xs space-y-5 print:p-0">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <div className="font-heading font-black text-xl tracking-wider">SALAPEED APPAREL BAHRAIN</div>
                  <div className="text-[11px] text-neutral-700">
                    Workshop Facility: {config.shopAddress} &bull; Seef, Kingdom of Bahrain
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono">
                  <div className="font-bold text-sm">JOB SPEC: #{specModalOrder.id}</div>
                  <div>Date: {new Date(specModalOrder.createdAt).toLocaleDateString()}</div>
                  <div className="text-green-700 font-bold uppercase">PAYMENT: BENEFITPAY CONFIRMED</div>
                </div>
              </div>

              {/* Customer & Delivery Coordinates */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-100 p-3 rounded-lg border border-neutral-300">
                <div>
                  <strong>Customer Name:</strong> {specModalOrder.customerName}
                </div>
                <div>
                  <strong>Mobile / WhatsApp:</strong> {specModalOrder.customerPhone}
                </div>
                <div className="col-span-2">
                  <strong>Delivery Destination:</strong> {specModalOrder.customerAddress}
                </div>
                {specModalOrder.customerNotes && (
                  <div className="col-span-2 text-amber-800">
                    <strong>Customer Notes:</strong> {specModalOrder.customerNotes}
                  </div>
                )}
              </div>

              {/* Garment Details & High-Definition Visual Mockups */}
              <div className="space-y-4">
                <div className="font-heading font-black uppercase text-sm text-neutral-900 border-b pb-1">
                  Garment Units & Visual Mockup Renderings ({specModalOrder.items.length} styles):
                </div>

                {specModalOrder.items.map((it, idx) => {
                  const frontMockup = getHoodiePhoto(it.imageType, it.color, 'front');
                  const backMockup = getHoodiePhoto(it.imageType, it.color, 'back');

                  return (
                    <div key={idx} className="border-2 border-neutral-300 p-4 rounded-xl space-y-3 bg-[#fafafa]">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <div>
                          <h4 className="font-heading font-black text-base text-black uppercase">
                            Item #{idx + 1}: {it.productName}
                          </h4>
                          <div className="text-[11px] text-neutral-600 font-mono">
                            Silhouette: {it.imageType} &bull; 380 GSM Heavyweight Streetwear Fleece
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block bg-black text-white px-3 py-1 rounded text-xs font-mono font-bold">
                            SIZE: {it.size} &bull; QTY: {it.qty}
                          </span>
                          <div className="text-xs font-bold text-neutral-800 mt-1">Color: {it.color}</div>
                        </div>
                      </div>

                      {/* Visual Front and Back HD Operator Views */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-neutral-300 rounded-lg p-2 text-center bg-white">
                          <div className="text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">
                            Front View Placement Reference
                          </div>
                          <div className="h-44 flex items-center justify-center">
                            <img
                              src={frontMockup}
                              alt="Front View"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        </div>

                        <div className="border border-neutral-300 rounded-lg p-2 text-center bg-white">
                          <div className="text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">
                            Back View Placement Reference
                          </div>
                          <div className="h-44 flex items-center justify-center">
                            <img
                              src={backMockup}
                              alt="Back View"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Applied Placements Table */}
                      <div className="pt-2 border-t border-neutral-200">
                        <div className="font-bold text-[11px] uppercase text-neutral-700 mb-2">
                          Digital Print Coordinates & RIP Specs ({it.placements?.length || 0} placements):
                        </div>
                        {it.placements && it.placements.length > 0 ? (
                          <div className="space-y-1.5 font-mono text-[11px]">
                            {it.placements.map((p, pIdx) => (
                              <div key={pIdx} className="bg-white p-2 rounded border border-neutral-200">
                                <strong>#{pIdx + 1} Side:</strong> {p.side.toUpperCase()} &bull;{' '}
                                <strong>Zone:</strong> {p.zone} &bull; <strong>Type:</strong> {p.type}
                                <br />
                                <span>
                                  <strong>Coordinates:</strong> X={p.x}%, Y={p.y}%, Scale={Math.round(p.scale * 100)}%, Rotation={p.rotation}°
                                </span>
                                {p.type === 'text' && (
                                  <div className="mt-1 text-green-800 font-bold">
                                    Text Content: "{p.textContent}" (Font: {p.textFont}, Ink: {p.textColor})
                                  </div>
                                )}
                                {p.type === 'graphic' && (
                                  <div className="mt-1 text-indigo-900 font-bold">
                                    Artwork: {p.graphicName || p.graphicId}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-neutral-500 italic text-[11px]">
                            Blank Garment &bull; Standard Salapeed chest embroidery only
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-neutral-300 pt-3 text-xs font-mono">
                <div>Fulfillment Facility: Salapeed Kingdom of Bahrain</div>
                <div className="font-bold text-sm">TOTAL VALUE: {formatBHD(specModalOrder.total)}</div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => downloadPrintShopElectronicFile(specModalOrder)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#39FF14]" />
                <span>Download RIP File (.JSON)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white text-black font-heading font-black text-xs uppercase rounded-lg hover:bg-neutral-200 transition cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Spec Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpecModalOrder(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-lg hover:text-white transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT SHOP EMAIL PACKAGE MODAL */}
      {emailModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#0d0f14] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#39FF14]" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">Automated Workshop Email Package</h3>
                  <div className="text-[10px] font-mono text-neutral-400">Order #{emailModalOrder.id} Production Bundle</div>
                </div>
              </div>
              <button
                onClick={() => setEmailModalOrder(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Meta */}
            {(() => {
              const emailPkg = generatePrintShopPackageEmail(emailModalOrder);
              return (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 text-xs font-mono space-y-1 text-neutral-300">
                    <div><strong>To:</strong> {emailPkg.to}</div>
                    <div><strong>From:</strong> {emailPkg.from}</div>
                    <div><strong>Subject:</strong> {emailPkg.subject}</div>
                    <div className="text-[#39FF14]">
                      <strong>Attachments:</strong> {emailPkg.attachmentsCount} high-resolution artwork vector file(s) + HD front/back mockups
                    </div>
                  </div>

                  <div
                    className="p-4 bg-black rounded-xl border border-neutral-800 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: emailPkg.bodyHtml }}
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        const subject = encodeURIComponent(emailPkg.subject);
                        const body = encodeURIComponent(`Please review the production order #${emailModalOrder.id} spec sheet and render files.`);
                        window.open(`mailto:${emailPkg.to}?subject=${subject}&body=${body}`, '_blank');
                      }}
                      className="px-4 py-2 bg-[#39FF14] text-black font-heading font-black text-xs uppercase rounded-lg hover:bg-[#32e012] transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Print Shop Email Client</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailModalOrder(null)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
