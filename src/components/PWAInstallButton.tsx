import React, { useState } from 'react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { Download, Share2, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 font-medium transition cursor-pointer ${
          compact
            ? 'px-2.5 py-1 text-xs rounded bg-[#39FF14] text-black font-semibold hover:bg-[#32e012]'
            : 'px-3 py-1.5 text-xs rounded-md bg-[#39FF14] text-black font-bold hover:bg-[#32e012] shadow-sm'
        }`}
        title="Install Salapeed App on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 font-medium transition cursor-pointer ${
            compact
              ? 'px-2 py-1 text-xs rounded border border-neutral-700 text-neutral-300 hover:text-white'
              : 'px-3 py-1.5 text-xs rounded-md border border-[#39FF14]/40 text-[#39FF14] hover:bg-[#39FF14]/10'
          }`}
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#14171c] border border-neutral-700 p-5 shadow-2xl text-left">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black p-1 flex items-center justify-center border border-[#39FF14]/50">
                    <img src="/assets/salapeed-logo.svg" alt="Salapeed" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Install Salapeed</h3>
                    <p className="text-xs text-neutral-400">Add to iPhone / iPad Home Screen</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-neutral-300">
                <div className="flex items-start gap-3 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800">
                  <div className="p-1.5 rounded bg-blue-500/20 text-blue-400 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <p>1. Tap the <strong className="text-white">Share</strong> button at the bottom of Safari.</p>
                </div>
                <div className="flex items-start gap-3 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800">
                  <div className="p-1.5 rounded bg-[#39FF14]/20 text-[#39FF14] shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <p>2. Scroll down and choose <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#39FF14] py-2 text-xs font-bold text-black hover:bg-[#32e012]"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
