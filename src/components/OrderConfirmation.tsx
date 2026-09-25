import React, { useEffect, useState } from 'react';
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
  Mail,
  Eye,
  X,
  FileCheck,
  Package,
} from 'lucide-react';
import { generateCustomerConfirmationEmail } from '../lib/orderEmailService';
import { getHoodiePhoto } from '../data/mockData';

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
  const [showEmailModal, setShowEmailModal] = useState(false);

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
    { label: 'In production / printing', icon: Printer, desc: 'Printing & embroidery in Seef workshop' },
    { label: 'Ready for delivery / pickup', icon: Truck, desc: 'Dispatched with Bahrain courier' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.label === order.status);
  const activeIdx = currentStageIndex === -1 ? 0 : currentStageIndex;

  const emailData = generateCustomerConfirmationEmail(order);

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
          Thank you, <strong className="text-white">{order.customerName}</strong>! Your hoodie order has been received and scheduled for custom printing in Bahrain.
        </p>
      </div>

      {/* AUTOMATED EMAIL CONFIRMATION WITH RENDERINGS CARD */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#12161f] to-[#0d1017] border border-[#39FF14]/40 shadow-lg space-y-3 text-left">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Automated Confirmation Sent
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                To: <span className="text-[#39FF14]">{order.customerEmail || `${order.customerName.toLowerCase().replace(/\s+/g, '')}@salapeed.bh`}</span>
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold bg-[#39FF14] text-black px-2 py-0.5 rounded uppercase">
            Sent Just Now
          </span>
        </div>

        <p className="text-xs text-neutral-300">
          An automated confirmation email containing high-definition renderings of your finished hoodie design has been generated.
        </p>

        {/* Hoodie Design Renderings Showcase */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-mono uppercase text-neutral-400 font-semibold flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Rendered Hoodie Views in Confirmation:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {order.items.map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 text-center space-y-1">
                  <div className="text-[10px] font-mono uppercase text-neutral-400">
                    {item.productName} (Front)
                  </div>
                  <div className="h-28 flex items-center justify-center overflow-hidden">
                    <img
                      src={getHoodiePhoto(item.imageType, item.color, 'front')}
                      alt={`${item.productName} Front`}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-[#39FF14]">
                    Color: {item.color} &bull; {item.size}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 text-center space-y-1">
                  <div className="text-[10px] font-mono uppercase text-neutral-400">
                    {item.productName} (Back)
                  </div>
                  <div className="h-28 flex items-center justify-center overflow-hidden">
                    <img
                      src={getHoodiePhoto(item.imageType, item.color, 'back')}
                      alt={`${item.productName} Back`}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-[#39FF14]">
                    {item.placements?.length || 0} Placements
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEmailModal(true)}
          className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs font-bold rounded-lg border border-neutral-700 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>View Customer Confirmation Email Package</span>
        </button>
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
        <span>You can track your order anytime using Order ID: <strong>{order.id}</strong></span>
      </div>

      {/* Customer Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0d0f14] border border-neutral-700 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#39FF14]" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">Automated Customer Confirmation Email</h3>
                  <div className="text-[10px] font-mono text-neutral-400">Renderings & Specifications Package</div>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-neutral-800 text-xs font-mono space-y-1 text-neutral-300">
              <div><strong>To:</strong> {emailData.to}</div>
              <div><strong>From:</strong> {emailData.from}</div>
              <div><strong>Subject:</strong> {emailData.subject}</div>
            </div>

            <div
              className="p-4 bg-black rounded-xl border border-neutral-800 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: emailData.bodyHtml }}
            />

            <div className="flex justify-end pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
