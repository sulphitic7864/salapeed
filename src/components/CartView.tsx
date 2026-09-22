import React from 'react';
import { CartItem } from '../types';
import { formatBHD } from '../lib/store';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { COLOR_OPTIONS } from '../data/mockData';
import { RealisticHoodieGraphic } from './RealisticHoodieGraphic';

interface CartViewProps {
  cart: CartItem[];
  deliveryFee: number;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  deliveryFee,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout,
  onContinueShopping,
}) => {
  const subtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
  const total = cart.length > 0 ? subtotal + deliveryFee : 0;

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-heading font-black text-white uppercase tracking-wider">
            Your Cart is Empty
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Design your custom hoodie with front, back, and sleeve prints to get started.
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="px-6 py-2.5 bg-[#39FF14] text-black font-heading font-black text-sm uppercase rounded-lg hover:bg-[#32e012] transition cursor-pointer shadow"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-black text-white uppercase tracking-wider">
          Shopping Cart ({cart.reduce((a, b) => a + b.qty, 0)})
        </h2>
        <button
          onClick={onContinueShopping}
          className="text-xs text-[#39FF14] hover:underline cursor-pointer"
        >
          + Add another item
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cart.map((item) => {
          const swatch = COLOR_OPTIONS[item.color] || COLOR_OPTIONS.Black;
          return (
            <div
              key={item.id}
              className="blueprint-card p-4 space-y-3 border border-neutral-800 bg-[#121419]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Realistic Hoodie Thumbnail */}
                  <div className="w-14 h-16 rounded-md relative flex items-center justify-center border border-neutral-700/60 bg-[#0d0f13] p-1 shrink-0 overflow-hidden">
                    <RealisticHoodieGraphic
                      imageType={item.imageType}
                      colorName={item.color}
                      side="front"
                      className="w-full h-full"
                      highlightTexture={false}
                    />
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{item.productName}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200">
                        Size: {item.size}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200">
                        Color: {item.color}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remove Item */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 transition cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Print Placements Summary */}
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80 text-xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#39FF14] font-semibold tracking-wider">
                  Configured Print Placements ({item.placements.length})
                </div>
                {item.placements.map((p, idx) => (
                  <div key={idx} className="text-neutral-300 text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
                    <span className="font-semibold text-white uppercase">{p.side}:</span>
                    <span>{p.zone}</span>
                    <span className="text-neutral-500">—</span>
                    <span className="text-neutral-300">
                      {p.type === 'text' ? `"${p.textContent}"` : p.graphicName || 'Artwork'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quantity Controls & Line Item Total */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                  <button
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold px-2 text-white">{item.qty}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-400 block text-[10px]">
                    {formatBHD(item.unitPrice)} each
                  </span>
                  <span className="text-base font-heading font-black text-white">
                    {formatBHD(item.unitPrice * item.qty)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary Card */}
      <div className="blueprint-card p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
          Order Summary
        </h3>
        <div className="space-y-1.5 text-xs text-neutral-400">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-neutral-200">{formatBHD(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Flat Delivery (Bahrain)</span>
            <span className="font-mono text-neutral-200">{formatBHD(deliveryFee)}</span>
          </div>
          <div className="h-px bg-neutral-800 my-1" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white uppercase tracking-wider">
              Total (BHD)
            </span>
            <span className="text-2xl font-heading font-black text-[#39FF14]">
              {formatBHD(total)}
            </span>
          </div>
        </div>

        <button
          onClick={onProceedCheckout}
          className="w-full py-3.5 px-4 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-base uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition cursor-pointer mt-2"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Assurance Note */}
      <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-2.5 text-xs text-neutral-400">
        <ShieldCheck className="w-5 h-5 text-[#39FF14] shrink-0" />
        <span>Guest checkout available • BenefitPay & Cash on Delivery accepted.</span>
      </div>
    </div>
  );
};
