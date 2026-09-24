import React, { useEffect } from 'react';
import { Order, AdminConfig } from '../types';
import { formatBHD } from '../lib/store';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Printer,
  Truck,
  ArrowRight,
  Home,
  ShieldCheck,
  FileCode,
  Download,
  ExternalLink,
} from 'lucide-react';
import { downloadPrintShopElectronicFile, openPrintShopSpecSheet } from '../lib/printShopExport';

interface OrderConfirmationProps {
  order: Order;
  config: AdminConfig;
  onTrackOrder: (orderId: string) => void;
  onGoHome: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  config,
  onTrackOrder,
  onGoHome,
}) => {
  useEffect(() => {
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#39FF14', '#ffffff', '#ff0055', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

  const stages = [
    { label: 'Order placed', icon: Clock, desc: 'Recorded & BenefitPay payment queued' },
    { label: 'In production / printing', icon: Printer, desc: 'Sent to Bahrain print shop' },
    { label: 'Ready for delivery / pickup', icon: Truck, desc: 'Printing complete & dispatched' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.label === order.status);
  const activeIdx = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="space-y-5 pb-12 text-center max-w-lg mx-auto">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-2xl bg-[#39FF14] text-black flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(57,255,20,0.4)] animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono text-[#39FF14] uppercase tracking-widest font-bold">
          Order Successfully Placed
        </span>
        <h2 className="text-3xl font-heading font-black text-white uppercase tracking-wider">
          Order #{order.id}
        </h2>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Thank you, <strong className="text-white">{order.customerName}</strong>! Your hoodie order has been recorded and scheduled for custom printing in Bahrain.
        </p>
      </div>

      {/* ELECTRONIC FILE FOR PRINT SHOP (HD Images & Specs) */}
      <div className="p-4 rounded-xl bg-[#121419] border border-neutral-800 space-y-3 text-left">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <FileCode className="w-4 h-4 text-[#39FF14]" />
            <span>Print Shop Electronic File & HD Images</span>
          </div>
          <span className="text-[10px] font-mono text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded border border-[#39FF14]/30 font-bold">
            HD Print Ready
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          An electronic production file with high-definition front and back views, coordinate scaling, and artwork vectors has been generated for the Bahrain workshop.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => downloadPrintShopElectronicFile(order)}
            className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-[#39FF14] font-mono text-xs font-bold rounded-lg border border-[#39FF14]/40 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Electronic File (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => openPrintShopSpecSheet(order)}
            className="py-2.5 px-3 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View HD Print Spec Sheet</span>
          </button>
        </div>
      </div>

      {/* Order Status Stepper */}
      <div className="blueprint-card p-4 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            In-App Live Status Tracker
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 font-bold">
            {order.status}
          </span>
        </div>

        <div className="space-y-4 pt-1">
          {stages.map((st, i) => {
            const isCompleted = i <= activeIdx;
            const isCurrent = i === activeIdx;
            const Icon = st.icon;

            return (
              <div key={i} className="flex items-start gap-3 relative">
                {/* Connector line */}
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
                      isCurrent ? 'text-[#39FF14]' : isCompleted ? 'text-white' : 'text-neutral-500'
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

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => onTrackOrder(order.id)}
          className="py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-heading font-bold text-xs uppercase rounded-lg border border-neutral-700 transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Track Order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onGoHome}
          className="py-3 px-4 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
        <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
        <span>You can revisit your order anytime using Order ID: <strong>{order.id}</strong></span>
      </div>
    </div>
  );
};
