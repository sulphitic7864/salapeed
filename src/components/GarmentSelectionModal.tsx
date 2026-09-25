import React, { useState } from 'react';
import { Product } from '../types';
import { COLOR_OPTIONS, getHoodiePhoto } from '../data/mockData';
import { Sparkles, Check, ArrowRight, X, AlertCircle } from 'lucide-react';

interface GarmentSelectionModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onConfirmSelection: (product: Product, color: string, size: string) => void;
}

export const GarmentSelectionModal: React.FC<GarmentSelectionModalProps> = ({
  isOpen,
  products,
  onClose,
  onConfirmSelection,
}) => {
  // STRICT RULE: NOTHING is pre-selected
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  if (!isOpen) return null;

  // Reorder products strictly as required:
  // 1. Kids Hoodie
  // 2. Adults Fleece Hoodie (Pullover)
  // 3. Adult Zip Hoodie
  const orderedProducts = [...products].sort((a, b) => {
    const orderMap: Record<string, number> = {
      'kids-hoodie': 1,
      'fleece-hoodie': 2,
      'zipper-hoodie': 3,
    };
    return (orderMap[a.id] || 99) - (orderMap[b.id] || 99);
  });

  const selectedProduct = orderedProducts.find((p) => p.id === selectedProductId) || null;

  // Available colors for the chosen product
  const availableColors = selectedProduct
    ? selectedProduct.colors.filter((c) => selectedProduct.colorPhotos?.[c] || COLOR_OPTIONS[c])
    : [];

  const isFormComplete =
    selectedProduct !== null && selectedSize !== null && selectedColor !== null;

  const handleProceed = () => {
    if (!selectedProduct || !selectedSize || !selectedColor) return;
    onConfirmSelection(selectedProduct, selectedColor, selectedSize);
  };

  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    // Reset subsequent steps if product changes so user makes deliberate choices
    setSelectedSize(null);
    setSelectedColor(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0e1015] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between bg-gradient-to-r from-neutral-900 via-[#12141a] to-neutral-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#39FF14] font-bold">
                Step-by-Step Garment Configuration
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-black text-white uppercase tracking-wider mt-0.5">
              Configure Your Hoodie Blank
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 text-left">
          {/* Deliberate Selection Notice */}
          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
            <p>
              Please pick your <strong>Hoodie Type</strong>, then <strong>Age / Size</strong>, and then your <strong>Garment Color</strong>. Nothing is pre-selected to prevent accidental size or garment errors.
            </p>
          </div>

          {/* STEP 1: HOODIE TYPE (Ordered: Kids 1st, Adults Fleece 2nd, Adult Zip 3rd) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
              <span>Step 1: Pick Hoodie Type</span>
              {selectedProduct && (
                <span className="text-[10px] font-mono text-[#39FF14] font-bold">
                  ✓ {selectedProduct.name.toUpperCase()}
                </span>
              )}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {orderedProducts.map((prod, idx) => {
                const isSelected = selectedProductId === prod.id;
                const isKids = prod.kind === 'kids';

                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectProduct(prod.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_14px_rgba(57,255,20,0.25)]'
                        : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    {isKids && (
                      <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 bg-[#39FF14] text-black text-[9px] font-mono font-black rounded uppercase shadow">
                        #1 Popular
                      </span>
                    )}

                    <div className="w-full h-24 mb-2 rounded-lg bg-black/40 p-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={prod.photoUrl}
                        alt={prod.name}
                        className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold uppercase text-white truncate">
                        {idx + 1}. {prod.name}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#39FF14] bg-[#39FF14]'
                            : 'border-neutral-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2">
                      {isKids
                        ? 'Plain fleece pullover (no zippers) · Ages 2–12Y'
                        : prod.imageType === 'zipper'
                        ? 'Heavy metallic zipper · 380 GSM fleece'
                        : 'Classic pullover pouch hoodie · 380 GSM'}
                    </p>

                    <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">Base</span>
                      <span className="text-[#39FF14] font-bold">BD {prod.basePrice.toFixed(3)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: AGE & SIZE (Only appears once Hoodie Type is picked) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
              <span>Step 2: Choose Age & Size</span>
              {selectedSize && (
                <span className="text-[10px] font-mono text-[#39FF14] font-bold">
                  ✓ SIZE: {selectedSize}
                </span>
              )}
            </label>

            {!selectedProduct ? (
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-500 text-xs text-center italic">
                ← Please select a hoodie type above first to see matching sizes
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-neutral-400 mb-2">
                  {selectedProduct.kind === 'kids'
                    ? 'Youth & Children Sizing (Age-specific cuts):'
                    : 'Adult Unisex Sizing (Comfort fit):'}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {selectedProduct.sizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 px-2.5 rounded-lg border text-center font-mono text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_10px_rgba(57,255,20,0.4)]'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: GARMENT COLORWAY (Only appears once Hoodie Type is picked) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
              <span>Step 3: Choose Garment Color</span>
              {selectedColor && (
                <span className="text-[10px] font-mono text-[#39FF14] font-bold">
                  ✓ {selectedColor.toUpperCase()}
                </span>
              )}
            </label>

            {!selectedProduct ? (
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 text-neutral-500 text-xs text-center italic">
                ← Please select a hoodie type above first to see in-stock colorways
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {availableColors.map((colorName) => {
                  const opt = COLOR_OPTIONS[colorName];
                  const isSelected = selectedColor === colorName;

                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => setSelectedColor(colorName)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#39FF14]/15 border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-neutral-600 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: opt?.hex || '#333' }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-[#39FF14] stroke-[3]" />}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-neutral-200 truncate w-full text-center">
                        {colorName}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* High-Definition Preview Card if all 3 are picked */}
          {isFormComplete && selectedProduct && (
            <div className="p-3.5 rounded-xl bg-black/60 border border-[#39FF14]/50 flex items-center gap-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-lg bg-[#0c0e12] border border-neutral-800 p-1 flex items-center justify-center shrink-0">
                <img
                  src={getHoodiePhoto(
                    selectedProduct.imageType,
                    selectedColor || 'Charcoal',
                    'front',
                    selectedProduct
                  )}
                  alt="Configured hoodie"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#39FF14]/20 text-[#39FF14] text-[9px] font-mono font-black uppercase">
                    Ready to Design
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    BD {selectedProduct.basePrice.toFixed(3)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white uppercase truncate mt-0.5">
                  {selectedProduct.name} &bull; {selectedColor}
                </h4>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Size: <strong className="text-white">{selectedSize}</strong> &bull; Authentic 380 GSM Plain Fleece
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-800/80 bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 text-center sm:text-left">
            {!isFormComplete ? (
              <span className="text-amber-400 flex items-center gap-1 justify-center sm:justify-start">
                <AlertCircle className="w-3.5 h-3.5" />
                Select all 3 options above to enter the Design Studio
              </span>
            ) : (
              <span className="text-[#39FF14] font-medium">
                ✓ All specifications verified &bull; Blank canvas ready
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isFormComplete}
              onClick={handleProceed}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                isFormComplete
                  ? 'bg-[#39FF14] hover:bg-[#32e012] text-black shadow-[0_0_20px_rgba(57,255,20,0.5)]'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
              }`}
            >
              <span>Enter Design Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
