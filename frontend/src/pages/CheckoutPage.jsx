import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useToastStore } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';

import { Truck, Store, Smartphone, Lock } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cartItems = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.items.reduce((acc, item) => acc + item.price * item.quantity, 0));
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const [shippingMethod, setShippingMethod] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    address_name: 'Home',
  });

  const total = useMemo(() => subtotal, [subtotal]);
  const userId = user?.id || 1;

  useEffect(() => {
    const loadData = async () => {
      try {
        const addrRes = await fetch(`${API}/addresses/user/${userId}`);
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          setAddresses(addrData);
          if (addrData.length > 0) {
            setSelectedAddressId(addrData.find((a) => a.is_default)?.id || addrData[0].id);
          }
        }
        const branchRes = await fetch(`${API}/branches`);
        if (branchRes.ok) {
          const branchData = await branchRes.json();
          setBranches(branchData);
          if (branchData.length > 0) setSelectedBranchId(branchData[0].id);
        }
      } catch (err) {
        console.error('Error loading checkout data', err);
      }
    };
    loadData();

    // Dynamically load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [userId]);

  const saveNewAddress = async () => {
    try {
      const res = await fetch(`${API}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...newAddress, is_default: addresses.length === 0 }),
      });
      if (res.ok) {
        const added = await res.json();
        setAddresses((prev) => [...prev, added]);
        setSelectedAddressId(added.id);
        setShowAddAddressForm(false);
        addToast('Address added', 'success');
        setNewAddress({ street_address: '', city: '', state: '', postal_code: '', address_name: 'Home' });
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to add address', 'error');
      }
    } catch {
      addToast('Error saving address', 'error');
    }
  };

  const finalizeOrder = async (razorpayPaymentId = null) => {
    try {
      setShowRazorpayModal(false);
      setIsSubmitting(true);
      const orderData = {
        user_id: userId,
        items: cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity, price: item.price })),
        total_amount: total,
        delivery_type: shippingMethod,
        address_id: shippingMethod === 'delivery' ? selectedAddressId : null,
        branch_id: shippingMethod === 'pickup' ? selectedBranchId : null,
        payment_method: paymentMethod,
        razorpay_payment_id: razorpayPaymentId,
      };
      const response = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to place order');
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate('/account?tab=tracking');
    } catch (err) {
      console.error('Order error:', err);
      addToast('There was an error placing your order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateOrder = async () => {
    if (cartItems.length === 0) return addToast('Cart is empty', 'error');
    if (shippingMethod === 'delivery' && !selectedAddressId) return addToast('Please select a delivery address', 'error');
    if (shippingMethod === 'pickup' && !selectedBranchId) return addToast('Please select a pickup store', 'error');
    
    if (paymentMethod === 'online') {
      try {
        setIsSubmitting(true);
        // Create order on the backend
        const res = await fetch(`${API}/orders/razorpay/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total })
        });
        
        const data = await res.json();
        if (!res.ok) {
           setIsSubmitting(false);
           return addToast(data.error || 'Failed to initialize payment', 'error');
        }

        const options = {
          key: data.keyId,
          amount: Math.round(total * 100),
          currency: "INR",
          name: "Stella Mobiles",
          description: "Order Payment",
          order_id: data.orderId,
          handler: function (response) {
            finalizeOrder(response.razorpay_payment_id);
          },
          prefill: {
            name: user?.name || "",
            contact: user?.phone_number || ""
          },
          theme: {
            color: "#E63946"
          },
          modal: {
            ondismiss: function() {
               setIsSubmitting(false);
               addToast('Payment cancelled', 'error');
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            addToast('Payment Failed. Please try again.', 'error');
        });
        rzp1.open();

      } catch (err) {
        setIsSubmitting(false);
        console.error('Razorpay Error:', err);
        addToast('Error setting up payment gateway.', 'error');
      }
    } else {
      finalizeOrder();
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <div className="min-h-screen pb-32">
      <section className="relative h-[30vh] flex items-end pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-stella-black to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10 grayscale" />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-20">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 animate-fade-up">Checkout.</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1 space-y-16">
            <section className="relative z-50 animate-fade-up">
              <div className="flex items-center space-x-4 mb-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Delivery Method</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {['delivery', 'pickup'].map((method) => (
                  <div
                    key={method}
                    onClick={() => setShippingMethod(method)}
                    className={`stella-card px-6 py-5 cursor-pointer flex-1 flex items-center justify-center space-x-4 transition-all duration-300 rounded-2xl border ${
                      shippingMethod === method
                        ? 'bg-stella-red/10 border-stella-red shadow-[0_0_20px_rgba(229,9,20,0.2)]'
                        : 'bg-stella-black/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`text-2xl transition-transform ${shippingMethod === method ? 'scale-110' : ''}`}>
                      {method === 'delivery' ? <Truck /> : <Store />}
                    </div>
                    <h3 className={`font-black uppercase tracking-widest text-xs transition-colors ${shippingMethod === method ? 'text-white' : 'text-gray-400'}`}>
                      {method === 'delivery' ? 'Home delivery' : 'Shop pickup'}
                    </h3>
                  </div>
                ))}
              </div>
            </section>

            {shippingMethod === 'delivery' && (
              <section className="relative z-40 animate-fade-up">
                <div className="flex items-center justify-between mb-6 mt-10">
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">Select Delivery Address</h2>
                  <button onClick={() => setShowAddAddressForm(!showAddAddressForm)} className="flex items-center space-x-2 text-stella-gold hover:text-white transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest">+ New Address</span>
                  </button>
                </div>

                {showAddAddressForm && (
                  <div className="stella-card p-6 mb-6 border border-stella-gold/20 animate-fade-in">
                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['address_name', 'street_address', 'city', 'state', 'postal_code'].map((field) => (
                        <input
                          key={field}
                          value={newAddress[field]}
                          onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                          placeholder={field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          className="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-6 text-xs"
                        />
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                      <button onClick={() => setShowAddAddressForm(false)} className="text-xs text-gray-500 hover:text-white font-black uppercase tracking-widest">Cancel</button>
                      <button onClick={saveNewAddress} className="bg-stella-red text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full hover:bg-red-700 transition-colors">Save Address</button>
                    </div>
                  </div>
                )}

                {addresses.length > 0 ? (
                  <div className="relative z-50">
                    <div
                      onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                      className={`w-full bg-stella-black border border-white/10 text-white rounded-xl py-4 px-6 flex justify-between items-center cursor-pointer hover:border-stella-red/50 transition-colors ${isAddressDropdownOpen ? 'border-stella-red' : ''}`}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest truncate">
                        {selectedAddress
                          ? `${selectedAddress.address_name || 'Address'} - ${selectedAddress.street_address}, ${selectedAddress.city}`
                          : 'Select Address'}
                      </span>
                      <span className={`text-stella-gold transition-transform duration-300 ${isAddressDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                    {isAddressDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => { setSelectedAddressId(addr.id); setIsAddressDropdownOpen(false); }}
                            className={`px-6 py-4 cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5 ${selectedAddressId === addr.id ? 'bg-stella-red/10 border-l-2 border-l-stella-red' : ''}`}
                          >
                            <div className="text-xs font-bold uppercase tracking-widest text-white mb-1">{addr.address_name || 'Address'}</div>
                            <div className="text-[10px] text-gray-500 tracking-wider">{addr.street_address}, {addr.city} {addr.postal_code}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : !showAddAddressForm ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm font-medium">No saved addresses found. Please add a new address.</p>
                  </div>
                ) : null}
              </section>
            )}

            {shippingMethod === 'pickup' && (
              <section className="relative z-40 animate-fade-up">
                <div className="flex items-center space-x-4 mb-6 mt-10">
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">Select Hub Location</h2>
                </div>
                {branches.length > 0 ? (
                  <div className="relative z-50">
                    <div
                      onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                      className={`w-full bg-stella-black border border-white/10 text-white rounded-xl py-4 px-6 flex justify-between items-center cursor-pointer hover:border-stella-red/50 transition-colors ${isBranchDropdownOpen ? 'border-stella-red' : ''}`}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest truncate">{selectedBranch?.name || 'Select Hub'}</span>
                      <span className={`text-stella-gold transition-transform duration-300 ${isBranchDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                    {isBranchDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
                        {branches.map((branch) => (
                          <div
                            key={branch.id}
                            onClick={() => { setSelectedBranchId(branch.id); setIsBranchDropdownOpen(false); }}
                            className={`px-6 py-4 cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5 ${selectedBranchId === branch.id ? 'bg-stella-red/10 border-l-2 border-l-stella-red' : ''}`}
                          >
                            <div className="text-xs font-bold uppercase tracking-widest text-white mb-1">{branch.name}</div>
                            <div className="text-[10px] text-gray-500 tracking-wider"><strong className="text-gray-300">{branch.name}</strong>, {branch.address}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm font-medium">No branches available.</p>
                  </div>
                )}
              </section>
            )}

            <section className="relative z-30 animate-fade-up">
              <div className="flex items-center space-x-4 mb-6 mt-10">
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Payment Method</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                {[
                  { value: 'online', label: 'Online Payment' },
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'store', label: 'Pay In Store' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={`stella-card px-6 py-4 flex-1 cursor-pointer flex items-center justify-between transition-all duration-300 rounded-2xl border ${
                      paymentMethod === value ? 'bg-stella-red/10 border-stella-red shadow-[0_0_20px_rgba(229,9,20,0.2)]' : 'bg-stella-black/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <h3 className={`font-black uppercase tracking-widest text-xs transition-colors ${paymentMethod === value ? 'text-white' : 'text-gray-400'}`}>{label}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors ${paymentMethod === value ? 'border-stella-red bg-stella-red' : 'border-white/20'}`}>
                      {paymentMethod === value && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <input type="radio" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="hidden" />
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:w-[450px]">
            <div className="stella-card p-12 sticky top-32 animate-fade-up shadow-3xl shadow-black/50">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-10">Purchase Summary</h2>
              <div className="space-y-8 mb-10 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-stella-black rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-lighten" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <h4 className="text-white font-black uppercase tracking-widest text-sm group-hover:text-stella-red transition-colors">{item.name}</h4>
                        <p className="text-xs text-gray-500 font-black uppercase tracking-[0.2em]">QTY: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-white font-black tracking-widest text-sm whitespace-nowrap">RS {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-6 pt-6 mb-12">
                <div className="flex justify-between items-center">
                  <span className="text-white font-black uppercase tracking-widest text-lg">Total Cost</span>
                  <span className="text-white font-black text-2xl tracking-tighter">RS {total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={initiateOrder}
                disabled={isSubmitting}
                className="stella-button w-full bg-stella-red text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-stella-red/30 hover:bg-red-700 disabled:opacity-50 group relative overflow-hidden"
              >
                <span className="relative z-10">{isSubmitting ? 'Synchronizing...' : 'Proceed to Order'}</span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Removed Mock Razorpay Modal */}
    </div>
  );
}
