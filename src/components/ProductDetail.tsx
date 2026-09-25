import React, { useState } from 'react';
import { Product, GarmentSide } from '../types';
import { COLOR_OPTIONS, SALAPEED_BRAND, getHoodiePhoto } from '../data/mockData';
import { formatBHD } from '../lib/store';
import {
  ArrowLeft,
  Ruler,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Scissors,
  Camera,
  Layers as LayersIcon,
  Phone,
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: string) => void;
  onContinueToDesign: () => void;
  onBack: () => void;
  printFee: number;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  onContinueToDesign,
  onBack,
  printFee,
}) => {
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [viewType, setViewType] = useState<'photo' | 'vector'>('photo');
  const [previewSide, setPreviewSide] = useState<GarmentSide>('front');
  const colorData = COLOR_OPTIONS[selectedColor] || COLOR_OPTIONS.Black;
  const totalPrice = product.basePrice + printFee;

  // Realistic photograph for the selected color
  const currentPhoto =
    product.colorPhotos?.[selectedColor] ||
    product.photoUrl ||
    '/images/hoodie-pullover-black-front.jpg';

  return (
    <div className="space-y-6 pb-14">
      {/* Back to Catalogue */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Garment Catalogue</span>
      </button>

      {/* REALISTIC 3D GARMENT HERO SHOWCASE STAGE */}
      <div className="blueprint-card overflow-hidden bg-[#111317] border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-7">
          {/* Left: Realistic Interactive Garment Mockup Stage */}
          <div className="relative w-full aspect-[4/5] max-w-[400px] mx-auto rounded-2xl bg-gradient-to-b from-[#181a22] to-[#0c0d10] border border-neutral-800 p-4 flex flex-col items-center justify-between shadow-2xl overflow-hidden">
            {/* Background Blueprint Grid */}
            <div className="absolute inset-0 sp-stripes-subtle opacity-35 pointer-events-none" />

            {/* Top Bar on Stage: Photo vs Blueprint Toggle */}
            <div className="w-full flex items-center justify-between z-10 gap-2">
              <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono text-[#39FF14] border border-[#39FF14]/30 font-bold uppercase">
                {product.kind === 'kids' ? 'KIDS COLLECTION' : 'ADULT FIT'}
              </span>

              {/* View Switcher: Studio Photo vs Blueprint */}
              <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm p-1 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setViewType('photo')}
                  className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase transition cursor-pointer flex items-center gap-1 ${
                    viewType === 'photo'
                      ? 'bg-neutral-200 text-black shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>Real Photo</span>
                </button>
                <button
                  onClick={() => setViewType('vector')}
                  className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase transition cursor-pointer flex items-center gap-1 ${
                    viewType === 'vector'
                      ? 'bg-[#39FF14] text-black shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <LayersIcon className="w-3 h-3" />
                  <span>360° Angles</span>
                </button>
              </div>
            </div>

            {/* VISUAL DISPLAY: Photo Mode OR Vector Mode */}
            <div className="w-full h-full max-h-[85%] flex items-center justify-center py-2 relative">
              {viewType === 'photo' ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  <div className="absolute bottom-2 w-3/4 h-5 bg-black/50 blur-lg rounded-full" />
                  <img
                    src={currentPhoto}
                    alt={`${product.name} in ${selectedColor}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] animate-fadeIn"
                  />
                  {product.brochureTitle && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-neutral-300 border border-neutral-700">
                      Catalog Page {product.brochurePage || 1}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <img
                    src={getHoodiePhoto(product.imageType, selectedColor, previewSide, product)}
                    alt={`${product.name} - ${previewSide} view`}
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] animate-fadeIn pointer-events-none select-none"
                  />

                  {/* Side Angle Flipper underneath when in vector mode */}
                  <div className="absolute bottom-2 flex items-center gap-1 bg-black/90 p-1 rounded-lg border border-neutral-800 shadow">
                    {(['front', 'back', 'sleeve'] as GarmentSide[]).map((sd) => (
                      <button
                        key={sd}
                        onClick={() => setPreviewSide(sd)}
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase transition cursor-pointer ${
                          previewSide === sd
                            ? 'bg-[#39FF14] text-black shadow'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {sd}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Stage Footnote */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-neutral-400 z-10 pt-2 border-t border-neutral-800/80">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-neutral-500"
                  style={{ backgroundColor: colorData.hex }}
                />
                <span>{selectedColor} Fleece</span>
              </span>
              <span className="text-[#39FF14]">380 GSM Heavyweight</span>
            </div>
          </div>

          {/* Right: Garment Attributes, Color & Size Configuration */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                    SALAPEED · {product.brochureTitle || product.name.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-wide uppercase mt-1">
                  {product.name}
                </h1>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  {product.desc}
                </p>
              </div>

              {/* Fabric Specs Checklist */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-[11px] text-neutral-300 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>380 GSM Ring-Spun</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>Double-needle seams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>Pre-shrunk fleece</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>Front, back & arm zones</span>
                </div>
              </div>

              {/* 1. SELECT GARMENT COLOR */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    1. Fabric Color
                  </label>
                  <span className="text-xs font-mono text-[#39FF14] font-bold">
                    {selectedColor}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((cName) => {
                    const c = COLOR_OPTIONS[cName] || COLOR_OPTIONS.Black;
                    const isSelected = cName === selectedColor;

                    return (
                      <button
                        key={cName}
                        onClick={() => onSelectColor(cName)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'border-[#39FF14] scale-110 shadow-[0_0_12px_rgba(57,255,20,0.6)]'
                            : 'border-neutral-700 hover:border-neutral-500 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={cName}
                      >
                        {isSelected && (
                          <Check
                            className={`w-5 h-5 ${
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

              {/* 2. SELECT SIZE */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Select Size
                  </label>
                  <button
                    onClick={() => setShowSizeChart(!showSizeChart)}
                    className="text-xs text-[#39FF14] hover:underline flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Chart (cm)</span>
                    {showSizeChart ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {product.sizes.map((s) => {
                    const isSelected = s === selectedSize;
                    return (
                      <button
                        key={s}
                        onClick={() => onSelectSize(s)}
                        className={`py-2 px-2 text-xs font-mono font-bold rounded-lg border transition cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SIZE CHART TABLE EXPANDABLE */}
              {showSizeChart && product.sizeChart && (
                <div className="p-3 bg-black/60 rounded-xl border border-neutral-800 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="font-bold text-white">Garment Flat Measurements</span>
                    <span>Values in Centimeters (cm)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-neutral-800 text-neutral-400">
                          {product.sizeChart.headers.map((h, i) => (
                            <th key={i} className="py-1 px-2 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {product.sizeChart.rows.map((row) => (
                          <tr
                            key={row.size}
                            className={`transition ${
                              row.size === selectedSize
                                ? 'bg-[#39FF14]/10 text-[#39FF14] font-bold'
                                : 'text-neutral-300'
                            }`}
                          >
                            <td className="py-1.5 px-2">{row.size}</td>
                            {row.cells.map((c, idx) => (
                              <td key={idx} className="py-1.5 px-2">
                                {c} cm
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Price & Action Button */}
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 block">
                    Garment ({formatBHD(product.basePrice)}) + Print Setup ({formatBHD(printFee)})
                  </span>
                  <span className="text-2xl font-heading font-black text-[#39FF14]">
                    {formatBHD(totalPrice)}
                  </span>
                </div>
                <div className="text-right text-[11px] font-mono text-neutral-400">
                  <span>Custom placement included</span>
                </div>
              </div>

              <button
                onClick={onContinueToDesign}
                className="w-full py-4 px-6 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Continue to Live Design Studio</span>
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Salapeed brand detail */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
                <span>Fulfilled by Salapeed Workshop Bahrain</span>
                <a
                  href={`tel:${SALAPEED_BRAND.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-neutral-300 hover:text-white flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3 h-3 text-[#39FF14]" />
                  <span>Call: {SALAPEED_BRAND.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
