import React, { useState } from 'react';
import { CartItem, AdminConfig } from '../types';
import { formatBHD } from '../lib/store';
import { ArrowLeft, CheckCircle2, ShieldCheck, QrCode, Phone, MapPin, User, AlertCircle } from 'lucide-react';

interface CheckoutViewProps {
  cart: CartItem[];
  deliveryFee: number;
  config: AdminConfig;
  onPlaceOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    paymentMethod: 'BenefitPay' | 'Benefit Transfer';
    notes?: string;
  }) => void;
  onBack: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  deliveryFee,
  config,
  onPlaceOrder,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'BenefitPay' | 'Benefit Transfer'>(
    'BenefitPay'
  );
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your Bahrain delivery address (Block, Road, Building).');
      return;
    }

    setErrorMsg(null);
    onPlaceOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      paymentMethod,
      notes: notes.trim(),
    });
  };

  return (
    <div className="space-y-5 pb-12">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      <div>
        <h2 className="text-2xl font-heading font-black text-white uppercase tracking-wider">
          Checkout
        </h2>
        <p className="text-xs text-neutral-400">
          Fast guest checkout. Orders are dispatched across Bahrain from our Seef print shop.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Customer Contact */}
        <div className="blueprint-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <User className="w-4 h-4 text-[#39FF14]" />
            <span>1. Contact Information</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">
                Full Name <span className="text-[#39FF14]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ahmed Ali Al-Ghatam"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#39FF14]"
                required
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">
                Mobile Number (Bahrain +973) <span className="text-[#39FF14]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+973 3998 1234 or 3xxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#39FF14]"
                  required
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                We send order confirmation and live dispatch updates to this phone number.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Delivery Address */}
        <div className="blueprint-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#39FF14]" />
            <span>2. Delivery Address (Bahrain Only)</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">
                Block, Road, Building, Flat / Villa <span className="text-[#39FF14]">*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="e.g. Villa 24, Road 1804, Block 318, Hoora, Manama"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#39FF14]"
                required
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">
                Special Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please leave at front security gate or call on arrival"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#39FF14]"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Method */}
        <div className="blueprint-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <span>3. Payment Method</span>
            </div>
            <span className="text-[11px] font-mono text-[#39FF14]">Local Currency: BHD</span>
          </div>

          <div className="space-y-3">
            {/* BenefitPay Official Card */}
            <div className="p-4 rounded-xl border border-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_16px_rgba(57,255,20,0.15)] text-left">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
                    <span>BenefitPay Official Transfer</span>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black">
                      BENEFIT
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-300 mt-1">
                    Instant zero-fee transfer via BenefitPay mobile application or Bahrain IBAN.
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border border-[#39FF14] bg-[#39FF14] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3]" />
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-neutral-700/60 text-xs space-y-2 text-neutral-200">
                <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-neutral-800">
                  <span className="text-neutral-400">Benefit Mobile Number:</span>
                  <span className="font-mono font-bold text-[#39FF14] text-sm">{config.benefitPhone}</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-neutral-800">
                  <span className="text-neutral-400">National IBAN:</span>
                  <span className="font-mono text-[11px] text-white select-all">{config.benefitIban}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBenefitModal(true)}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[#39FF14] text-xs font-bold border border-[#39FF14]/40 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Display Official BenefitPay QR Code</span>
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#39FF14] shrink-0" />
              <span>
                Orders are queued for production upon BenefitPay confirmation. Cash on delivery is not accepted.
              </span>
            </div>
          </div>
        </div>

        {/* 4. Total & Place Order Button */}
        <div className="blueprint-card p-4 space-y-3">
          <div className="space-y-1.5 text-xs text-neutral-400">
            <div className="flex items-center justify-between">
              <span>Items Total ({cart.reduce((a, b) => a + b.qty, 0)} garments)</span>
              <span className="font-mono text-neutral-200">{formatBHD(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Flat Delivery Fee (All Bahrain)</span>
              <span className="font-mono text-neutral-200">{formatBHD(deliveryFee)}</span>
            </div>
            <div className="h-px bg-neutral-800 my-1" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-white uppercase tracking-wider">
                Total Due
              </span>
              <span className="text-2xl font-heading font-black text-[#39FF14]">
                {formatBHD(total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-base uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Place Order ({formatBHD(total)})</span>
          </button>
        </div>
      </form>

      {/* BenefitPay QR Modal */}
      {showBenefitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#13161c] border border-neutral-700 rounded-2xl p-5 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-white uppercase">BenefitPay Transfer</span>
              <button
                onClick={() => setShowBenefitModal(false)}
                className="text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Mock QR Code Graphic */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow-lg">
              <div className="w-full h-full border-4 border-black p-2 flex flex-col items-center justify-center space-y-1">
                <div className="text-xs font-black tracking-widest text-black">BENEFITPAY</div>
                <div className="grid grid-cols-4 gap-1 p-2 bg-neutral-100 rounded">
                  <div className="w-4 h-4 bg-black" />
                  <div className="w-4 h-4 bg-neutral-300" />
                  <div className="w-4 h-4 bg-black" />
                  <div className="w-4 h-4 bg-black" />
                  <div className="w-4 h-4 bg-black" />
                  <div className="w-4 h-4 bg-black" />
                  <div className="w-4 h-4 bg-neutral-300" />
                  <div className="w-4 h-4 bg-black" />
                </div>
                <div className="text-[10px] font-mono text-black font-bold">SALAPEED BH</div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-white font-bold">Number: {config.benefitPhone}</div>
              <div className="text-neutral-400 text-[11px] font-mono">{config.benefitIban}</div>
              <div className="text-[11px] text-[#39FF14] pt-1">
                Scan via BenefitPay app or transfer using registered mobile number.
              </div>
            </div>

            <button
              onClick={() => setShowBenefitModal(false)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
