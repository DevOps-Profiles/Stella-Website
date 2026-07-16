import { useCartStore } from '@/stores/cartStore';

export default function CartDrawer({ onClose, onCheckout }) {
  const cartItems = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getTotalPrice());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const increaseQty = (item) => updateQuantity(item.id, item.quantity + 1);
  const decreaseQty = (item) => {
    if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
    else removeFromCart(item.id);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-full max-w-md transform transition ease-in-out duration-500 sm:duration-700 translate-x-0 bg-stella-charcoal border-l border-gray-800 shadow-2xl flex flex-col h-full animate-slide-in-right">
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800 bg-[#0a0a0a]">
            <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center" id="slide-over-title">
              <span className="w-1.5 h-6 bg-stella-red mr-3" /> Your Cart
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors bg-stella-black w-8 h-8 rounded-full flex items-center justify-center border border-gray-800 shadow-inner"
            >
              <span className="sr-only">Close panel</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-400 text-lg font-light">Your cart is empty.</p>
                <button onClick={onClose} className="mt-6 text-stella-red font-bold uppercase tracking-widest text-xs hover:underline hover:text-white transition-colors border border-stella-red px-6 py-2 rounded">
                  Start Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex pb-6 border-b border-gray-800 last:border-b-0 last:pb-0 group">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-700 bg-[#080808] p-2 flex items-center justify-center group-hover:border-gray-500 transition-colors">
                      <img src={item.img} alt={item.name} className="h-full w-full object-contain mix-blend-lighten" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-base font-bold text-white mb-1">
                          <h3 className="text-sm tracking-wide">{item.name}</h3>
                          <p className="ml-4">RS {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">In Stock</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between">
                        <div className="flex items-center border border-gray-700 rounded bg-stella-black h-8 shadow-inner">
                          <button onClick={() => decreaseQty(item)} className="px-3 text-gray-400 hover:text-white transition-colors">-</button>
                          <span className="px-2 text-sm font-bold text-white w-6 text-center">{item.quantity}</span>
                          <button onClick={() => increaseQty(item)} className="px-3 text-gray-400 hover:text-white transition-colors">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} type="button" className="font-medium text-gray-500 hover:text-stella-red text-xs uppercase tracking-widest transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-800 px-6 py-8 bg-[#0a0a0a]">
              <div className="flex justify-between text-base font-black text-white mb-4 items-end">
                <p className="uppercase tracking-wider text-sm">Subtotal</p>
                <p className="text-2xl">RS {subtotal.toFixed(2)}</p>
              </div>
              <p className="text-xs text-gray-500 mb-6 font-light">Shipping and taxes calculated at checkout.</p>
              <div className="mt-6">
                <button onClick={onCheckout} className="w-full bg-stella-red border border-transparent rounded shadow-lg shadow-stella-red/20 py-4 px-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-colors">
                  Proceed to Checkout
                </button>
              </div>
              <div className="mt-6 flex justify-center text-center text-xs text-gray-500">
                <p>
                  or{' '}
                  <button onClick={onClose} type="button" className="font-bold text-white hover:text-stella-red ml-1 transition-colors uppercase tracking-widest">
                    Continue Shopping
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
