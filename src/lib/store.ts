import { useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  GraphicItem,
  AdminConfig,
  OrderStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_GRAPHICS,
  INITIAL_CATEGORIES,
  DEFAULT_ADMIN_CONFIG,
} from '../data/mockData';
import {
  syncOrderToSupabase,
  fetchOrdersFromSupabase,
  syncGraphicToSupabase,
  isSupabaseConfigured,
} from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'salapeed_products_v1',
  GRAPHICS: 'salapeed_graphics_v1',
  CATEGORIES: 'salapeed_categories_v1',
  CART: 'salapeed_cart_v1',
  ORDERS: 'salapeed_orders_v1',
  ADMIN_CONFIG: 'salapeed_admin_config_v1',
  ADMIN_AUTH: 'salapeed_admin_auth_v1',
};

// Seed sample orders for demo & tracking verification
const SAMPLE_ORDERS: Order[] = [
  {
    id: 'SP-8421',
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    customerName: 'Rashid Al-Khalifa',
    customerPhone: '+973 3944 1289',
    customerAddress: 'Villa 14, Road 2204, Block 322, Zinj, Manama',
    paymentMethod: 'Benefit Transfer',
    items: [
      {
        id: 'item-demo-1',
        productId: 'zipper-hoodie',
        productName: 'Zipper Hoodie',
        productDesc: 'Full-zip fleece hoodie',
        imageType: 'zipper',
        color: 'Navy',
        size: 'L',
        placements: [
          {
            id: 'p-1',
            side: 'back',
            zone: 'Full Back',
            type: 'graphic',
            graphicId: 'g-cars-1',
            graphicName: 'Turbo Flame GT',
            x: 50,
            y: 48,
            scale: 1.1,
            rotation: 0,
          },
          {
            id: 'p-2',
            side: 'front',
            zone: 'Left Chest (Small)',
            type: 'text',
            textContent: 'SALAPEED RACING',
            textFont: 'condensed',
            textColor: '#39FF14',
            x: 50,
            y: 50,
            scale: 0.9,
            rotation: 0,
          },
        ],
        summary: 'Back: Turbo Flame GT · Front: "SALAPEED RACING"',
        basePrice: 11.5,
        printFee: 2.5,
        unitPrice: 14.0,
        qty: 1,
        addedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
      },
    ],
    subtotal: 14.0,
    deliveryFee: 1.5,
    total: 15.5,
    status: 'In production / printing',
    statusHistory: [
      {
        status: 'Order placed',
        timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
        note: 'Payment received via BenefitPay.',
      },
      {
        status: 'In production / printing',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        note: 'Garment queued at print shop in Seef, Bahrain.',
      },
    ],
    customerNotes: 'Please call before delivery.',
  },
  {
    id: 'SP-9140',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    customerName: 'Fatima Bucheeri',
    customerPhone: '+973 3611 9822',
    customerAddress: 'Flat 302, Building 881, Road 1421, Riffa Views',
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        id: 'item-demo-2',
        productId: 'fleece-hoodie',
        productName: 'Fleece Hoodie (Pullover)',
        productDesc: 'Classic pullover hoodie',
        imageType: 'pullover',
        color: 'Black',
        size: 'M',
        placements: [
          {
            id: 'p-3',
            side: 'back',
            zone: 'Full Back',
            type: 'graphic',
            graphicId: 'g-bahrain-1',
            graphicName: 'F1 Bahrain International Circuit',
            x: 50,
            y: 50,
            scale: 1.0,
            rotation: 0,
          },
        ],
        summary: 'Back: F1 Bahrain International Circuit',
        basePrice: 9.5,
        printFee: 2.5,
        unitPrice: 12.0,
        qty: 2,
        addedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ],
    subtotal: 24.0,
    deliveryFee: 1.5,
    total: 25.5,
    status: 'Ready for delivery / pickup',
    statusHistory: [
      {
        status: 'Order placed',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        status: 'In production / printing',
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
      },
      {
        status: 'Ready for delivery / pickup',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        note: 'Driver assigned for delivery in Riffa.',
      },
    ],
  },
];

