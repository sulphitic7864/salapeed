import { Product, ColorOption, PrintZone, GraphicItem, AdminConfig, GarmentSide } from '../types';

export const COLOR_OPTIONS: Record<string, ColorOption> = {
  Navy: { name: 'Navy', hex: '#1d2a44', ink: '#f0f4f8' },
  Black: { name: 'Black', hex: '#121417', ink: '#f0f4f8' },
  White: { name: 'White', hex: '#ededee', ink: '#121417' },
  'Heather Grey': { name: 'Heather Grey', hex: '#c5c7cb', ink: '#121417' },
  Red: { name: 'Red', hex: '#b31e24', ink: '#f0f4f8' },
  Charcoal: { name: 'Charcoal', hex: '#2e3238', ink: '#f0f4f8' },
};

export const SALAPEED_BRAND = {
  name: 'Salapeed',
  sloganEn: 'Print . Stitch . Deliver',
  phone: '3661 8183',
  fullPhone: '+973 3661 8183',
  whatsappUrl: 'https://wa.me/97336618183',
  website: 'www.salapeed.bh',
  websiteUrl: 'https://www.salapeed.bh',
  instagram: '@salapeed',
  instagramUrl: 'https://instagram.com/salapeed',
};

export const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const KIDS_SIZES = ['2–3 Years', '4–5 Years', '6–7 Years', '8–9 Years', '10–11 Years', '12 Years'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'fleece-hoodie',
    name: 'Fleece Hoodies',
    brochureTitle: 'FLEECE HOODIES',
    desc: 'Classic street pullover hoodie with kangaroo pouch pocket, double-layer drawstring hood, and 380 GSM brushed fleece warmth.',
    kind: 'adult',
    basePrice: 9.5,
    colors: ['Charcoal', 'Black', 'Navy', 'Heather Grey', 'Red', 'White'],
    sizes: ADULT_SIZES,
    imageType: 'pullover',
    photoUrl: '/images/fleece-hoodie-charcoal.jpg',
    colorPhotos: {
      Charcoal: '/images/fleece-hoodie-charcoal.jpg',
      Black: '/images/hoodie-zipper-black.jpg',
      Navy: '/images/hoodie-zipper-navy.jpg',
      'Heather Grey': '/images/fleece-hoodie-grey.jpg',
      White: '/images/fleece-hoodie-grey.jpg',
      Red: '/images/fleece-hoodie-red.jpg',
    },
    brochurePage: 3,
    sizeChart: {
      headers: ['Size', 'Shoulder (cm)', 'Chest (cm)', 'Length (cm)'],
      rows: [
        { size: 'XS', cells: ['42', '48', '62'] },
        { size: 'S', cells: ['44', '50', '64'] },
        { size: 'M', cells: ['46', '54', '68'] },
        { size: 'L', cells: ['50', '58', '70'] },
        { size: 'XL', cells: ['52', '60', '72'] },
        { size: 'XXL', cells: ['56', '64', '76'] },
      ],
    },
  },
  {
    id: 'zipper-hoodie',
    name: 'Hoodie Zipper',
    brochureTitle: 'HOODIE ZIPPER',
    desc: 'Heavyweight 380 GSM full-zip fleece hoodie with dual split kangaroo pockets, double-lined hood, and smooth metallic front zipper.',
    kind: 'adult',
    basePrice: 11.5,
    colors: ['Navy', 'Black', 'Heather Grey', 'Red'],
    sizes: ADULT_SIZES,
    imageType: 'zipper',
    photoUrl: '/images/hoodie-zipper-navy.jpg',
    colorPhotos: {
      Navy: '/images/hoodie-zipper-navy.jpg',
      Black: '/images/hoodie-zipper-black.jpg',
      'Heather Grey': '/images/fleece-hoodie-grey.jpg',
      Red: '/images/fleece-hoodie-red.jpg',
    },
    brochurePage: 1,
    sizeChart: {
      headers: ['Size', 'Shoulder (cm)', 'Chest (cm)', 'Length (cm)'],
      rows: [
        { size: 'XS', cells: ['42', '48', '62'] },
        { size: 'S', cells: ['44', '50', '64'] },
        { size: 'M', cells: ['46', '54', '68'] },
        { size: 'L', cells: ['50', '58', '70'] },
        { size: 'XL', cells: ['52', '60', '72'] },
        { size: 'XXL', cells: ['56', '64', '76'] },
      ],
    },
  },
  {
    id: 'kids-hoodie',
    name: 'Kids Hoodies',
    brochureTitle: 'KIDS HOODIES',
    desc: 'Cozy, durable kids fleece pullover hoodie for ages 2 to 12 years with kangaroo pocket and reinforced seams.',
    kind: 'kids',
    basePrice: 7.5,
    colors: ['Charcoal', 'Black', 'Navy', 'Heather Grey', 'Red', 'White'],
    sizes: ['2–3 Years', '4–5 Years', '6–7 Years', '8–9 Years', '10–11 Years', '12 Years'],
    imageType: 'kids',
    photoUrl: '/images/kids-hoodie-charcoal.jpg',
    colorPhotos: {
      Charcoal: '/images/kids-hoodie-charcoal.jpg',
      Black: '/images/hoodie-zipper-black.jpg',
      Navy: '/images/hoodie-zipper-navy.jpg',
      'Heather Grey': '/images/fleece-hoodie-grey.jpg',
      White: '/images/fleece-hoodie-grey.jpg',
      Red: '/images/fleece-hoodie-red.jpg',
    },
    brochurePage: 7,
    sizeChart: {
      headers: ['Age Group', 'Chest (cm)', 'Length (cm)'],
      rows: [
        { size: '2–3 Years', cells: ['34–36', '42–44'] },
        { size: '4–5 Years', cells: ['37–39', '46–48'] },
        { size: '6–7 Years', cells: ['40–42', '50–52'] },
        { size: '8–9 Years', cells: ['43–45', '54–56'] },
        { size: '10–11 Years', cells: ['46–48', '58–60'] },
        { size: '12 Years', cells: ['49–51', '62–64'] },
      ],
    },
  },
];

