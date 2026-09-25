import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { COLOR_OPTIONS, SALAPEED_BRAND, getHoodiePhoto } from '../data/mockData';
import { formatBHD } from '../lib/store';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Check,
  Eye,
  LayoutGrid,
  MessageCircle,
  Instagram,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  Scissors,
  Loader2,
} from 'lucide-react';

interface ProductCatalogueProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onCustomizeDirect?: (product: Product, color: string) => void;
  onBack?: () => void;
}

export const ProductCatalogue: React.FC<ProductCatalogueProps> = ({
  products,
  onSelectProduct,
  onCustomizeDirect,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'kids' | 'pullover' | 'zipper'>('all');
  const [displayLimit, setDisplayLimit] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sorted products as strictly required:
  // 1. Kids Hoodie
  // 2. Adults Fleece Hoodie (Pullover)
  // 3. Adult Zip Hoodie
  const uniqueProducts = [...new Map(products.map((product) => [product.id, product])).values()];
  const sortedProducts = uniqueProducts.sort((a, b) => {
    const orderMap: Record<string, number> = {
      'kids-hoodie': 1,
      'fleece-hoodie': 2,
      'zipper-hoodie': 3,
    };
    return (orderMap[a.id] || 99) - (orderMap[b.id] || 99);
  });

  // Filtered by search and category
  const filteredProducts = sortedProducts.filter((product) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.colors.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.kind && product.kind.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'kids' && product.kind === 'kids') ||
      (selectedCategory === 'pullover' && product.imageType === 'pullover' && product.kind !== 'kids') ||
      (selectedCategory === 'zipper' && product.imageType === 'zipper');

    return matchesSearch && matchesCategory;
  });

  const visibleList = filteredProducts.slice(0, displayLimit);
  const hasMore = displayLimit < filteredProducts.length;

  useEffect(() => {
    setDisplayLimit(6);
  }, [searchQuery, selectedCategory]);

  // Infinite scroll intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayLimit((prev) => Math.min(prev + 6, filteredProducts.length));
            setIsLoadingMore(false);
          }, 450);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredProducts.length]);

  // Store active preview color per product
  const [activeColors, setActiveColors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    products.forEach((p) => {
      initial[p.id] = p.colors[0] || 'Black';
    });
    return initial;
  });

  const handleColorChange = (e: React.MouseEvent, productId: string, colorName: string) => {
    e.stopPropagation();
    setActiveColors((prev) => ({ ...prev, [productId]: colorName }));
  };

  return (
    <div className="space-y-5 pb-16 text-left">
      {/* Top Navigation & Brand Header */}
      <div className="blueprint-card p-4 sm:p-5 bg-gradient-to-br from-[#151820] via-[#0f1116] to-[#0a0c0f] border-neutral-800 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3 mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700/80 text-neutral-300 hover:text-white hover:border-[#39FF14] text-xs font-bold transition cursor-pointer shadow-sm group"
                title="Go back to previous page"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
              <span>HOODIE CATALOGUE &bull; WORKSHOP CUT</span>
            </div>
          </div>

          {/* Contact Links */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <a
              href={SALAPEED_BRAND.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-400 hover:text-green-300 font-bold transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{SALAPEED_BRAND.phone}</span>
            </a>
            <a
              href={SALAPEED_BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-bold transition"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>{SALAPEED_BRAND.instagram}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-wide uppercase">
              Browse Custom Hoodie Blanks
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Heavyweight 380 GSM fleece blanks ready for custom screen print, DTF, or 3D embroidery. Kids hoodies listed #1 first.
            </p>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#39FF14] text-black shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              All Models
            </button>
            <button
              onClick={() => setSelectedCategory('kids')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === 'kids'
                  ? 'bg-[#39FF14] text-black shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              <span>1. Kids Fleece</span>
              <span className="px-1 py-0.2 bg-black/30 rounded text-[9px]">Top</span>
            </button>
            <button
              onClick={() => setSelectedCategory('pullover')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === 'pullover'
                  ? 'bg-[#39FF14] text-black shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              2. Adults Fleece
            </button>
            <button
              onClick={() => setSelectedCategory('zipper')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === 'zipper'
                  ? 'bg-[#39FF14] text-black shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              3. Adult Zip
            </button>
          </div>
        </div>

        {/* Working Search Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hoodie styles, colors (e.g. Charcoal, Navy), or kids sizes..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/60 border border-neutral-800 focus:border-[#39FF14] text-xs text-white placeholder-neutral-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs font-mono text-neutral-400 shrink-0">
            {filteredProducts.length} style{filteredProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Quality Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-neutral-800/60 text-[11px] text-neutral-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
            <span>380 GSM Heavy Fleece</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
            <span>Multi-Zone Placement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
            <span>Double-Stitched Seams</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
            <span>BenefitPay Accepted</span>
          </div>
        </div>
      </div>

      {/* COMPACT PRODUCT CARDS GRID: 3-4 per row on desktop, 2 per row on mobile */}
      {visibleList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
          <p className="text-neutral-400 text-sm">No garments match your search "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-[#39FF14] text-black rounded-lg text-xs font-bold uppercase transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {visibleList.map((product) => {
            const currentColor = activeColors[product.id] || product.colors[0] || 'Black';
            const swatch = COLOR_OPTIONS[currentColor] || COLOR_OPTIONS.Black;
            const isKids = product.kind === 'kids';

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="blueprint-card p-3 rounded-xl flex flex-col justify-between hover:border-[#39FF14]/80 transition-all duration-200 cursor-pointer group bg-[#101217] hover:shadow-[0_8px_25px_rgba(0,0,0,0.7)]"
              >
                <div className="space-y-2">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isKids
                          ? 'bg-[#39FF14] text-black'
                          : 'bg-black/60 text-neutral-300 border border-neutral-800'
                      }`}
                    >
                      {isKids ? 'Kids (Top Pick)' : 'Adults'}
                    </span>
                    <span className="font-bold text-[#39FF14]">
                      {formatBHD(product.basePrice)}
                    </span>
                  </div>

                  {/* Shrunk Hoodie 3D Mockup Stage for More per Row */}
                  <div className="w-full aspect-[4/3] rounded-lg relative overflow-hidden bg-gradient-to-b from-[#181b22] to-[#0e1014] border border-neutral-800/80 p-2 flex items-center justify-center group-hover:border-neutral-700 transition">
                    <div className="w-full h-full max-h-[95%] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 ease-out">
                      <img
                        src={getHoodiePhoto(product.imageType, currentColor, 'front', product)}
                        alt={`${product.name} in ${currentColor}`}
                        className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
                        loading="lazy"
                      />
                    </div>

                    {/* Floating Color Badge */}
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-neutral-700 text-[9px] font-mono text-neutral-300 flex items-center gap-1 shadow">
                      <span
                        className="w-2 h-2 rounded-full border border-neutral-500"
                        style={{ backgroundColor: swatch?.hex || '#222' }}
                      />
                      <span className="truncate max-w-[70px]">{currentColor}</span>
                    </div>
                  </div>

                  {/* Title & Description (Nudged up, clean alignment) */}
                  <div className="pt-0.5">
                    <h3 className="text-xs font-heading font-black text-white group-hover:text-[#39FF14] transition tracking-wide uppercase truncate">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {product.desc}
                    </p>
                  </div>

                  {/* Interactive Color Switcher Bar */}
                  <div className="space-y-1 pt-1 border-t border-neutral-800/60">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Color:</span>
                      <span className="text-neutral-300">{currentColor}</span>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                      {product.colors.slice(0, 5).map((cName) => {
                        const c = COLOR_OPTIONS[cName];
                        const isSelected = cName === currentColor;

                        return (
                          <button
                            key={cName}
                            type="button"
                            onClick={(e) => handleColorChange(e, product.id, cName)}
                            className={`relative w-4 h-4 rounded-full border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                              isSelected
                                ? 'border-[#39FF14] scale-110 shadow-[0_0_6px_rgba(57,255,20,0.6)]'
                                : 'border-neutral-700 hover:border-neutral-400'
                            }`}
                            style={{ backgroundColor: c?.hex || '#222' }}
                            title={`Switch preview to ${cName}`}
                          >
                            {isSelected && (
                              <Check
                                className={`w-2.5 h-2.5 ${
                                  cName === 'White' || cName === 'Heather Grey'
                                    ? 'text-black'
                                    : 'text-[#39FF14]'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="pt-2.5 mt-2 border-t border-neutral-800/80 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCustomizeDirect) {
                        onCustomizeDirect(product, currentColor);
                      } else {
                        onSelectProduct(product);
                      }
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-[11px] uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>Design</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Sentinel & Loader */}
      <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center text-center">
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14] animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more styles...</span>
          </div>
        ) : hasMore ? (
            <button
            onClick={() => setDisplayLimit((prev) => prev + 6)}
            className="px-5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 text-xs font-mono font-bold transition cursor-pointer"
          >
            Scroll or Click to Load More Styles ({filteredProducts.length - visibleList.length} remaining)
          </button>
        ) : (
          <span className="text-[11px] font-mono text-neutral-600">
            &bull; All Bahrain custom styles loaded &bull;
          </span>
        )}
      </div>
    </div>
  );
};