// Helper to format BHD Currency to 3 decimal places
export function formatBHD(amount: number): string {
  return `BD ${Number(amount || 0).toFixed(3)}`;
}

class Store {
  private products: Product[] = [];
  private graphics: GraphicItem[] = [];
  private categories: string[] = [];
  private cart: CartItem[] = [];
  private orders: Order[] = [];
  private config: AdminConfig = DEFAULT_ADMIN_CONFIG;
  private isAdminLoggedIn = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (p) {
        const parsed: Product[] = JSON.parse(p);
        this.products = parsed.map((item) => {
          const init = INITIAL_PRODUCTS.find((ip) => ip.id === item.id);
          if (init) {
            return {
              ...init,
              ...item,
              photoUrl: init.photoUrl,
              colorPhotos: init.colorPhotos,
              brochureTitle: init.brochureTitle,
              brochurePage: init.brochurePage,
              sizes: init.sizes,
              colors: init.colors,
            };
          }
          return item;
        });
      } else {
        this.products = INITIAL_PRODUCTS;
      }

      const g = localStorage.getItem(STORAGE_KEYS.GRAPHICS);
      this.graphics = g ? JSON.parse(g) : INITIAL_GRAPHICS;

      const c = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      this.categories = c ? JSON.parse(c) : INITIAL_CATEGORIES;

      const ct = localStorage.getItem(STORAGE_KEYS.CART);
      this.cart = ct ? JSON.parse(ct) : [];

      const o = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = o ? JSON.parse(o) : SAMPLE_ORDERS;

      const cfg = localStorage.getItem(STORAGE_KEYS.ADMIN_CONFIG);
      this.config = cfg ? { ...DEFAULT_ADMIN_CONFIG, ...JSON.parse(cfg) } : DEFAULT_ADMIN_CONFIG;

      this.isAdminLoggedIn = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';