export const PRINT_ZONES: PrintZone[] = [
  // Front View Print Zones (accurately aligned to chest on HD hoodie photos, excluding kangaroo pocket & reserved logo badge)
  {
    id: 'front-centre',
    name: 'Centre Chest (Excl. Logo Reserve)',
    side: 'front',
    boundingBox: { top: 31, left: 30, width: 40, height: 24 },
  },
  {
    id: 'front-left',
    name: 'Left Chest (Reserved Logo Area)',
    side: 'front',
    boundingBox: { top: 31, left: 57, width: 18, height: 17 },
  },
  {
    id: 'front-right',
    name: 'Right Chest (Secondary Logo Area)',
    side: 'front',
    boundingBox: { top: 31, left: 25, width: 18, height: 17 },
  },
  // Back View Print Zones (broad smooth panel excluding collar and hem)
  {
    id: 'back-full',
    name: 'Full Back (Primary Safe Zone)',
    side: 'back',
    boundingBox: { top: 25, left: 26, width: 48, height: 48 },
  },
  {
    id: 'back-upper',
    name: 'Upper Back (Shoulder Span)',
    side: 'back',
    boundingBox: { top: 25, left: 28, width: 44, height: 22 },
  },
  // Sleeve View Print Zones
  {
    id: 'sleeve-left',
    name: 'Sleeve Length (Excl. Cuff)',
    side: 'sleeve',
    boundingBox: { top: 24, left: 32, width: 36, height: 50 },
  },
];

/**
 * Returns genuine high-definition photography for the requested hoodie, color, and side view.
 */
export function getHoodiePhoto(
  imageType: string,
  colorName: string,
  side: GarmentSide,
  product?: Product
): string {
  // High-Definition Back Views
  if (side === 'back') {
    if (imageType === 'zipper') {
      return '/images/hd-zipper-back.jpg';
    }
    return '/images/hd-pullover-back.jpg';
  }

  // High-Definition Sleeve Profile
  if (side === 'sleeve') {
    return '/images/hoodie-sleeve-view.jpg';
  }

  // Front View - High-Definition Photos
  if (imageType === 'zipper') {
    if (colorName === 'Black') return '/images/hd-zipper-front.jpg';
    if (colorName === 'Red') return '/images/fleece-hoodie-red.jpg';
    if (colorName === 'Heather Grey') return '/images/fleece-hoodie-grey.jpg';
    return '/images/hoodie-zipper-navy.jpg';
  }

  if (imageType === 'kids') {
    if (colorName === 'Black') return '/images/hd-zipper-front.jpg';
    if (colorName === 'Navy') return '/images/hoodie-zipper-navy.jpg';
    if (colorName === 'Red') return '/images/fleece-hoodie-red.jpg';
    if (colorName === 'Heather Grey' || colorName === 'White') return '/images/fleece-hoodie-grey.jpg';
    return '/images/kids-hoodie-charcoal.jpg';
  }

  // Pullover Front Views
  if (colorName === 'Charcoal') return '/images/hd-pullover-front.jpg';
  if (colorName === 'Black') return '/images/hd-zipper-front.jpg';
  if (colorName === 'Heather Grey' || colorName === 'White') return '/images/fleece-hoodie-grey.jpg';
  if (colorName === 'Navy') return '/images/hoodie-zipper-navy.jpg';
  if (colorName === 'Red') return '/images/fleece-hoodie-red.jpg';

  if (product?.colorPhotos && product.colorPhotos[colorName]) {
    return product.colorPhotos[colorName];
  }

  return '/images/hd-pullover-front.jpg';
}

