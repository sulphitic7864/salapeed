import React, { useRef, useState, useEffect } from 'react';
import { GarmentSide, PlantedElement, PrintZone } from '../types';
import { RealisticHoodieGraphic } from './RealisticHoodieGraphic';
import {
  RotateCcw,
  Maximize2,
  Trash2,
  AlignCenter,
  UploadCloud,
  Move,
  Layers,
} from 'lucide-react';

interface GarmentMockupProps {
  imageType: 'zipper' | 'pullover' | 'jacket' | 'kids';
  colorName: string;
  side: GarmentSide;
  activeZone: PrintZone;
  elements: PlantedElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onUpdateElementPosition: (id: string, x: number, y: number) => void;
  onUpdateElementScale?: (id: string, scale: number) => void;
  onUpdateElementRotation?: (id: string, rotation: number) => void;
  onDeleteElement?: (id: string) => void;
  onDropUpload?: (imageUrl: string, fileName: string, isLowRes: boolean) => void;
  readOnly?: boolean;
}

type DragMode = 'move' | 'scale' | 'rotate' | null;

export const GarmentMockup: React.FC<GarmentMockupProps> = ({
  imageType,
  colorName,
  side,
  activeZone,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElementPosition,
  onUpdateElementScale,
  onUpdateElementRotation,
  onDeleteElement,
  onDropUpload,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const printZoneRef = useRef<HTMLDivElement>(null);

  // Drag state management
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [isHoveringDropZone, setIsHoveringDropZone] = useState(false);
  const [showSnapGuideX, setShowSnapGuideX] = useState(false);
  const [showSnapGuideY, setShowSnapGuideY] = useState(false);
  const [activeDragCoords, setActiveDragCoords] = useState<{ x: number; y: number } | null>(null);

  // Drag interaction refs
  const dragContextRef = useRef<{
    mode: DragMode;
    elemId: string;
    startX: number;
    startY: number;
    elemStartX: number;
    elemStartY: number;
    initialScale: number;
    initialRotation: number;
    initialDistance: number;
    elementCenterClient: { x: number; y: number };
  }>({
    mode: null,
    elemId: '',
    startX: 0,
    startY: 0,
    elemStartX: 50,
    elemStartY: 50,
    initialScale: 1.0,
    initialRotation: 0,
    initialDistance: 100,
    elementCenterClient: { x: 0, y: 0 },
  });

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
          className="text-base sm:text-lg font-black tracking-wider uppercase drop-shadow select-none"
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
              className="text-base sm:text-lg font-black tracking-wide uppercase drop-shadow select-none"
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          );
        })}
      </div>
    );
  };

  // Helper to get element client center coordinates
  const getElementClientCenter = (elem: PlantedElement) => {
    if (!printZoneRef.current) return { x: 0, y: 0 };
    const rect = printZoneRef.current.getBoundingClientRect();
    const cx = rect.left + (elem.x / 100) * rect.width;
    const cy = rect.top + (elem.y / 100) * rect.height;
    return { x: cx, y: cy };
  };

  // 1. Start Moving Element
  const handlePointerDownMove = (e: React.PointerEvent, elem: PlantedElement) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelectElement(elem.id);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const center = getElementClientCenter(elem);

    dragContextRef.current = {
      mode: 'move',
      elemId: elem.id,
      startX: e.clientX,
      startY: e.clientY,
      elemStartX: elem.x,
      elemStartY: elem.y,
      initialScale: elem.scale,
      initialRotation: elem.rotation,
      initialDistance: 100,
      elementCenterClient: center,
    };

    setDragMode('move');
    setActiveDragCoords({ x: elem.x, y: elem.y });
  };

  // 2. Start Scaling Element (Corner Handles)
  const handlePointerDownScale = (e: React.PointerEvent, elem: PlantedElement) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelectElement(elem.id);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const center = getElementClientCenter(elem);
    const dist = Math.hypot(e.clientX - center.x, e.clientY - center.y);

    dragContextRef.current = {
      mode: 'scale',
      elemId: elem.id,
      startX: e.clientX,
      startY: e.clientY,
      elemStartX: elem.x,
      elemStartY: elem.y,
      initialScale: elem.scale || 1.0,
      initialRotation: elem.rotation || 0,
      initialDistance: dist > 10 ? dist : 50,
      elementCenterClient: center,
    };

    setDragMode('scale');
  };

  // 3. Start Rotating Element (Top Handle)
  const handlePointerDownRotate = (e: React.PointerEvent, elem: PlantedElement) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelectElement(elem.id);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const center = getElementClientCenter(elem);

    dragContextRef.current = {
      mode: 'rotate',
      elemId: elem.id,
      startX: e.clientX,
      startY: e.clientY,
      elemStartX: elem.x,
      elemStartY: elem.y,
      initialScale: elem.scale || 1.0,
      initialRotation: elem.rotation || 0,
      initialDistance: 100,
      elementCenterClient: center,
    };

    setDragMode('rotate');
  };

  // Pointer Move Handler for all active transformations
  const handlePointerMove = (e: React.PointerEvent, elem: PlantedElement) => {
    const ctx = dragContextRef.current;
    if (!ctx.mode || readOnly || selectedElementId !== elem.id) return;
    e.preventDefault();

    if (ctx.mode === 'move') {
      const zoneBox = printZoneRef.current?.getBoundingClientRect();
      if (!zoneBox || zoneBox.width === 0 || zoneBox.height === 0) return;

      const dx = ((e.clientX - ctx.startX) / zoneBox.width) * 100;
      const dy = ((e.clientY - ctx.startY) / zoneBox.height) * 100;

      let targetX = ctx.elemStartX + dx;
      let targetY = ctx.elemStartY + dy;

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

      // Safe boundaries clamping (5% to 95%)
      const clampedX = Math.round(Math.min(95, Math.max(5, targetX)));
      const clampedY = Math.round(Math.min(95, Math.max(5, targetY)));

      setActiveDragCoords({ x: clampedX, y: clampedY });
      onUpdateElementPosition(elem.id, clampedX, clampedY);
    } else if (ctx.mode === 'scale') {
      const currentDist = Math.hypot(
        e.clientX - ctx.elementCenterClient.x,
        e.clientY - ctx.elementCenterClient.y
      );
      const ratio = currentDist / ctx.initialDistance;
      const rawScale = ctx.initialScale * ratio;
      const newScale = Math.round(Math.min(1.8, Math.max(0.5, rawScale)) * 100) / 100;

      if (onUpdateElementScale) {
        onUpdateElementScale(elem.id, newScale);
      }
    } else if (ctx.mode === 'rotate') {
      const angleRad = Math.atan2(
        e.clientY - ctx.elementCenterClient.y,
        e.clientX - ctx.elementCenterClient.x
      );
      let angleDeg = Math.round(angleRad * (180 / Math.PI) + 90);

      // Normalize to -180 to 180
      while (angleDeg > 180) angleDeg -= 360;
      while (angleDeg < -180) angleDeg += 360;

      // Soft snap to 0, 45, 90, -90, 180
      if (Math.abs(angleDeg) < 4) angleDeg = 0;
      if (Math.abs(angleDeg - 90) < 4) angleDeg = 90;
      if (Math.abs(angleDeg + 90) < 4) angleDeg = -90;
      if (Math.abs(Math.abs(angleDeg) - 180) < 4) angleDeg = 180;

      if (onUpdateElementRotation) {
        onUpdateElementRotation(elem.id, angleDeg);
      }
    }
  };

  const handlePointerUp = () => {
    dragContextRef.current.mode = null;
    setDragMode(null);
    setShowSnapGuideX(false);
    setShowSnapGuideY(false);
    setActiveDragCoords(null);
  };

  // Desktop Direct File Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly && onDropUpload) {
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
    if (readOnly || !onDropUpload) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
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

  const visibleElements = elements.filter(
    (el) => el.side === side && (el.zone === activeZone.name || elements.length === 1)
  );

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full aspect-[4/5] max-w-[430px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-b from-[#13161c] to-[#0c0d11] border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center select-none touch-canvas transition-all ${
        isHoveringDropZone ? 'ring-4 ring-[#39FF14] ring-opacity-70' : ''
      }`}
    >
      {/* Background Technical Blueprint Grid with Subtle Gradient */}
      <div className="absolute inset-0 sp-stripes-subtle opacity-35 pointer-events-none" />

      {/* Top Left View Angle & Garment Specs Header */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 pointer-events-none">
        <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold tracking-wider uppercase text-white border border-neutral-700/80 shadow-sm">
          {side.toUpperCase()} VIEW
        </span>
        <span className="px-2 py-0.5 rounded-md bg-[#39FF14]/15 backdrop-blur-md text-[10px] font-mono font-bold tracking-wider uppercase text-[#39FF14] border border-[#39FF14]/40 shadow-sm">
          {colorName} · {imageType.toUpperCase()}
        </span>
      </div>

      {/* Top Right Fabric Quality Tag */}
      <div className="absolute top-3 right-3 z-30 pointer-events-none hidden sm:block">
        <span className="px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-md text-[9px] font-mono text-neutral-400 border border-neutral-800">
          380 GSM HEAVYWEIGHT
        </span>
      </div>

      {/* Desktop Direct File Drop Overlay */}
      {isHoveringDropZone && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/20 border-2 border-[#39FF14] flex items-center justify-center text-[#39FF14] animate-bounce mb-3 shadow-[0_0_25px_rgba(57,255,20,0.4)]">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-heading font-black text-white uppercase tracking-wider">
            Drop Image on Hoodie
          </h4>
          <p className="text-xs text-neutral-300 mt-1 max-w-xs">
            Instantly plants your photo or graphic on the {activeZone.name} print zone.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REALISTIC VECTOR GARMENT ILLUSTRATION & TEXTURE ENGINE */}
      {/* ========================================================================= */}
      <div className="w-full h-full p-2 flex items-center justify-center relative">
        <RealisticHoodieGraphic
          imageType={imageType}
          colorName={colorName}
          side={side}
          className="w-full h-full max-h-[96%]"
          highlightTexture={true}
        />
      </div>

      {/* ========================================================================= */}
      {/* PRINT-SAFE BOUNDING BOX & INTERACTIVE TRANSFORM CANVAS */}
      {/* ========================================================================= */}
      <div
        ref={printZoneRef}
        className="absolute z-30 transition-all duration-200 pointer-events-auto"
        style={{
          top: `${activeZone.boundingBox.top}%`,
          left: `${activeZone.boundingBox.left}%`,
          width: `${activeZone.boundingBox.width}%`,
          height: `${activeZone.boundingBox.height}%`,
        }}
      >
        {/* Dashed Print-Safe Boundary Box */}
        <div className="absolute inset-0 border-2 border-dashed border-[#39FF14]/70 rounded-lg pointer-events-none shadow-[0_0_15px_rgba(57,255,20,0.18)]">
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-[#39FF14] text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-[#39FF14]/40 shadow-md">
            {activeZone.name.toUpperCase()} (PRINT SAFE ZONE)
          </span>
        </div>

        {/* Magnetic Snapping Guidelines */}
        {showSnapGuideX && (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#39FF14] z-50 pointer-events-none shadow-[0_0_8px_#39FF14] border-l border-dashed border-black/50" />
        )}
        {showSnapGuideY && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#39FF14] z-50 pointer-events-none shadow-[0_0_8px_#39FF14] border-t border-dashed border-black/50" />
        )}

        {/* ===================================================================== */}
        {/* PLANTED PRINT ELEMENTS ON ACTIVE ZONE */}
        {/* ===================================================================== */}
        {visibleElements.map((elem) => {
          const isSelected = elem.id === selectedElementId;

          return (
            <div
              key={elem.id}
              className={`absolute transition-transform select-none ${
                isSelected ? 'z-40' : 'z-20'
              }`}
              style={{
                left: `${elem.x}%`,
                top: `${elem.y}%`,
                transform: `translate(-50%, -50%) scale(${elem.scale}) rotate(${elem.rotation}deg)`,
                cursor: dragMode === 'move' ? 'grabbing' : 'grab',
              }}
            >
              {/* INTERACTIVE TRANSFORMER BOUNDING BOX & HANDLES */}
              {isSelected && !readOnly && (
                <div className="absolute -inset-3.5 border-2 border-[#39FF14] rounded-lg pointer-events-none shadow-[0_0_14px_rgba(57,255,20,0.5)]">
                  {/* Top Rotation Handle Stem */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
                    <button
                      onPointerDown={(e) => handlePointerDownRotate(e, elem)}
                      onPointerMove={(e) => handlePointerMove(e, elem)}
                      onPointerUp={handlePointerUp}
                      className="w-5 h-5 rounded-full bg-black border-2 border-[#39FF14] text-[#39FF14] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-125 transition shadow-lg"
                      title="Drag to Rotate Angle"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                    <div className="w-0.5 h-2 bg-[#39FF14]" />
                  </div>

                  {/* 4 Corner Scale Handles (Northwest, Northeast, Southeast, Southwest) */}
                  <div
                    onPointerDown={(e) => handlePointerDownScale(e, elem)}
                    onPointerMove={(e) => handlePointerMove(e, elem)}
                    onPointerUp={handlePointerUp}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-black border-2 border-[#39FF14] rounded-sm pointer-events-auto cursor-nwse-resize hover:scale-125 transition shadow"
                    title="Drag to Scale Size"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownScale(e, elem)}
                    onPointerMove={(e) => handlePointerMove(e, elem)}
                    onPointerUp={handlePointerUp}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-black border-2 border-[#39FF14] rounded-sm pointer-events-auto cursor-nesw-resize hover:scale-125 transition shadow"
                    title="Drag to Scale Size"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownScale(e, elem)}
                    onPointerMove={(e) => handlePointerMove(e, elem)}
                    onPointerUp={handlePointerUp}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-black border-2 border-[#39FF14] rounded-sm pointer-events-auto cursor-nesw-resize hover:scale-125 transition shadow"
                    title="Drag to Scale Size"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownScale(e, elem)}
                    onPointerMove={(e) => handlePointerMove(e, elem)}
                    onPointerUp={handlePointerUp}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-black border-2 border-[#39FF14] rounded-sm pointer-events-auto cursor-nwse-resize hover:scale-125 transition shadow"
                    title="Drag to Scale Size"
                  />

                  {/* Center Coordinates & Transformation Live Badge */}
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-[8px] font-mono text-[#39FF14] px-1.5 py-0.5 rounded border border-[#39FF14]/50 pointer-events-none shadow">
                    {Math.round(elem.scale * 100)}% · {elem.rotation}°
                  </div>
                </div>
              )}

              {/* PRINT ELEMENT BODY (Draggable Core) */}
              <div
                onPointerDown={(e) => handlePointerDownMove(e, elem)}
                onPointerMove={(e) => handlePointerMove(e, elem)}
                onPointerUp={handlePointerUp}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(elem.id);
                }}
                className="relative pointer-events-auto filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              >
                {/* 1. Curated Vector Graphics with DTG Screenprint Texture */}
                {elem.type === 'graphic' && elem.svgContent ? (
                  <div
                    className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-1 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: elem.svgContent }}
                  />
                ) : elem.type === 'upload' && elem.imageUrl ? (
                  // 2. Customer Uploaded Image with Optional Low-Res Warning
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
                      elem.textColor || '#ffffff',
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
        <div className="absolute bottom-2.5 right-3 z-30 flex items-center gap-1.5">
          <button
            onClick={() => onUpdateElementPosition(selectedElementId, 50, 50)}
            className="p-1.5 rounded-lg bg-black/80 hover:bg-neutral-800 text-[#39FF14] border border-neutral-700/80 transition cursor-pointer shadow-md flex items-center gap-1 text-[10px] font-mono"
            title="Snap to Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Center</span>
          </button>
        </div>
      )}
    </div>
  );
};