      // If Supabase is configured, fetch latest orders asynchronously
      if (isSupabaseConfigured) {
        fetchOrdersFromSupabase().then((remoteOrders) => {
          if (remoteOrders && remoteOrders.length > 0) {
            this.orders = remoteOrders;
            this.notify();
          }
        });
      }
    } catch (e) {
      console.error('Error loading store state:', e);
      this.products = INITIAL_PRODUCTS;
      this.graphics = INITIAL_GRAPHICS;
      this.categories = INITIAL_CATEGORIES;
      this.orders = SAMPLE_ORDERS;
      this.config = DEFAULT_ADMIN_CONFIG;
    }
  }

  private save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Getters
  public getProducts() {
    return this.products;
  }
  public getProductById(id: string) {
    return this.products.find((p) => p.id === id) || this.products[0];
  }
  public getGraphics() {
    return this.graphics;
  }
  public getCategories() {
    return this.categories;
  }
  public getCart() {
    return this.cart;
  }
  public getOrders() {
    return this.orders;
  }
  public getConfig() {
    return this.config;
  }
  public getAdminAuth() {
    return this.isAdminLoggedIn;
  }

  // Cart operations
  public addToCart(item: Omit<CartItem, 'id' | 'addedAt'>) {
    const newItem: CartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      addedAt: new Date().toISOString(),
    };
    this.cart = [...this.cart, newItem];
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify();
    return newItem;
  }

  public updateCartQty(id: string, delta: number) {
    this.cart = this.cart
      .map((it) => {
        if (it.id === id) {
          const newQty = it.qty + delta;
          return newQty > 0 ? { ...it, qty: newQty } : null;
        }
        return it;
      })
      .filter((it): it is CartItem => it !== null);

    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public removeFromCart(id: string) {
    this.cart = this.cart.filter((it) => it.id !== id);
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public clearCart() {
    this.cart = [];
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  // Orders operations
  public createOrder(orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    paymentMethod: 'Benefit Transfer' | 'Cash on Delivery';
    notes?: string;
  }): Order {
    const subtotal = this.cart.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
    const deliveryFee = this.config.deliveryFee;
    const total = subtotal + deliveryFee;

    const orderId = `SP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      paymentMethod: orderData.paymentMethod,
      items: [...this.cart],
      subtotal,
      deliveryFee,
      total,
      status: 'Order placed',
      statusHistory: [
        {
          status: 'Order placed',
          timestamp: new Date().toISOString(),
          note: `Order registered via ${orderData.paymentMethod}.`,
        },
      ],
      customerNotes: orderData.notes,
    };

    this.orders = [newOrder, ...this.orders];
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.clearCart();

    // Async sync with Supabase
    syncOrderToSupabase(newOrder);

    this.notify();
    return newOrder;
  }

  public getOrderById(id: string): Order | undefined {
    const trimmed = id.trim().toUpperCase();
    return this.orders.find(
      (o) =>
        o.id.toUpperCase() === trimmed ||
        o.id.toUpperCase().includes(trimmed) ||
        o.customerPhone.replace(/\s+/g, '').includes(trimmed.replace(/\s+/g, ''))
    );
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    this.orders = this.orders.map((o) => {
      if (o.id === orderId) {
        const history = [
          ...o.statusHistory,
          {
            status,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${status}.`,
          },
        ];
        const updated = { ...o, status, statusHistory: history };
        syncOrderToSupabase(updated);
        return updated;
      }
      return o;
    });

    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
  }

  // Graphics CMS operations
  public addGraphic(graphic: Omit<GraphicItem, 'id'>) {
    const newG: GraphicItem = {
      ...graphic,
      id: `g-custom-${Date.now()}`,
      isCustomAdmin: true,
    };
    this.graphics = [newG, ...this.graphics];
    this.save(STORAGE_KEYS.GRAPHICS, this.graphics);
    syncGraphicToSupabase(newG);
    this.notify();
    return newG;
  }

  public deleteGraphic(id: string) {
    this.graphics = this.graphics.filter((g) => g.id !== id);
    this.save(STORAGE_KEYS.GRAPHICS, this.graphics);
    this.notify();
  }

  public addCategory(cat: string) {
    const trimmed = cat.trim();
    if (trimmed && !this.categories.includes(trimmed)) {
      this.categories = [...this.categories, trimmed];
      this.save(STORAGE_KEYS.CATEGORIES, this.categories);
      this.notify();
    }
  }

  // Admin Config & Pricing
  public updateConfig(patch: Partial<AdminConfig>) {
    this.config = { ...this.config, ...patch };
    this.save(STORAGE_KEYS.ADMIN_CONFIG, this.config);
    this.notify();
  }

  public updateProduct(productId: string, patch: Partial<Product>) {
    this.products = this.products.map((p) => {
      if (p.id === productId) {
        return { ...p, ...patch };
      }
      return p;
    });
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
  }

  // Admin Auth
  public adminLogin(pass: string): boolean {
    if (pass === 'salapeed2026' || pass === 'admin' || pass === 'admin123') {
      this.isAdminLoggedIn = true;
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      this.notify();
      return true;
    }
    return false;
  }

  public adminLogout() {
    this.isAdminLoggedIn = false;
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    this.notify();
  }
}

export const store = new Store();

// React Hook for connecting to Store
export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  return {
    products: store.getProducts(),
    graphics: store.getGraphics(),
    categories: store.getCategories(),
    cart: store.getCart(),
    orders: store.getOrders(),
    config: store.getConfig(),
    isAdmin: store.getAdminAuth(),
    addToCart: store.addToCart.bind(store),
    updateCartQty: store.updateCartQty.bind(store),
    removeFromCart: store.removeFromCart.bind(store),
    clearCart: store.clearCart.bind(store),
    createOrder: store.createOrder.bind(store),
    getOrderById: store.getOrderById.bind(store),
    updateOrderStatus: store.updateOrderStatus.bind(store),
    addGraphic: store.addGraphic.bind(store),
    deleteGraphic: store.deleteGraphic.bind(store),
    addCategory: store.addCategory.bind(store),
    updateConfig: store.updateConfig.bind(store),
    updateProduct: store.updateProduct.bind(store),
    adminLogin: store.adminLogin.bind(store),
    adminLogout: store.adminLogout.bind(store),
    loginAdmin: store.adminLogin.bind(store),
    logoutAdmin: store.adminLogout.bind(store),
  };
}

export const useAppStore = useStore;