export const INITIAL_CATEGORIES = [
  'Cars',
  'Anime',
  'Bahrain',
  'Motivational',
  'Sports',
  'Calligraphy',
];

export const INITIAL_GRAPHICS: GraphicItem[] = [
  // Cars
  {
    id: 'g-cars-1',
    name: 'Turbo Flame GT',
    category: 'Cars',
    tags: ['turbo', 'flame', 'racing', 'speed'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 65 L40 25 L85 25 L65 65 Z" fill="#39FF14" />
      <path d="M25 72 L45 35 L75 35 L60 72 Z" fill="#111" />
      <path d="M10 82 Q35 78 55 60 Q75 45 90 20 Q70 40 50 62 Q30 75 10 82 Z" fill="#ff4d00" />
      <circle cx="50" cy="50" r="12" fill="#fff" />
      <circle cx="50" cy="50" r="7" fill="#ff4d00" />
    </svg>`,
  },
  {
    id: 'g-cars-2',
    name: 'Drift Silhouette',
    category: 'Cars',
    tags: ['drift', 'jdm', 'silhouette', 'smoke'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 68 C15 50 32 46 50 46 C68 46 84 55 92 68 L8 68 Z" fill="#fff" />
      <path d="M22 56 C26 48 38 46 50 46 C62 46 72 50 78 56 Z" fill="#39FF14" />
      <circle cx="28" cy="68" r="9" fill="#111" stroke="#39FF14" stroke-width="2" />
      <circle cx="74" cy="68" r="9" fill="#111" stroke="#39FF14" stroke-width="2" />
      <path d="M5 76 Q20 72 40 76 Q60 80 85 76 Q95 76 98 76" stroke="#ff0055" stroke-width="3" stroke-linecap="round" />
    </svg>`,
  },
  {
    id: 'g-cars-3',
    name: 'Apex Speed 911',
    category: 'Cars',
    tags: ['supercar', 'speed', 'tachometer'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" stroke="#39FF14" stroke-width="4" stroke-dasharray="6 3" />
      <path d="M20 70 A 38 38 0 1 1 80 70" stroke="#fff" stroke-width="6" stroke-linecap="round" />
      <line x1="50" y1="50" x2="72" y2="32" stroke="#ff2200" stroke-width="4" stroke-linecap="round" />
      <circle cx="50" cy="50" r="6" fill="#fff" />
      <text x="50" y="78" text-anchor="middle" fill="#39FF14" font-family="sans-serif" font-weight="900" font-size="12">RPM x1000</text>
    </svg>`,
  },

  // Anime
  {
    id: 'g-anime-1',
    name: 'Katana Samurai Blade',
    category: 'Anime',
    tags: ['samurai', 'katana', 'sword', 'blade'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 85 L85 15" stroke="#fff" stroke-width="5" stroke-linecap="round" />
      <path d="M12 88 L28 72" stroke="#39FF14" stroke-width="8" stroke-linecap="round" />
      <circle cx="50" cy="50" r="34" stroke="#ff0055" stroke-width="3" opacity="0.8" />
      <path d="M40 25 C45 35 48 45 42 60 C55 48 68 40 78 35" stroke="#fff" stroke-width="2" />
      <circle cx="50" cy="50" r="18" fill="#ff0055" opacity="0.4" />
    </svg>`,
  },
  {
    id: 'g-anime-2',
    name: 'Chibi Mecha Cyber',
    category: 'Anime',
    tags: ['chibi', 'mecha', 'cyber', 'robot'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="50" height="42" rx="14" fill="#1b2028" stroke="#39FF14" stroke-width="3" />
      <rect x="34" y="38" width="12" height="6" rx="2" fill="#39FF14" />
      <rect x="54" y="38" width="12" height="6" rx="2" fill="#39FF14" />
      <line x1="50" y1="12" x2="50" y2="25" stroke="#39FF14" stroke-width="3" />
      <circle cx="50" cy="12" r="4" fill="#ff0055" />
      <path d="M38 56 Q50 62 62 56" stroke="#fff" stroke-width="2" stroke-linecap="round" />
      <rect x="35" y="68" width="30" height="20" rx="6" fill="#262d38" stroke="#fff" stroke-width="2" />
    </svg>`,
  },

  // Bahrain
  {
    id: 'g-bahrain-1',
    name: 'F1 Bahrain International Circuit',
    category: 'Bahrain',
    tags: ['f1', 'sakhir', 'circuit', 'racing', 'track'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 70 L20 30 L38 25 L45 42 L65 42 L75 22 L86 35 L80 60 L62 58 L54 75 L35 75 Z" 
            stroke="#ff1e27" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M20 70 L20 30 L38 25 L45 42 L65 42 L75 22 L86 35 L80 60 L62 58 L54 75 L35 75 Z" 
            stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
      <text x="50" y="92" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="9" letter-spacing="1">SAKHIR · BAHRAIN</text>
    </svg>`,
  },
  {
    id: 'g-bahrain-2',
    name: 'Bahrain Flag Crest',
    category: 'Bahrain',
    tags: ['flag', 'crest', 'kingdom', 'serrated'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 18 L80 18 C80 55 60 78 50 84 C40 78 20 55 20 18 Z" fill="#cc1c24" stroke="#ffffff" stroke-width="2" />
      <path d="M20 18 L40 18 L32 25 L40 32 L32 39 L40 46 L32 53 L40 60 L32 67 L20 67 Z" fill="#ffffff" />
      <circle cx="50" cy="50" r="14" fill="#cc1c24" stroke="#ffffff" stroke-width="1.5" />
      <polygon points="50,40 53,47 60,47 55,51 57,58 50,54 43,58 45,51 40,47 47,47" fill="#ffffff" />
    </svg>`,
  },
  {
    id: 'g-bahrain-3',
    name: 'Palm Grove Oasis',
    category: 'Bahrain',
    tags: ['palm', 'tree', 'island', 'tropical'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 85 Q48 55 52 35" stroke="#39FF14" stroke-width="4" stroke-linecap="round" />
      <path d="M52 35 Q30 20 15 32 Q30 36 50 38" fill="#39FF14" />
      <path d="M52 35 Q70 20 85 32 Q70 36 54 38" fill="#39FF14" />
      <path d="M52 35 Q50 10 52 8 Q54 10 54 35" stroke="#39FF14" stroke-width="3" />
      <path d="M52 35 Q35 30 22 45 Q38 44 50 38" fill="#39FF14" opacity="0.8" />
      <path d="M52 35 Q65 30 78 45 Q62 44 54 38" fill="#39FF14" opacity="0.8" />
      <ellipse cx="50" cy="85" rx="35" ry="5" fill="#222" stroke="#39FF14" stroke-width="1" />
    </svg>`,
  },
  {
    id: 'g-bahrain-4',
    name: 'BD Dinar Luxury Mark',
    category: 'Bahrain',
    tags: ['currency', 'dinar', 'bd', 'gold'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" stroke="#f59e0b" stroke-width="4" />
      <circle cx="50" cy="50" r="34" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4 2" />
      <text x="50" y="58" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-weight="900" font-size="28" letter-spacing="-1">BD</text>
      <text x="50" y="74" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700" font-size="9" letter-spacing="2">BHD</text>
    </svg>`,
  },

  // Motivational
  {
    id: 'g-mot-1',
    name: 'Rise & Grind',
    category: 'Motivational',
    tags: ['gym', 'hustle', 'grind', 'motivation'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="15" width="80" height="70" rx="8" fill="#12151a" stroke="#39FF14" stroke-width="2" />
      <text x="50" y="38" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="900" font-size="12" letter-spacing="1">RISE</text>
      <line x1="25" y1="46" x2="75" y2="46" stroke="#39FF14" stroke-width="3" />
      <text x="50" y="62" text-anchor="middle" fill="#39FF14" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">&amp; GRIND</text>
      <text x="50" y="75" text-anchor="middle" fill="#888" font-family="sans-serif" font-weight="700" font-size="7">NO DAYS OFF</text>
    </svg>`,
  },
  {
    id: 'g-mot-2',
    name: 'No Limits Unlimited',
    category: 'Motivational',
    tags: ['nolimits', 'speed', 'energy'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 50 C28 40 38 32 45 42 C52 52 62 60 72 50 C78 44 78 36 70 34 C60 32 50 48 50 50 C50 52 40 68 30 66 C22 64 22 56 28 50 Z" 
            stroke="#39FF14" stroke-width="6" stroke-linecap="round" fill="none" />
      <text x="50" y="82" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="900" font-size="10" letter-spacing="2">NO LIMITS</text>
    </svg>`,
  },

  // Sports
  {
    id: 'g-sports-1',
    name: 'Basketball Hoop Crest',
    category: 'Sports',
    tags: ['basketball', 'dunk', 'ball'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" fill="#e65100" stroke="#fff" stroke-width="3" />
      <line x1="12" y1="50" x2="88" y2="50" stroke="#111" stroke-width="2.5" />
      <line x1="50" y1="12" x2="50" y2="88" stroke="#111" stroke-width="2.5" />
      <path d="M26 22 Q50 50 26 78" stroke="#111" stroke-width="2.5" fill="none" />
      <path d="M74 22 Q50 50 74 78" stroke="#111" stroke-width="2.5" fill="none" />
    </svg>`,
  },
  {
    id: 'g-sports-2',
    name: 'Football Striker Tag',
    category: 'Sports',
    tags: ['football', 'soccer', 'club', 'bahrain'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" fill="#ffffff" stroke="#111" stroke-width="3" />
      <polygon points="50,38 59,45 56,56 44,56 41,45" fill="#111" />
      <line x1="50" y1="38" x2="50" y2="18" stroke="#111" stroke-width="2.5" />
      <line x1="59" y1="45" x2="76" y2="35" stroke="#111" stroke-width="2.5" />
      <line x1="56" y1="56" x2="70" y2="72" stroke="#111" stroke-width="2.5" />
      <line x1="44" y1="56" x2="30" y2="72" stroke="#111" stroke-width="2.5" />
      <line x1="41" y1="45" x2="24" y2="35" stroke="#111" stroke-width="2.5" />
    </svg>`,
  },

  // Calligraphy
  {
    id: 'g-cal-1',
    name: 'Street Script Crest',
    category: 'Calligraphy',
    tags: ['script', 'crest', 'salapeed', 'badge'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" stroke="#39FF14" stroke-width="3" stroke-dasharray="4 2" />
      <path d="M30 65 Q45 75 65 65 Q75 55 60 45 Q40 40 45 25 Q60 20 70 30" 
            stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" />
      <circle cx="35" cy="40" r="3" fill="#39FF14" />
      <circle cx="45" cy="35" r="3" fill="#39FF14" />
      <circle cx="68" cy="45" r="3.5" fill="#39FF14" />
    </svg>`,
  },
  {
    id: 'g-cal-2',
    name: 'Salapeed Speed Mark',
    category: 'Calligraphy',
    tags: ['salapeed', 'speed', 'lettering', 'custom'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 55 L35 48 C50 40 70 42 88 52 C70 60 45 62 20 68 Z" fill="#39FF14" />
      <path d="M25 45 C45 30 65 32 82 45" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" />
      <line x1="10" y1="72" x2="90" y2="72" stroke="#ff0055" stroke-width="2" />
      <text x="50" y="85" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="900" font-size="9" letter-spacing="2">SALAPEED</text>
    </svg>`,
  },
];

export const FONT_OPTIONS = [
  { key: 'condensed', label: 'Condensed Impact', family: "'Barlow Condensed', sans-serif" },
  { key: 'sans', label: 'Modern Street', family: "'Outfit', 'Plus Jakarta Sans', sans-serif" },
  { key: 'mono', label: 'Tech Monospace', family: "ui-monospace, SFMono-Regular, monospace" },
];

export const INK_COLORS = [
  { name: 'Neon Lime', hex: '#39FF14' },
  { name: 'Crisp White', hex: '#ffffff' },
  { name: 'Deep Black', hex: '#0f1114' },
  { name: 'Bahrain Crimson', hex: '#cc1c24' },
  { name: 'Racing Amber', hex: '#f59e0b' },
  { name: 'Cyan Electric', hex: '#06b6d4' },
];

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  printFee: 2.5,
  deliveryFee: 1.5,
  shopPhone: '+973 3661 8183',
  shopAddress: 'Salapeed Workshop & Print Works, Road 2819, Block 428, Seef District, Manama, Kingdom of Bahrain',
  shopEmail: 'orders@salapeed.bh',
  benefitIban: 'BH29 BBME 0000 0012 3456 78',
  benefitPhone: '+973 3661 8183',
  website: 'www.salapeed.bh',
  instagram: '@salapeed',
  sloganEn: 'Print . Stitch . Deliver',
  brandNameEn: 'Salapeed',
};
