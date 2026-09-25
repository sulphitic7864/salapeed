import React, { useState, useRef } from 'react';
import { Product, PlantedElement, PrintZone, GarmentSide, GraphicItem } from '../types';
import { PRINT_ZONES, FONT_OPTIONS, INK_COLORS, COLOR_OPTIONS, INITIAL_GRAPHICS, getHoodiePhoto } from '../data/mockData';
import { GarmentMockup } from './GarmentMockup';
import {
  RotateCcw,
  ZoomIn,
  Type,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Move,
  Layers,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlignCenter,
  Maximize2,
  Sparkles,
  Upload,
  Copy,
} from 'lucide-react';
import { formatBHD } from '../lib/store';

interface PlacementEditorProps {
  product: Product;
  colorName: string;
  sizeName: string;
  elements: PlantedElement[];
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  onSelectColor?: (color: string) => void;
  onSelectSize?: (size: string) => void;
  onUpdateElements: (elements: PlantedElement[]) => void;
  onOpenLibrary: (side?: GarmentSide, zoneName?: string) => void;
  onApproveDesign: () => void;
  onBack: () => void;
  printFee: number;
  onOpenGarmentModal?: () => void;
}

export const PlacementEditor: React.FC<PlacementEditorProps> = ({
  product,
  colorName,
  sizeName,
  elements,
  allProducts = [],
  onSelectProduct,
  onSelectColor,
  onSelectSize,
  onUpdateElements,
  onOpenLibrary,
  onApproveDesign,
  onBack,
  printFee,
  onOpenGarmentModal,
}) => {
  // Default to front view or the first element's side
  const [currentSide, setCurrentSide] = useState<GarmentSide>(
    elements[0]?.side || 'front'
  );
  const availableZones = PRINT_ZONES.filter((z) => z.side === currentSide);
  const [currentZone, setCurrentZone] = useState<PrintZone>(availableZones[0] || PRINT_ZONES[0]);
  const [showGarmentSelector, setShowGarmentSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active element selection
  const [selectedElementId, setSelectedElementId] = useState<string>(
    elements[0]?.id || ''
  );

  const selectedElement = elements.find((el) => el.id === selectedElementId) || elements[0];

  const handleSideChange = (side: GarmentSide) => {
    setCurrentSide(side);
    const sideZones = PRINT_ZONES.filter((z) => z.side === side);
    if (sideZones.length > 0) {
      setCurrentZone(sideZones[0]);
    }
  };

  const handleZoneChange = (zone: PrintZone) => {
    setCurrentZone(zone);
    if (selectedElement) {
      onUpdateElements(
        elements.map((el) =>
          el.id === selectedElement.id ? { ...el, zone: zone.name, side: zone.side } : el
        )
      );
    }
  };

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    onUpdateElements(
      elements.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  const handleUpdateScale = (id: string, scale: number) => {
    onUpdateElements(
      elements.map((el) => (el.id === id ? { ...el, scale } : el))
    );
  };

  const handleUpdateRotation = (id: string, rotation: number) => {
    onUpdateElements(
      elements.map((el) => (el.id === id ? { ...el, rotation } : el))
    );
  };

  const handleUpdateText = (patch: Partial<PlantedElement>) => {
    if (!selectedElement) return;
    onUpdateElements(
      elements.map((el) => (el.id === selectedElement.id ? { ...el, ...patch } : el))
    );
  };

  const handleAddNewText = () => {
    const newElem: PlantedElement = {
      id: `elem-text-${Date.now()}`,
      side: currentSide,
      zone: currentZone.name,
      type: 'text',
      textContent: 'SALAPEED',
      textFont: 'condensed',
      textColor: '#39FF14',
      textCurve: false,
      x: 50,
      y: 50,
      scale: 1.0,
      rotation: 0,
    };
    onUpdateElements([...elements, newElem]);
    setSelectedElementId(newElem.id);
  };

  const handleAddGraphicItem = (graphic: GraphicItem, x = 50, y = 50) => {
    const newElem: PlantedElement = {
      id: `elem-graphic-${Date.now()}`,
      side: currentSide,
      zone: currentZone.name,
      type: 'graphic',
      graphicId: graphic.id,
      graphicName: graphic.name,
      svgContent: graphic.svgContent,
      imageUrl: graphic.previewUrl,
      x,
      y,
      scale: 1.0,
      rotation: 0,
    };
    onUpdateElements([...elements, newElem]);
    setSelectedElementId(newElem.id);
  };

  const handleDuplicateElement = (el: PlantedElement) => {
    const cloned: PlantedElement = {
      ...el,
      id: `elem-clone-${Date.now()}`,
      x: Math.min(85, el.x + 5),
      y: Math.min(85, el.y + 5),
    };
    onUpdateElements([...elements, cloned]);
    setSelectedElementId(cloned.id);
  };

  const handleDeleteElement = (id: string) => {
    const remaining = elements.filter((el) => el.id !== id);
    onUpdateElements(remaining);
    if (remaining.length > 0) {
      setSelectedElementId(remaining[0].id);
    } else {
      setSelectedElementId('');
    }
  };

  // Direct drop handler when image is dropped onto garment
  const handleDropUpload = (imageUrl: string, fileName: string, isLowRes: boolean) => {
    const newElem: PlantedElement = {
      id: `elem-drop-${Date.now()}`,
      side: currentSide,
      zone: currentZone.name,
      type: 'upload',
      imageUrl,
      graphicName: fileName,
      isLowRes,
      x: 50,
      y: 50,
      scale: 1.0,
      rotation: 0,
    };
    onUpdateElements([...elements, newElem]);
    setSelectedElementId(newElem.id);
  };

  // Direct drop handler when graphic is dropped onto garment
  const handleDropGraphic = (graphic: GraphicItem, x: number, y: number) => {
    handleAddGraphicItem(graphic, x, y);
  };

  // Handle direct file upload via file picker
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        const img = new Image();
        img.onload = () => {
          const isLowRes = img.naturalWidth < 800 || img.naturalHeight < 800;
          handleDropUpload(result, file.name, isLowRes);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Check if active element is positioned near bounds
  const isOverflowing =
    selectedElement &&
    (selectedElement.x < 12 ||
      selectedElement.x > 88 ||
      selectedElement.y < 12 ||
      selectedElement.y > 88 ||
      selectedElement.scale > 1.6);

  const totalPrice = product.basePrice + printFee;

  // Filter out any non-hoodie products from blanks list
  const validHoodieProducts = allProducts.filter(
    (p) => p.id !== 'fleece-jacket' && p.imageType !== 'jacket'
  );

  return (
    <div className="space-y-5 pb-16">
      {/* Hidden file input for direct artwork upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Product Overview</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#39FF14] font-semibold">
            {product.name}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
            {colorName} · {sizeName}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. REALISTIC HOODIE SELECTION BAR (Switch Garment & Color) */}
      {/* ========================================================================= */}
      <div className="blueprint-card p-3.5 bg-gradient-to-r from-[#121419] via-[#161920] to-[#121419] border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-lg bg-black/70 border border-neutral-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <img
                src={
                  product.colorPhotos?.[colorName] ||
                  product.photoUrl ||
                  getHoodiePhoto(product.imageType, colorName, 'front', product)
                }
                alt={product.name}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {product.brochureTitle || product.name}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#39FF14]/15 text-[#39FF14] font-bold">
                  380 GSM
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                <span>Color: <strong className="text-white">{colorName}</strong></span>
                <span>•</span>
                <span>Size: <strong className="text-white">{sizeName}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenGarmentModal && (
              <button
                type="button"
                onClick={onOpenGarmentModal}
                className="px-2.5 py-1.5 rounded-lg bg-[#39FF14]/15 hover:bg-[#39FF14]/25 text-[#39FF14] text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-[#39FF14]/40"
                title="Change Age, Type, and Color in modal"
              >
                <span>Reconfigure Garment</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGarmentSelector(!showGarmentSelector)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-neutral-700"
            >
              <span>Quick Switch</span>
              {showGarmentSelector ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* EXPANDED HOODIE BLANK & COLOR SELECTOR DRAWER */}
        {showGarmentSelector && validHoodieProducts.length > 0 && (
          <div className="mt-3.5 pt-3.5 border-t border-neutral-800/80 space-y-3.5 animate-fadeIn">
            {/* Real Hoodie Blanks Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                Select Blank Silhouette:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {validHoodieProducts.map((p) => {
                  const isCur = p.id === product.id;
                  const thumbUrl =
                    p.colorPhotos?.[colorName] ||
                    p.photoUrl ||
                    getHoodiePhoto(p.imageType, colorName, 'front', p);

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (onSelectProduct) onSelectProduct(p);
                        if (onSelectColor && !p.colors.includes(colorName)) {
                          onSelectColor(p.colors[0] || 'Black');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between ${
                        isCur
                          ? 'bg-[#39FF14]/10 border-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="w-16 h-16 relative flex items-center justify-center my-0.5 overflow-hidden">
                        <img
                          src={thumbUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-white uppercase truncate w-full mt-1">
                        {p.brochureTitle || p.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#39FF14] mt-0.5">
                        from {formatBHD(p.basePrice)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant Color Swatches for Current Product */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-neutral-800/60">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-400">Fabric Color:</span>
                <div className="flex items-center gap-2">
                  {product.colors.map((cName) => {
                    const c = COLOR_OPTIONS[cName];
                    const isSel = cName === colorName;
                    return (
                      <button
                        key={cName}
                        onClick={() => onSelectColor && onSelectColor(cName)}
                        className={`w-7 h-7 rounded-full border-2 transition cursor-pointer relative ${
                          isSel
                            ? 'border-[#39FF14] scale-110 shadow-[0_0_8px_rgba(57,255,20,0.6)]'
                            : 'border-neutral-700 hover:border-neutral-500'
                        }`}
                        style={{ backgroundColor: c?.hex || '#222' }}
                        title={cName}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Sizes quick selector */}
              {onSelectSize && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-neutral-400">Size:</span>
                  <div className="flex items-center gap-1">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => onSelectSize(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          s === sizeName
                            ? 'bg-[#39FF14] text-black'
                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN REALISTIC GARMENT MOCKUP CANVAS & DIRECT DRAG-AND-DROP STAGE */}
      {/* ========================================================================= */}
      <div className="relative">
        <GarmentMockup
          imageType={product.imageType}
          colorName={colorName}
          side={currentSide}
          activeZone={currentZone}
          elements={elements}
          selectedElementId={selectedElement?.id || null}
          product={product}
          onSelectElement={(id) => {
            setSelectedElementId(id);
            const found = elements.find((e) => e.id === id);
            if (found && found.side !== currentSide) {
              setCurrentSide(found.side);
              const z =
                PRINT_ZONES.find((pz) => pz.name === found.zone && pz.side === found.side) ||
                PRINT_ZONES[0];
              setCurrentZone(z);
            }
          }}
          onUpdateElementPosition={handleUpdatePosition}
          onUpdateElementScale={handleUpdateScale}
          onUpdateElementRotation={handleUpdateRotation}
          onDeleteElement={handleDeleteElement}
          onDropUpload={handleDropUpload}
          onDropGraphic={handleDropGraphic}
        />

        {/* Drag & Drop Quick Guidance Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[11px] text-neutral-400 font-mono text-center">
          <span className="inline-flex items-center gap-1 text-neutral-300">
            <Move className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Drag center to move</span>
          </span>
          <span className="text-neutral-600">•</span>
          <span className="inline-flex items-center gap-1 text-neutral-300">
            <Maximize2 className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Corner handles to resize</span>
          </span>
          <span className="text-neutral-600">•</span>
          <span className="inline-flex items-center gap-1 text-neutral-300">
            <RotateCcw className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Top handle to rotate</span>
          </span>
          <span className="text-neutral-600">•</span>
          <span className="inline-flex items-center gap-1 text-[#39FF14]">
            <Upload className="w-3.5 h-3.5" />
            <span>Drop image files onto hoodie</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK DRAG-AND-DROP ARTWORK SHELF */}
      {/* ========================================================================= */}
      <div className="p-3 bg-[#12151c] rounded-xl border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Art & Logos (Drag or Click to Plant)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-mono text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded transition cursor-pointer"
            >
              <Upload className="w-3 h-3 text-[#39FF14]" />
              <span>Upload Image</span>
            </button>
            <button
              onClick={() => onOpenLibrary(currentSide, currentZone.name)}
              className="text-[11px] font-mono text-[#39FF14] hover:underline cursor-pointer"
            >
              Browse All (150+) →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {INITIAL_GRAPHICS.slice(0, 6).map((g) => (
            <div
              key={g.id}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(g));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => handleAddGraphicItem(g)}
              className="group p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#39FF14]/60 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing transition shadow-sm"
              title={`Drag onto hoodie or click to add ${g.name}`}
            >
              <div
                className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition pointer-events-none"
                dangerouslySetInnerHTML={{ __html: g.svgContent || '' }}
              />
              <span className="text-[10px] text-neutral-300 font-medium truncate w-full mt-1">
                {g.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SIDE SELECTOR TABS (Front / Back / Sleeve) */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
            Garment Placement Angle
          </label>
          <span className="text-[10px] font-mono text-neutral-500">
            High-Resolution Studio Views
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-[#121418] p-1.5 rounded-xl border border-neutral-800">
          {(['front', 'back', 'sleeve'] as GarmentSide[]).map((sd) => {
            const sideCount = elements.filter((el) => el.side === sd).length;
            const isSelected = currentSide === sd;

            return (
              <button
                key={sd}
                onClick={() => handleSideChange(sd)}
                className={`py-2.5 px-3 text-xs font-bold rounded-lg uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-[#39FF14] text-black shadow-lg font-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
                }`}
              >
                <span>{sd} View</span>
                {sideCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] font-extrabold ${
                      isSelected ? 'bg-black text-[#39FF14]' : 'bg-[#39FF14] text-black'
                    }`}
                  >
                    {sideCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRINT ZONE SELECTOR CHIPS */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            {currentSide.toUpperCase()} Print Zone
          </label>
          <span className="text-[11px] text-neutral-500 font-mono">Dashed Print-Safe Area</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableZones.map((z) => (
            <button
              key={z.id}
              onClick={() => handleZoneChange(z)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                currentZone.id === z.id
                  ? 'bg-white text-black border-white font-bold shadow-md'
                  : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {z.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overflow Warning if print goes outside safe border */}
      {isOverflowing && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Artwork boundary is close to edge. The Salapeed print workshop will align margins before curing.
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PLACED LAYERS TRAY (Multi-print Management) */}
      {/* ========================================================================= */}
      <div className="p-4 bg-[#14171d] rounded-xl border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#39FF14]" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Placed Layers ({elements.length})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenLibrary(currentSide, currentZone.name)}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Add Graphic</span>
            </button>
            <button
              onClick={handleAddNewText}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Type className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Add Text</span>
            </button>
          </div>
        </div>

        {/* List of layers */}
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {elements.map((el, idx) => {
            const isSel = el.id === selectedElement?.id;
            return (
              <div
                key={el.id}
                onClick={() => {
                  setSelectedElementId(el.id);
                  if (el.side !== currentSide) {
                    setCurrentSide(el.side);
                    const z =
                      PRINT_ZONES.find((pz) => pz.name === el.zone && pz.side === el.side) ||
                      PRINT_ZONES[0];
                    setCurrentZone(z);
                  }
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition cursor-pointer border ${
                  isSel
                    ? 'bg-[#39FF14]/15 border-[#39FF14]/60 text-white font-bold'
                    : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[10px] text-neutral-500">{idx + 1}.</span>
                  {el.type === 'text' ? (
                    <Type className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                  )}
                  <span className="truncate">
                    {el.type === 'text' ? `"${el.textContent}"` : el.graphicName || 'Graphic'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-neutral-400 shrink-0">
                    {el.side.toUpperCase()} · {el.zone}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateElement(el);
                    }}
                    className="p-1 text-neutral-400 hover:text-white rounded transition cursor-pointer"
                    title="Duplicate layer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteElement(el.id);
                    }}
                    className="p-1 text-neutral-500 hover:text-red-400 rounded transition cursor-pointer"
                    title="Remove layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. FINE-TUNING CONTROLS FOR ACTIVE SELECTED LAYER */}
      {/* ========================================================================= */}
      {selectedElement && (
        <div className="p-4 bg-[#14171d] rounded-xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Active Layer Fine-Tuning
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdatePosition(selectedElement.id, 50, 50)}
                className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-800 text-[#39FF14] hover:bg-neutral-700 cursor-pointer flex items-center gap-1 font-bold"
                title="Center Horizontally & Vertically"
              >
                <AlignCenter className="w-3 h-3" />
                <span>Center (50%)</span>
              </button>
              <button
                onClick={() => onOpenLibrary(currentSide, currentZone.name)}
                className="text-xs text-[#39FF14] hover:underline cursor-pointer"
              >
                Swap Graphic
              </button>
            </div>
          </div>

          {/* Size / Scale Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-neutral-500" />
                <span>Size / Scale</span>
              </span>
              <span className="font-mono text-[#39FF14] font-bold">
                {Math.round(selectedElement.scale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.0"
              step="0.05"
              value={selectedElement.scale}
              onChange={(e) => handleUpdateScale(selectedElement.id, parseFloat(e.target.value))}
              className="w-full accent-[#39FF14] bg-neutral-800 h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Rotation Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                <span>Angle / Rotation</span>
              </span>
              <span className="font-mono text-neutral-300 font-bold">{selectedElement.rotation}°</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedElement.rotation}
                onChange={(e) => handleUpdateRotation(selectedElement.id, parseInt(e.target.value))}
                className="w-full accent-[#39FF14] bg-neutral-800 h-1.5 rounded cursor-pointer"
              />
              <button
                onClick={() => handleUpdateRotation(selectedElement.id, 0)}
                className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                0°
              </button>
            </div>
          </div>

          {/* Specific Controls for Custom Text */}
          {selectedElement.type === 'text' && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400">Custom Text Content</label>
                <input
                  type="text"
                  value={selectedElement.textContent || ''}
                  onChange={(e) => handleUpdateText({ textContent: e.target.value })}
                  placeholder="e.g. SALAPEED BAHRAIN"
                  className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white font-medium focus:border-[#39FF14] focus:outline-none"
                  maxLength={25}
                />
              </div>

              {/* Font Choice */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400">Font Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => handleUpdateText({ textFont: f.key as any })}
                      className={`p-2 text-xs rounded-lg border text-center transition cursor-pointer ${
                        selectedElement.textFont === f.key
                          ? 'bg-[#39FF14]/15 border-[#39FF14] text-white font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span style={{ fontFamily: f.family }}>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ink Color Palette */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Ink Print Color</label>
                <div className="flex items-center gap-2.5">
                  {INK_COLORS.map((ic) => (
                    <button
                      key={ic.name}
                      onClick={() => handleUpdateText({ textColor: ic.hex })}
                      className={`w-7 h-7 rounded-full border-2 transition cursor-pointer relative ${
                        selectedElement.textColor === ic.hex
                          ? 'border-[#39FF14] scale-110 shadow-[0_0_8px_rgba(57,255,20,0.5)]'
                          : 'border-neutral-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: ic.hex }}
                      title={ic.name}
                    />
                  ))}
                </div>
              </div>

              {/* Arc / Curve Toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedElement.textCurve}
                    onChange={(e) => handleUpdateText({ textCurve: e.target.checked })}
                    className="w-4 h-4 accent-[#39FF14] rounded cursor-pointer"
                  />
                  <span>Curve Text Along Arc (Street Arch)</span>
                </label>
              </div>
            </div>
          )}

          {/* Quick Delete Element Action */}
          <div className="pt-2 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={() => handleDeleteElement(selectedElement.id)}
              className="w-full py-2 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 hover:border-red-500 text-red-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete Design Element</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PRICE SUMMARY & APPROVE CTA */}
      {/* ========================================================================= */}
      <div className="blueprint-card p-4 space-y-3 mt-6">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Garment Blank ({product.name})</span>
          <span className="font-mono text-neutral-200">{formatBHD(product.basePrice)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Customization & Print Fee</span>
          <span className="font-mono text-neutral-200">{formatBHD(printFee)}</span>
        </div>
        <div className="h-px bg-neutral-800" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white uppercase tracking-wider">Item Total</span>
          <span className="text-xl font-heading font-black text-[#39FF14]">
            {formatBHD(totalPrice)}
          </span>
        </div>

        <button
          onClick={onApproveDesign}
          className="w-full py-4 px-4 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-base uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Approve Design & Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
