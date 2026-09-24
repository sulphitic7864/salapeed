import React, { useState } from 'react';
import { Product } from '../types';
import { COLOR_OPTIONS, getHoodiePhoto } from '../data/mockData';
import { Sparkles, Check, ArrowRight, X, AlertCircle } from 'lucide-react';

interface GarmentSelectionModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onConfirmSelection: (product: Product, color: string, age: 'adult' | 'kids') => void;
}

export const GarmentSelectionModal: React.FC<GarmentSelectionModalProps> = ({
  isOpen,
  products,
  onClose,
  onConfirmSelection,
}) => {
  // NONE pre-selected as per instructions
  const [selectedAge, setSelectedAge] = useState<'adult' | 'kids' | null>(null);
  const [selectedType, setSelectedType] = useState<'pullover' | 'zipper' | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  if (!isOpen) return null;

  // Available colors
  const availableColors = ['Charcoal', 'Black', 'Navy', 'Heather Grey', 'Red', 'White'];

  const isFormComplete = selectedAge !== null && selectedType !== null && selectedColor !== null;

  const handleProceed = () => {
    if (!isFormComplete) return;

    // Find or map to corresponding product
    let targetProduct: Product | undefined;
    if (selectedAge === 'kids') {
      targetProduct = products.find((p) => p.kind === 'kids') || products[0];
    } else if (selectedType === 'zipper') {
      targetProduct = products.find((p) => p.imageType === 'zipper' && p.kind !== 'kids') || products[0];
    } else {
      targetProduct = products.find((p) => p.imageType === 'pullover' && p.kind !== 'kids') || products[0];
    }

    onConfirmSelection(targetProduct, selectedColor, selectedAge);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0e1015] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between bg-gradient-to-r from-neutral-900 via-[#12141a] to-neutral-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#39FF14] font-bold">
                Mandatory Garment Configuration
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-black text-white uppercase tracking-wider mt-0.5">
              Select Your Hoodie Blank
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
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-left">
          {/* Instruction Pill */}
          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
            <p>
              Please specify the <strong>Age Group</strong>, <strong>Hoodie Silhouette</strong>, and <strong>Garment Color</strong> to configure your custom print canvas. None are pre-selected.
            </p>
          </div>

          {/* STEP 1: AGE GROUP / TARGET FIT */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
              <span>1. Target Age & Sizing Group</span>
              {selectedAge && <span className="text-[10px] font-mono text-[#39FF14] font-bold">Selected: {selectedAge.toUpperCase()}</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedAge('adult')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedAge === 'adult'
                    ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase text-white">Adult (Unisex)</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedAge === 'adult' ? 'border-[#39FF14] bg-[#39FF14]' : 'border-neutral-700'
                    }`}
                  >
                    {selectedAge === 'adult' && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Sizes XS to 3XL &bull; Heavyweight 380 GSM Streetwear Cut
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAge('kids')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedAge === 'kids'
                    ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase text-white">Youth & Kids</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedAge === 'kids' ? 'border-[#39FF14] bg-[#39FF14]' : 'border-neutral-700'
                    }`}
                  >
                    {selectedAge === 'kids' && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Ages 2 to 12 Years &bull; Super Soft Fleece, Anti-Pill
                </p>
              </button>
            </div>
          </div>

          {/* STEP 2: HOODIE TYPE / SILHOUETTE */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
              <span>2. Hoodie Silhouette / Type</span>
              {selectedType && <span className="text-[10px] font-mono text-[#39FF14] font-bold">Selected: {selectedType.toUpperCase()}</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType('pullover')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedType === 'pullover'
                    ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase text-white">Fleece Pullover</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedType === 'pullover' ? 'border-[#39FF14] bg-[#39FF14]' : 'border-neutral-700'
                    }`}
                  >
                    {selectedType === 'pullover' && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Kangaroo front pouch, continuous chest print canvas
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('zipper')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedType === 'zipper'
                    ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase text-white">Full-Zip Metallic</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedType === 'zipper' ? 'border-[#39FF14] bg-[#39FF14]' : 'border-neutral-700'
                    }`}
                  >
                    {selectedType === 'zipper' && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Heavy-duty front silver zipper, dual front pockets
                </p>
              </button>
            </div>
          </div>

          {/* STEP 3: GARMENT COLOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
              <span>3. Fabric Colorway</span>
              {selectedColor && <span className="text-[10px] font-mono text-[#39FF14] font-bold">Selected: {selectedColor}</span>}
            </label>
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
                      className="w-6 h-6 rounded-full border border-neutral-600 shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: opt?.hex || '#333' }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#39FF14] stroke-[3]" />}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-neutral-200 truncate w-full text-center">
                      {colorName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* High-Definition Preview Card if all 3 are picked */}
          {isFormComplete && (
            <div className="p-3 rounded-xl bg-black/60 border border-[#39FF14]/40 flex items-center gap-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-lg bg-[#0c0e12] border border-neutral-800 p-1 flex items-center justify-center shrink-0">
                <img
                  src={getHoodiePhoto(selectedType || 'pullover', selectedColor || 'Charcoal', 'front')}
                  alt="Configured hoodie"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white uppercase">
                  {selectedAge === 'kids' ? 'Youth & Kids' : 'Adult 380 GSM'}{' '}
                  {selectedType === 'zipper' ? 'Full-Zip Hoodie' : 'Pullover Hoodie'}
                </div>
                <div className="text-[11px] font-mono text-[#39FF14]">
                  Color: {selectedColor} &bull; Safe Print Zones Calibrated
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            {!isFormComplete ? (
              <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                Select age, type & color above to continue
              </span>
            ) : (
              <span className="text-[#39FF14] font-mono text-[11px] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                All 3 specifications confirmed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 sm:w-auto px-4 py-2.5 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isFormComplete}
              onClick={handleProceed}
              className={`w-2/3 sm:w-auto px-6 py-2.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                isFormComplete
                  ? 'bg-[#39FF14] hover:bg-[#32e012] text-black shadow-[#39FF14]/20 hover:scale-102'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
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
