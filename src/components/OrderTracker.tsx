import React, { useState } from 'react';
import { Order, AdminConfig } from '../types';
import { formatBHD } from '../lib/store';
import { Search, Clock, Printer, Truck, CheckCircle2, ArrowLeft, MessageCircle, MapPin } from 'lucide-react';
import { RealisticHoodieGraphic } from './RealisticHoodieGraphic';

interface OrderTrackerProps {
  initialOrderId?: string;
  onFindOrder: (id: string) => Order | undefined;
  config: AdminConfig;
  onBack: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  initialOrderId = '',
  onFindOrder,
  config,
  onBack,
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [currentOrder, setCurrentOrder] = useState<Order | undefined>(
    initialOrderId ? onFindOrder(initialOrderId) : undefined
  );
  const [hasSearched, setHasSearched] = useState(Boolean(initialOrderId));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = onFindOrder(searchInput.trim());
    setCurrentOrder(found);
    setHasSearched(true);
  };

  const stages = [
    { label: 'Order placed', icon: Clock, desc: 'Payment/COD confirmed, order recorded' },
    { label: 'In production / printing', icon: Printer, desc: 'Sent to Bahrain print shop, being printed' },
    { label: 'Ready for delivery / pickup', icon: Truck, desc: 'Printing complete, out for delivery' },
  ];

  const currentStageIndex = currentOrder
    ? stages.findIndex((s) => s.label === currentOrder.status)
    : 0;
  const activeIdx = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="space-y-5 pb-12 max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div>
        <h2 className="text-2xl font-heading font-black text-white uppercase tracking-wider">
          Track Your Order
        </h2>
        <p className="text-xs text-neutral-400">
          Enter your Salapeed Order Number (e.g. SP-8421) or registered Bahrain mobile number.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="e.g. SP-8421 or +973 3944 1289"
            className="w-full pl-9 pr-3 py-2.5 bg-[#121418] border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#39FF14]"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          Track
        </button>
      </form>

      {/* Order Status Result Card */}
      {currentOrder ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Header Card */}
          <div className="blueprint-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Order ID</span>
                <h3 className="text-lg font-heading font-black text-white">#{currentOrder.id}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 text-xs font-mono font-bold">
                {currentOrder.status}
              </span>
            </div>

            {/* Stepper */}
            <div className="space-y-4 py-1">
              {stages.map((st, i) => {
                const isCompleted = i <= activeIdx;
                const isCurrent = i === activeIdx;
                const Icon = st.icon;

                return (
                  <div key={i} className="flex items-start gap-3 relative">
                    {i < stages.length - 1 && (
                      <div
                        className={`absolute left-3.5 top-7 w-0.5 h-8 ${
                          i < activeIdx ? 'bg-[#39FF14]' : 'bg-neutral-800'
                        }`}
                      />
                    )}

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border z-10 ${
                        isCurrent
                          ? 'bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.6)]'
                          : isCompleted
                          ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]'
                          : 'bg-neutral-900 text-neutral-600 border-neutral-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="text-xs">
                      <div
                        className={`font-bold ${
                          isCurrent
                            ? 'text-[#39FF14]'
                            : isCompleted
                            ? 'text-white'
                            : 'text-neutral-500'
                        }`}
                      >
                        {st.label}
                      </div>
                      <div className="text-neutral-400 text-[11px]">{st.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details breakdown */}
          <div className="blueprint-card p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Order Specification
            </h4>

            <div className="space-y-2 text-xs">
              {currentOrder.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80 flex items-center gap-3"
                >
                  <div className="w-12 h-14 rounded-md bg-[#0b0c10] border border-neutral-800 p-1 flex items-center justify-center shrink-0">
                    <RealisticHoodieGraphic
                      imageType={it.imageType}
                      colorName={it.color}
                      side="front"
                      className="w-full h-full"
                      highlightTexture={false}
                    />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{it.productName} ({it.color}, {it.size})</span>
                      <span className="font-mono text-[#39FF14]">x{it.qty}</span>
                    </div>
                    <div className="text-neutral-400 text-[11px] font-mono">
                      Placements: {it.summary}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-800 space-y-1 text-xs text-neutral-400">
              <div className="flex items-center justify-between">
                <span>Customer:</span>
                <span className="text-white font-medium">{currentOrder.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phone:</span>
                <span className="text-white font-mono">{currentOrder.customerPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment:</span>
                <span className="text-white">{currentOrder.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery:</span>
                <span className="text-white truncate max-w-[240px] text-right">
                  {currentOrder.customerAddress}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 font-bold text-white">
                <span>Total:</span>
                <span className="text-[#39FF14] font-mono text-sm">
                  {formatBHD(currentOrder.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Direct WhatsApp help button */}
          <a
            href={`https://wa.me/${config.shopPhone.replace(/[^0-9]/g, '')}?text=Inquiry%20regarding%20Salapeed%20Order%20${currentOrder.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-[#121418] hover:bg-[#1a1e26] text-neutral-300 hover:text-white border border-neutral-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#39FF14]" />
            <span>Need Help? Contact Print Shop on WhatsApp</span>
          </a>
        </div>
      ) : hasSearched ? (
        <div className="blueprint-card p-8 text-center space-y-2">
          <p className="text-sm font-bold text-white">No order found</p>
          <p className="text-xs text-neutral-400">
            We couldn't find an order matching "{searchInput}". Please double check your order number or phone number.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-neutral-900/40 rounded-xl border border-neutral-800 text-xs text-neutral-400 space-y-2">
          <div className="font-bold text-white">Demo Orders for Testing:</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchInput('SP-8421');
                setCurrentOrder(onFindOrder('SP-8421'));
                setHasSearched(true);
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[#39FF14] font-mono cursor-pointer"
            >
              SP-8421 (In production)
            </button>
            <button
              onClick={() => {
                setSearchInput('SP-9140');
                setCurrentOrder(onFindOrder('SP-9140'));
                setHasSearched(true);
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[#39FF14] font-mono cursor-pointer"
            >
              SP-9140 (Ready for delivery)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
