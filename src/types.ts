export type ProductCategory = 'adult' | 'kids';

export interface ColorOption {
  name: string;
  hex: string;
  ink: string; // contrasting color for outlines/guides ('#ffffff' or '#111111')
}

export interface SizeChart {
  headers: string[];
  rows: { size: string; cells: string[] }[];
}

export interface Product {
  id: string;
  name: string;
  brochureTitle?: string;
  desc: string;
  kind: ProductCategory;
  basePrice: number;
  colors: string[];
  sizes: string[];
  imageType: 'zipper' | 'pullover' | 'jacket' | 'kids';
  sizeChart: SizeChart;
  photoUrl?: string;
  colorPhotos?: Record<string, string>;
  brochurePage?: number;
}

export type GarmentSide = 'front' | 'back' | 'sleeve';

export interface PrintZone {
  id: string;
  name: string;
  side: GarmentSide;
  boundingBox: {
    top: number; // percentage
    left: number; // percentage
    width: number; // percentage
    height: number; // percentage
  };
}

export type ElementType = 'graphic' | 'upload' | 'text';

export interface PlantedElement {
  id: string;
  side: GarmentSide;
  zone: string;
  type: ElementType;
  graphicId?: string;
  graphicName?: string;
  svgContent?: string;
  imageUrl?: string;
  isLowRes?: boolean;
  // Text specific
  textContent?: string;
  textFont?: 'condensed' | 'sans' | 'mono';
  textColor?: string;
  textCurve?: boolean;
  // Position & transform
  x: number; // percentage 0..100 within zone or side
  y: number; // percentage 0..100 within zone or side
  scale: number; // 0.5 to 2.0
  rotation: number; // degrees -180 to 180
}

export interface GraphicItem {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  svgContent?: string;
  previewUrl?: string;
  printReadyUrl?: string;
  isCustomAdmin?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productDesc: string;
  imageType: 'zipper' | 'pullover' | 'jacket' | 'kids';
  color: string;
  size: string;
  placements: PlantedElement[];
  summary: string;
  basePrice: number;
  printFee: number;
  unitPrice: number;
  qty: number;
  addedAt: string;
}

export type OrderStatus =
  | 'Order placed'
  | 'In production / printing'
  | 'Ready for delivery / pickup'
  | 'Delivered';

export interface Order {
  id: string; // e.g. SP-8421
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: 'BenefitPay' | 'Benefit Transfer';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  customerNotes?: string;
}

export interface AdminConfig {
  printFee: number;
  deliveryFee: number;
  shopPhone: string;
  shopAddress: string;
  shopEmail: string;
  benefitIban: string;
  benefitPhone: string;
  website?: string;
  instagram?: string;
  sloganEn?: string;
  brandNameEn?: string;
}
