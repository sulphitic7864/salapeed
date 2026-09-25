import React, { useEffect, useRef, useState } from 'react';
import { GraphicItem } from '../types';
import { Search, Upload, Type, ArrowLeft, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface GraphicsLibraryProps {
  graphics: GraphicItem[];
  categories: string[];
  onSelectGraphic: (graphic: GraphicItem) => void;
  onSelectUpload: (imageUrl: string, fileName: string, isLowRes: boolean) => void;
  onSelectText: () => void;
  onBack: () => void;
}

export const GraphicsLibrary: React.FC<GraphicsLibraryProps> = ({
  graphics,
  categories,
  onSelectGraphic,
  onSelectUpload,
  onSelectText,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = graphics.filter((g) => {
    const matchesCat = activeCategory === 'All' || g.category === activeCategory;
    const matchesSearch =
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });
  const visibleGraphics = filtered.slice(0, displayLimit);
  const hasMore = displayLimit < filtered.length;

  useEffect(() => {
    setDisplayLimit(6);
  }, [search, activeCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayLimit((previous) => Math.min(previous + 6, filtered.length));
            setIsLoadingMore(false);
          }, 450);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filtered.length]);

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const isLowRes = img.width < 600 || img.height < 600;
        if (isLowRes) {
          setUploadWarning(
            `Note: Image resolution (${img.width}x${img.height}px) is low for high-definition garment printing. For best results, use 1000px+ or vector graphics.`
          );
        } else {
          setUploadWarning(null);
        }
        onSelectUpload(result, file.name, isLowRes);
        setShowUploadModal(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Placement</span>
        </button>
        <span className="text-xs font-mono text-[#39FF14]">Graphics Library</span>
      </div>

      <div>
        <h2 className="text-2xl font-heading font-black tracking-wide text-white uppercase">
          Choose Your Print
        </h2>
        <p className="text-xs text-neutral-400">
          Select from our curated Bahrain & street graphics, or upload your personal artwork.
        </p>
      </div>

      {/* Alternate Paths: Upload or Custom Text */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setShowUploadModal(true)}
          className="p-3 bg-[#13161c] hover:bg-[#1a1e27] border border-neutral-700/80 rounded-xl text-left transition cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#39FF14]/10 text-[#39FF14] flex items-center justify-center border border-[#39FF14]/30 shrink-0 group-hover:scale-105 transition">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Upload Artwork
            </div>
            <div className="text-[10px] text-neutral-400">PNG, JPG, Vector</div>
          </div>
        </button>

        <button
          onClick={onSelectText}
          className="p-3 bg-[#13161c] hover:bg-[#1a1e27] border border-neutral-700/80 rounded-xl text-left transition cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0 group-hover:scale-105 transition">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Add Custom Text
            </div>
            <div className="text-[10px] text-neutral-400">Fonts & Arc Curve</div>
          </div>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search graphics (e.g. Sakhir, Turbo, Katana)..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#121418] border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]"
        />
      </div>

      {/* Category Chips Horizontal Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#39FF14] text-black shadow-sm font-bold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Graphics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
        {visibleGraphics.map((g) => (
          <div
            key={g.id}
            onClick={() => onSelectGraphic(g)}
            className="group blueprint-card p-3 cursor-pointer hover:border-[#39FF14]/60 transition-all duration-200 flex flex-col justify-between"
          >
            {/* Thumbnail Canvas Box */}
            <div className="w-full aspect-square rounded-md bg-[#0a0b0d] border border-neutral-800/80 flex items-center justify-center p-3 overflow-hidden group-hover:scale-[1.02] transition">
              {g.svgContent ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: g.svgContent }}
                />
              ) : (
                <img
                  src={g.previewUrl}
                  alt={g.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="mt-2.5">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-white truncate">{g.name}</h4>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-neutral-300">
                  {g.category}
                </span>
                <span className="text-[#39FF14] font-medium group-hover:underline flex items-center gap-0.5">
                  <span>Select</span>
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-neutral-500 text-xs">
          No graphics found matching "{search}". Try searching another keyword or upload your own image.
        </div>
      )}

      <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center text-center">
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14] animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more graphics...</span>
          </div>
        ) : hasMore ? (
          <button
            type="button"
            onClick={() => setDisplayLimit((previous) => Math.min(previous + 6, filtered.length))}
            className="px-5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 text-xs font-mono font-bold transition cursor-pointer"
          >
            Scroll or Click to Load More Graphics ({filtered.length - visibleGraphics.length} remaining)
          </button>
        ) : filtered.length > 0 ? (
          <span className="text-[11px] font-mono text-neutral-600">
            &bull; All graphics loaded &bull;
          </span>
        ) : null}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#13161c] border border-neutral-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Upload Custom Artwork
                </h3>
                <p className="text-xs text-neutral-400">Accepted formats: PNG, JPG, SVG, WebP</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                dragActive
                  ? 'border-[#39FF14] bg-[#39FF14]/5'
                  : 'border-neutral-700 bg-neutral-900/60'
              }`}
            >
              <Upload className="w-8 h-8 text-[#39FF14] mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Drag & drop your file here</p>
              <p className="text-[11px] text-neutral-400 mt-1">or browse from your phone / computer</p>

              <label className="mt-4 inline-block px-4 py-2 bg-[#39FF14] hover:bg-[#32e012] text-black text-xs font-bold rounded-lg cursor-pointer transition shadow">
                Choose Image File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {uploadWarning && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadWarning}</span>
              </div>
            )}

            <div className="text-[11px] text-neutral-500">
              High resolution files (1000px+ width or 300dpi) provide the sharpest print on Bahrain blank garments.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
