import React, { useRef, useState, useEffect } from 'react';
import { GarmentSide, PlantedElement, PrintZone, Product, GraphicItem } from '../types';
import { getHoodiePhoto, PRINT_ZONES } from '../data/mockData';
import { RealisticHoodieGraphic } from './RealisticHoodieGraphic';
import {
  RotateCcw,
  Maximize2,
  Trash2,
  AlignCenter,
  UploadCloud,
  Move,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface GarmentMockupProps {
  imageType: 'zipper' | 'pullover' | 'jacket' | 'kids';
  colorName: string;
  side: GarmentSide;
  activeZone: PrintZone;
  elements: PlantedElement[];
  selectedElementId: string | null;
  product?: Product;
  onSelectElement: (id: string) => void;
  onUpdateElementPosition: (id: string, x: number, y: number) => void;
  onUpdateElementScale?: (id: string, scale: number) => void;
  onUpdateElementRotation?: (id: string, rotation: number) => void;
  onDeleteElement?: (id: string) => void;
  onDropUpload?: (imageUrl: string, fileName: string, isLowRes: boolean) => void;
  onDropGraphic?: (graphic: GraphicItem, x: number, y: number) => void;
  readOnly?: boolean;
  onRootElement?: (element: HTMLDivElement | null) => void;
}

type DragMode = 'move' | 'scale' | 'rotate' | null;

export const GarmentMockup: React.FC<GarmentMockupProps> = ({
  imageType,
  colorName,
  side,
  activeZone,
  elements,
  selectedElementId,
  product,
  onSelectElement,
  onUpdateElementPosition,
  onUpdateElementScale,
  onUpdateElementRotation,
  onDeleteElement,
  onDropUpload,
  onDropGraphic,
  readOnly = false,
  onRootElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const printZoneRef = useRef<HTMLDivElement>(null);

  // Drag state management
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [isHoveringDropZone, setIsHoveringDropZone] = useState(false);
  const [showSnapGuideX, setShowSnapGuideX] = useState(false);
  const [showSnapGuideY, setShowSnapGuideY] = useState(false);
  const [activeDragCoords, setActiveDragCoords] = useState<{ x: number; y: number } | null>(null);
  const [boundaryWarning, setBoundaryWarning] = useState<string | null>(null);

  const triggerBoundaryWarning = (msg: string) => {
    setBoundaryWarning(msg);
    setTimeout(() => {
      setBoundaryWarning((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const isZipper =
    imageType === 'zipper' ||
    product?.imageType === 'zipper' ||
    product?.id === 'zipper-hoodie' ||
    (product?.name ? product.name.toLowerCase().includes('zip') : false);

  // Get real hoodie photo URL
  const hoodiePhotoUrl = getHoodiePhoto(imageType, colorName, side, product);

  // Keyboard delete support for selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly || !selectedElementId || !onDeleteElement) return;
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, onDeleteElement, readOnly]);

  // Curved text renderer
  const renderCurvedText = (text: string, font: string, color: string, curve: boolean) => {
    const chars = (text || 'SALAPEED').split('');
    if (!curve || chars.length <= 1) {
      return (
        <span
          style={{
            fontFamily:
              font === 'condensed'
                ? 'var(--font-heading)'
                : font === 'mono'
                ? 'var(--font-mono)'
                : 'var(--font-body)',
            color,
          }}
          className="text-sm sm:text-base font-black tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none"
        >
          {text || 'SALAPEED'}
        </span>
      );
    }

    const mid = (chars.length - 1) / 2;
    return (
      <div className="inline-flex items-center justify-center select-none">
        {chars.map((ch, i) => {
          const off = i - mid;
          const rot = off * 7.5;
          const ty = Math.abs(off) * Math.abs(off) * 1.35;
          return (
            <span
              key={i}
              style={{
                fontFamily:
                  font === 'condensed'
                    ? 'var(--font-heading)'
                    : font === 'mono'
                    ? 'var(--font-mono)'
                    : 'var(--font-body)',
                color,
                transform: `translateY(${ty}px) rotate(${rot}deg)`,
                display: 'inline-block',
              }}
              className="text-sm sm:text-base font-black tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none"
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          );
        })}
      </div>
    );
  };

  // Helper to compute element center in client coordinates
  const getElementClientCenter = (elem: PlantedElement) => {
    if (!printZoneRef.current) return { x: 0, y: 0 };
    const rect = printZoneRef.current.getBoundingClientRect();
    const cx = rect.left + (elem.x / 100) * rect.width;
    const cy = rect.top + (elem.y / 100) * rect.height;
    return { x: cx, y: cy };
  };

  // =========================================================================
  // 1. DRAG TO MOVE ELEMENT (Rock-solid with window event listeners)
  // =========================================================================
  const handlePointerDownMove = (e: React.PointerEvent, elem: PlantedElement) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(elem.id);

    if (!printZoneRef.current) return;
    const zoneRect = printZoneRef.current.getBoundingClientRect();
    if (zoneRect.width === 0 || zoneRect.height === 0) return;

    setDragMode('move');
    setActiveDragCoords({ x: elem.x, y: elem.y });

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const elemStartX = elem.x;
    const elemStartY = elem.y;

    const handlePointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const dx = ((moveEv.clientX - startClientX) / zoneRect.width) * 100;
      const dy = ((moveEv.clientY - startClientY) / zoneRect.height) * 100;

      let targetX = elemStartX + dx;
      let targetY = elemStartY + dy;

      // Magnetic Snapping to Horizontal Center (50%)
      if (Math.abs(targetX - 50) < 3.5) {
        targetX = 50;
        setShowSnapGuideX(true);
      } else {
        setShowSnapGuideX(false);
      }

      // Magnetic Snapping to Vertical Center (50%)
      if (Math.abs(targetY - 50) < 3.5) {
        targetY = 50;
        setShowSnapGuideY(true);
      } else {
        setShowSnapGuideY(false);
      }

      // Boundaries clamping (5% to 95%)
      if (targetX < 5 || targetX > 95 || targetY < 5 || targetY > 95) {
        triggerBoundaryWarning('⚠️ Artwork boundary reached! Placement kept within printable safe area.');
      }
      const clampedX = Math.round(Math.min(95, Math.max(5, targetX)));
      const clampedY = Math.round(Math.min(95, Math.max(5, targetY)));

      setActiveDragCoords({ x: clampedX, y: clampedY });
      onUpdateElementPosition(elem.id, clampedX, clampedY);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setDragMode(null);
      setShowSnapGuideX(false);
      setShowSnapGuideY(false);
      setActiveDragCoords(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  // =========================================================================
  // 2. DRAG TO SCALE ELEMENT (Corner Handles)
  // =========================================================================
  const handlePointerDownScale = (e: React.PointerEvent, elem: PlantedElement) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(elem.id);
    setDragMode('scale');

    const center = getElementClientCenter(elem);
    const initialDist = Math.hypot(e.clientX - center.x, e.clientY - center.y) || 50;
    const initialScale = elem.scale || 1.0;

    const handlePointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const currentDist = Math.hypot(moveEv.clientX - center.x, moveEv.clientY - center.y);
      const ratio = currentDist / initialDist;
      const rawScale = initialScale * ratio;
      if (rawScale > 2.0) {
        triggerBoundaryWarning('⚠️ Maximum print size reached! Constrained to safe zone.');
      } else if (rawScale < 0.4) {
        triggerBoundaryWarning('⚠️ Minimum size reached.');
      }
      const newScale = Math.round(Math.min(2.0, Math.max(0.4, rawScale)) * 100) / 100;

      if (onUpdateElementScale) {
        onUpdateElementScale(elem.id, newScale);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setDragMode(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  // =========================================================================
  // 3. DRAG TO ROTATE ELEMENT (Top Rotation Handle)
  // =========================================================================
  const handlePointerDownRotate = (e: React.PointerEvent, elem: PlantedElement) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(elem.id);
    setDragMode('rotate');

    const center = getElementClientCenter(elem);

    const handlePointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const angleRad = Math.atan2(moveEv.clientY - center.y, moveEv.clientX - center.x);
      let angleDeg = Math.round(angleRad * (180 / Math.PI) + 90);

      // Normalize to -180 to 180
      while (angleDeg > 180) angleDeg -= 360;
      while (angleDeg < -180) angleDeg += 360;

      // Soft magnetic snap to 0°, 45°, 90°, -90°, 180°
      if (Math.abs(angleDeg) < 4) angleDeg = 0;
      if (Math.abs(angleDeg - 45) < 3) angleDeg = 45;
      if (Math.abs(angleDeg + 45) < 3) angleDeg = -45;
      if (Math.abs(angleDeg - 90) < 4) angleDeg = 90;
      if (Math.abs(angleDeg + 90) < 4) angleDeg = -90;
      if (Math.abs(Math.abs(angleDeg) - 180) < 4) angleDeg = 180;

      if (onUpdateElementRotation) {
        onUpdateElementRotation(elem.id, angleDeg);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setDragMode(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  // =========================================================================
  // 4. DESKTOP FILE & GRAPHIC DRAG-AND-DROP HANDLERS
  // =========================================================================
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly) {
      setIsHoveringDropZone(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveringDropZone(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveringDropZone(false);
    if (readOnly) return;

    // Calculate drop percentage relative to print zone if available
    let dropX = 50;
    let dropY = 50;
    if (printZoneRef.current) {
      const rect = printZoneRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        dropX = Math.round(Math.min(95, Math.max(5, ((e.clientX - rect.left) / rect.width) * 100)));
        dropY = Math.round(Math.min(95, Math.max(5, ((e.clientY - rect.top) / rect.height) * 100)));
      }
    }

    // A) Check for dropped graphic from application library
    const graphicData = e.dataTransfer.getData('application/json');
    if (graphicData && onDropGraphic) {
      try {
        const parsed = JSON.parse(graphicData);
        if (parsed && (parsed.svgContent || parsed.previewUrl || parsed.name)) {
          onDropGraphic(parsed, dropX, dropY);
          return;
        }
      } catch (err) {
        // Fall through to file drop
      }
    }

    // B) Check for dropped local image files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onDropUpload) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const result = uploadEvent.target?.result as string;
          if (result) {
            const img = new Image();
            img.onload = () => {
              const isLowRes = img.naturalWidth < 800 || img.naturalHeight < 800;
              onDropUpload(result, file.name, isLowRes);
            };
            img.src = result;
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // ALL elements for the CURRENT side are visible simultaneously!
  const visibleElements = elements.filter((el) => el.side === side);

  // Invert canvas background based on garment color:
  // Light background behind dark hoodie (Black, Navy, Charcoal, Red)
  // Dark background behind light hoodie (White, Heather Grey)
  const isLightGarment =
    colorName.toLowerCase().includes('grey') ||
    colorName.toLowerCase().includes('white');

  const canvasBgClass = isLightGarment
    ? 'bg-gradient-to-b from-[#141822] via-[#0f1218] to-[#090b0e] border-neutral-800 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
    : 'bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] border-neutral-300 text-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

  const setRootElement = (element: HTMLDivElement | null) => {
    containerRef.current = element;
    onRootElement?.(element);
  };

  return (
    <div
      ref={setRootElement}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full aspect-square max-w-[480px] mx-auto rounded-2xl overflow-hidden border flex items-center justify-center select-none touch-canvas transition-all duration-300 ${canvasBgClass} ${
        isHoveringDropZone ? 'ring-4 ring-[#39FF14] ring-opacity-80 scale-[1.01]' : ''
      }`}
    >
      {/* Background Technical Grid Pattern */}
      <div className={`absolute inset-0 sp-stripes-subtle pointer-events-none ${isLightGarment ? 'opacity-25' : 'opacity-10'}`} />

      {/* Boundary Warning Alert Banner */}
      {boundaryWarning && (
        <div data-capture-ignore="true" className="absolute top-12 left-4 right-4 z-50 animate-bounce pointer-events-none">
          <div className="bg-amber-500 text-black px-3 py-1.5 rounded-lg font-mono text-[10px] font-black text-center shadow-2xl flex items-center justify-center gap-1.5 border border-amber-600">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{boundaryWarning}</span>
          </div>
        </div>
      )}

      {/* Top Left View Angle & Garment Specs Header */}
      <div data-capture-ignore="true" className="absolute top-3 left-3 z-30 flex items-center gap-1.5 pointer-events-none">
        <span className="px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold tracking-wider uppercase text-white border border-neutral-700/80 shadow-sm">
          {side.toUpperCase()} VIEW
        </span>
        <span className="px-2 py-0.5 rounded-md bg-[#39FF14]/15 backdrop-blur-md text-[10px] font-mono font-bold tracking-wider uppercase text-[#39FF14] border border-[#39FF14]/40 shadow-sm">
          {colorName} · {imageType.toUpperCase()}
        </span>
      </div>

      {/* Top Right Fabric Quality Tag */}
      <div data-capture-ignore="true" className="absolute top-3 right-3 z-30 pointer-events-none hidden sm:block">
        <span className={`px-2 py-0.5 rounded-md backdrop-blur-md text-[9px] font-mono font-semibold border ${
          isLightGarment ? 'bg-neutral-900/85 text-neutral-300 border-neutral-800' : 'bg-white/90 text-neutral-800 border-neutral-300 shadow-sm'
        }`}>
          380 GSM HEAVYWEIGHT FLEECE
        </span>
      </div>

      {/* Desktop Direct File Drop Overlay */}
      {isHoveringDropZone && (
        <div data-capture-ignore="true" className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/20 border-2 border-[#39FF14] flex items-center justify-center text-[#39FF14] animate-bounce mb-3 shadow-[0_0_25px_rgba(57,255,20,0.5)]">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-heading font-black text-white uppercase tracking-wider">
            Drop Artwork on Hoodie
          </h4>
          <p className="text-xs text-neutral-300 mt-1 max-w-xs">
            Instantly plants your logo or artwork onto the {activeZone.name} location.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. REAL AUTHENTIC HOODIE PHOTOGRAPHY (Accurate color and silhouette) */}
      {/* ========================================================================= */}
      <div className="w-full h-full p-1 flex items-center justify-center relative pointer-events-none select-none">
        {side === 'sleeve' ? (
          <RealisticHoodieGraphic
            imageType={imageType}
            colorName={colorName}
            side="sleeve"
            className="filter drop-shadow-[0_14px_36px_rgba(0,0,0,0.8)]"
          />
        ) : (
          <img
            src={hoodiePhotoUrl}
            alt={`${product?.name || (isZipper ? 'Adult Zip Hoodie' : 'Salapeed')} ${colorName} hoodie - ${side} view`}
            className="w-full h-full object-contain filter drop-shadow-[0_14px_36px_rgba(0,0,0,0.8)] transition-all duration-300"
            draggable={false}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1.5 FIXED SALAPEED BRAND LOGO (Left Chest - Always visible on Front View) */}
      {/* Customer safe print zones exclude this area completely */}
      {/* ========================================================================= */}
      {side === 'front' && (
        <div
          className="absolute z-20 pointer-events-none select-none flex flex-col items-center"
          style={{ top: '30%', left: '57%', width: '13%' }}
          title="Salapeed Official Brand Crest (Fixed Placement)"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/95 p-1 border-2 border-[#39FF14]/70 shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/salapeed-logo.jpeg"
              alt="Salapeed Brand Crest"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="mt-1 px-1.5 py-0.5 rounded bg-black/90 text-[7px] font-mono font-bold text-[#39FF14] uppercase border border-[#39FF14]/40 shadow whitespace-nowrap">
            Brand Logo (Fixed)
          </span>
        </div>
      )}

      {/* Kangaroo Pocket Seam Exclusion Guide (Front View) */}
      {side === 'front' && (
        <div
          data-capture-ignore="true"
          className="absolute z-20 pointer-events-none left-[26%] right-[26%] flex items-center justify-center border-t-2 border-dashed border-red-500/60 shadow-sm"
          style={{ top: '53.5%' }}
        >
          <span className="text-[7.5px] font-mono font-bold text-red-400 bg-black/90 px-1.5 py-0.5 rounded -top-2.5 relative border border-red-500/40 shadow">
            {isZipper ? 'Split Kangaroo Pockets • Keep Clear' : 'Kangaroo Pocket Seam • Keep Clear'}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRINT-SAFE BOUNDING BOX & ACTIVE DRAG-AND-DROP CANVAS */}
      {/* ========================================================================= */}
      <div
        ref={printZoneRef}
        className="absolute z-30 pointer-events-auto"
        style={{
          top: `${activeZone.boundingBox.top}%`,
          left: `${activeZone.boundingBox.left}%`,
          width: `${activeZone.boundingBox.width}%`,
          height: `${activeZone.boundingBox.height}%`,
        }}
      >
        {/* Dashed Print-Safe Boundary Box */}
        <div data-capture-ignore="true" className="absolute inset-0 border-2 border-dashed border-[#39FF14]/85 rounded-lg pointer-events-none shadow-[0_0_16px_rgba(57,255,20,0.22)]">
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 text-[#39FF14] text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-[#39FF14]/50 shadow-md">
            {activeZone.name.toUpperCase()} (SAFE PRINT ZONE)
          </span>
        </div>

        {/* Magnetic Snapping Guidelines */}
        {showSnapGuideX && (
          <div data-capture-ignore="true" className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#39FF14] z-50 pointer-events-none shadow-[0_0_8px_#39FF14] border-l border-dashed border-black/60" />
        )}
        {showSnapGuideY && (
          <div data-capture-ignore="true" className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#39FF14] z-50 pointer-events-none shadow-[0_0_8px_#39FF14] border-t border-dashed border-black/60" />
        )}

        {/* ===================================================================== */}
        {/* 3. PLANTED ELEMENTS (All elements on current side rendered cleanly) */}
        {/* ===================================================================== */}
        {visibleElements.map((elem) => {
          const isSelected = elem.id === selectedElementId;

          return (
            <div
              key={elem.id}
              className={`absolute select-none ${
                isSelected ? 'z-40' : 'z-20'
              }`}
              style={{
                left: `${elem.x}%`,
                top: `${elem.y}%`,
                transform: `translate(-50%, -50%) scale(${elem.scale}) rotate(${elem.rotation}deg)`,
                cursor: dragMode === 'move' ? 'grabbing' : 'grab',
              }}
            >
              {/* INTERACTIVE TRANSFORMER BOUNDING BOX & PROMINENT DIRECT HANDLES */}
              {isSelected && !readOnly && (
                <div data-capture-ignore="true" className="absolute -inset-4 border-2 border-[#39FF14] rounded-lg pointer-events-none shadow-[0_0_20px_rgba(57,255,20,0.7)]">
                  {/* Top Attached Rotate Handle (Direct Rotate & Drag Handle) */}
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
                    <button
                      type="button"
                      onPointerDown={(e) => handlePointerDownRotate(e, elem)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUpdateElementRotation) {
                          onUpdateElementRotation(elem.id, ((elem.rotation || 0) + 15) % 360);
                        }
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black hover:bg-neutral-900 border-2 border-[#39FF14] text-[#39FF14] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-115 active:scale-95 transition shadow-2xl"
                      title="Rotate Artwork (Click for +15° or Drag to angle)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <div className="w-0.5 h-2 bg-[#39FF14]" />
                  </div>

                  {/* PROMINENT DIRECT DELETE BUTTON ATTACHED TO ELEMENT */}
                  <div className="absolute -top-9 right-0 pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteElement) onDeleteElement(elem.id);
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer hover:scale-115 active:scale-95 transition shadow-2xl border-2 border-white"
                      title="Delete Artwork (Del / Backspace)"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* 4 Corner Scale Handles */}
                  <div
                    onPointerDown={(e) => handlePointerDownScale(e, elem)}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-black border-2 border-[#39FF14] rounded-sm pointer-events-auto cursor-nwse-resize hover:scale-125 transition shadow-md"
                    title="Drag to Resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownScale(e, elem)}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-black border-2 border-[#39FF14] rounded-sm pointer-events-auto cursor-nesw-resize hover:scale-125 transition shadow-md"
                    title="Drag to Resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownScale(e, elem)}
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-black border-2 border-[#39FF14] rounded-sm pointer-events-auto cursor-nesw-resize hover:scale-125 transition shadow-md"
                    title="Drag to Resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownScale(e, elem)}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-black border-2 border-[#39FF14] rounded-sm pointer-events-auto cursor-nwse-resize hover:scale-125 transition shadow-md"
                    title="Drag to Resize"
                  />

                  {/* Center Coordinates & Scale Badge */}
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 text-[8px] font-mono text-[#39FF14] px-1.5 py-0.5 rounded border border-[#39FF14]/50 pointer-events-none shadow font-bold">
                    {Math.round(elem.scale * 100)}% · {elem.rotation}°
                  </div>
                </div>
              )}

              {/* PRINT ELEMENT BODY (Draggable Core) */}
              <div
                onPointerDown={(e) => handlePointerDownMove(e, elem)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(elem.id);
                }}
                className="relative pointer-events-auto filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
              >
                {/* 1. Curated Vector Graphics */}
                {elem.type === 'graphic' && elem.svgContent ? (
                  <div
                    className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-1 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: elem.svgContent }}
                  />
                ) : elem.type === 'upload' && elem.imageUrl ? (
                  // 2. Customer Uploaded Image
                  <div className="relative pointer-events-none">
                    <img
                      src={elem.imageUrl}
                      alt="Custom Print"
                      className="max-w-[130px] max-h-[130px] object-contain rounded shadow-md"
                      draggable={false}
                    />
                    {elem.isLowRes && (
                      <span className="absolute -bottom-4 left-0 right-0 text-[8px] bg-amber-500 text-black font-extrabold text-center rounded px-1 shadow">
                        Low-Res
                      </span>
                    )}
                  </div>
                ) : elem.type === 'text' ? (
                  // 3. Custom Streetwear Arched / Condensed Typography
                  <div className="text-center whitespace-nowrap p-2 pointer-events-none">
                    {renderCurvedText(
                      elem.textContent || 'SALAPEED',
                      elem.textFont || 'condensed',
                      elem.textColor || '#39FF14',
                      !!elem.textCurve
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-neutral-800 text-white text-xs flex items-center justify-center rounded border border-neutral-600 pointer-events-none">
                    {elem.graphicName || 'Artwork'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Center Snapping Action Tooltip */}
      {selectedElementId && !readOnly && (
        <div data-capture-ignore="true" className="absolute bottom-2.5 right-3 z-30 flex items-center gap-1.5">
          <button
            onClick={() => onUpdateElementPosition(selectedElementId, 50, 50)}
            className="p-1.5 rounded-lg bg-black/90 hover:bg-neutral-800 text-[#39FF14] border border-neutral-700/80 transition cursor-pointer shadow-md flex items-center gap-1 text-[10px] font-mono font-bold"
            title="Snap element to center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Center 50%</span>
          </button>
        </div>
      )}
    </div>
  );
};
