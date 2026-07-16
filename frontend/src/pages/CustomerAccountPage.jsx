import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { MapPin, FileText, Package, X } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'tracking', label: 'Tracking Details' },
  { id: 'orders', label: 'Order History' },
];

const TRACKING_STEPS = [
  { label: 'Order Placed', desc: 'Confirmed' },
  { label: 'Packing', desc: 'Being prepared' },
  { label: 'On the Way', desc: 'In transit' },
  { label: 'Delivered', desc: 'At your door' },
];

const EMPTY_ADDRESS_FORM = {
  address_name: '',
  street_address: '',
  landmark: '',
  city: '',
  state: '',
  postal_code: '',
  is_default: false,
};

function isStepActive(status, step) {
  const s = status.toLowerCase();
  if (step === 1) return true;
  if (step === 2) return ['processing', 'shipped', 'delivered'].includes(s);
  if (step === 3) return ['shipped', 'delivered'].includes(s);
  if (step === 4) return ['delivered'].includes(s);
  return false;
}

function getProgressWidth(status) {
  const s = status.toLowerCase();
  if (s === 'delivered') return '100%';
  if (s === 'shipped') return '66%';
  if (s === 'processing') return '33%';
  return '0%';
}

function getStatusLabel(status) {
  if (status === 'pending') return 'Order Placed';
  if (status === 'processing') return 'Packing';
  return 'Out for Delivery';
}

export default function CustomerAccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const addToast = useToastStore((s) => s.addToast);

  const activeTab = searchParams.get('tab') || 'profile';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [isMobileTabMenuOpen, setIsMobileTabMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [expandedOrders, setExpandedOrders] = useState({});

  const activeOrders = useMemo(
    () => orders.filter((o) => ['pending', 'processing', 'shipped'].includes(o.status.toLowerCase())),
    [orders],
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => ['delivered', 'cancelled'].includes(o.status.toLowerCase())),
    [orders],
  );

  const fetchUserOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingOrders(true);
      const response = await fetch(`${API}/orders/user/${user.id}`);
      if (response.ok) {
        setOrders(await response.json());
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  const fetchUserAddresses = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingAddresses(true);
      const response = await fetch(`${API}/addresses/user/${user.id}`);
      if (response.ok) {
        setAddresses(await response.json());
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    fetchUserOrders();
    fetchUserAddresses();
  }, [user, fetchUserOrders, fetchUserAddresses, navigate]);

  if (!user) {
    return null; // Prevents flashing the guest UI while redirecting
  }

  const downloadInvoice = (orderId) => {
    window.open(`${API}/orders/${orderId}/invoice`, '_blank');
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      addToast('Name is required', 'error');
      return;
    }
    try {
      setSavingProfile(true);
      const response = await fetch(`${API}/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        updateUser(data.user);
        addToast('Profile changes saved successfully!', 'success');
      } else {
        addToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to connect to core authentication servers', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      addToast('Both current and new passwords are required', 'error');
      return;
    }
    try {
      setUpdatingPassword(true);
      const response = await fetch(`${API}/auth/update-password/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        addToast('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        addToast(data.error || 'Failed to update password', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to connect to authentication servers', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const openOtpModal = () => {
    setNewPhone('');
    setOtpCode('');
    setOtpStep(1);
    setShowOtpModal(true);
  };

  const closeOtpModal = () => setShowOtpModal(false);

  const handleSendOtp = async () => {
    if (!newPhone.trim()) {
      addToast('Valid sync number is required', 'error');
      return;
    }
    try {
      setSendingOtp(true);
      const response = await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: newPhone }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpStep(2);
        addToast('OTP secure protocol transmitted! Use code 123456.', 'success');
      } else {
        addToast(data.error || 'Failed to initiate OTP protocol', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to connect to telecom relays', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      addToast('Verification key is required', 'error');
      return;
    }
    try {
      setVerifyingOtp(true);
      const response = await fetch(`${API}/auth/update-mobile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPhoneNumber: newPhone, code: otpCode }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        updateUser(data.user);
        addToast('Mobile sync database entry updated!', 'success');
        closeOtpModal();
      } else {
        addToast(data.error || 'Verification rejected', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Authentication sync timeout', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      address_name: addr.address_name || '',
      street_address: addr.street_address,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });
    setShowAddressModal(true);
  };

  const closeAddressModal = () => setShowAddressModal(false);

  const saveAddress = async () => {
    const { street_address, city, state, postal_code } = addressForm;
    if (!street_address.trim() || !city.trim() || !state.trim() || !postal_code.trim()) {
      addToast('Please fill in all required address fields', 'error');
      return;
    }
    try {
      setSavingAddress(true);
      let response;
      if (editingAddress) {
        response = await fetch(`${API}/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressForm),
        });
      } else {
        response = await fetch(`${API}/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...addressForm, user_id: user.id }),
        });
      }
      const data = await response.json();
      if (response.ok) {
        addToast(
          editingAddress ? 'Shipping address updated successfully!' : 'Shipping address added successfully!',
          'success',
        );
        closeAddressModal();
        await fetchUserAddresses();
      } else {
        addToast(data.error || 'Failed to save shipping address', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to save shipping address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Are you absolutely sure you want to remove these shipping details?')) return;
    try {
      const response = await fetch(`${API}/addresses/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok && data.success) {
        addToast('Shipping details removed.', 'success');
        await fetchUserAddresses();
      } else {
        addToast(data.error || 'Failed to remove shipping details', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Purging protocol interrupted', 'error');
    }
  };

  const setAddressAsDefault = async (addr) => {
    try {
      const response = await fetch(`${API}/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street_address: addr.street_address,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          landmark: addr.landmark || null,
          address_name: addr.address_name || null,
          is_default: true,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        addToast('Primary address updated!', 'success');
        await fetchUserAddresses();
      } else {
        addToast(data.error || 'Failed to set primary address', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update primary address', 'error');
    }
  };

  const toggleOrderExpanded = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const updateAddressField = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      <style>{`
        .account-animate-fade-in { animation: accountFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .account-animate-slide-up { animation: accountSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes accountFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes accountSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .hover\\:scale-102:hover { transform: scale(1.02); }
        .hover\\:scale-103:hover { transform: scale(1.03); }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#e6394605,transparent_40%),radial-gradient(circle_at_70%_80%,#e6394608,transparent_50%)] pointer-events-none" />

      <section className="relative h-[38vh] flex items-end pb-14 px-6 overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-stella-black via-stella-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-[0.03] grayscale scale-110 blur-xs" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-2 animate-fade-up">
              <span className="w-10 h-[1.5px] bg-gradient-to-r from-stella-red to-transparent" />
              <span className="text-stella-red/80 font-black text-[10px] uppercase tracking-[0.6em] text-glow-red">Secure User Space</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-stella-red/60">{user?.name || 'Guest'}</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <button
              type="button"
              onClick={handleLogout}
              className="glass border-white/10 text-gray-300 hover:text-stella-red hover:border-stella-red/50 hover:bg-stella-red/5 hover:shadow-[0_0_20px_rgba(230,57,70,0.15)] px-10 py-5 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] transition-all duration-300 cursor-pointer active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="w-full mb-12 md:mb-16 animate-fade-up relative z-[60]" style={{ animationDelay: '0.2s' }}>
          <div className="md:hidden relative">
            <button
              type="button"
              onClick={() => setIsMobileTabMenuOpen(!isMobileTabMenuOpen)}
              className="w-full flex items-center justify-between p-5 bg-[#09090b]/90 backdrop-blur-3xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/80"
            >
              <div className="flex items-center gap-3">
                <span className="font-black uppercase tracking-[0.2em] text-[11px] text-white">
                  {TABS.find((t) => t.id === activeTab)?.label || 'Menu'}
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isMobileTabMenuOpen ? 'rotate-180 text-white' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isMobileTabMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-[#0c0c0f]/95 backdrop-blur-3xl border border-white/10 rounded-[1.25rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-1 overflow-hidden origin-top account-animate-fade-in">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setActiveTab(tab.id); setIsMobileTabMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-stella-red/10 border-stella-red/30' : 'hover:bg-white/[0.04]'}`}
                  >
                    <span className={`font-black uppercase tracking-[0.2em] text-[10px] ${activeTab === tab.id ? 'text-stella-red' : 'text-gray-400'}`}>
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-stella-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-1 p-2 bg-[#09090b]/80 backdrop-blur-3xl rounded-[2rem] border border-white/[0.08] shadow-2xl shadow-black/80 w-auto max-w-fit mx-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-10 py-4.5 rounded-[1.15rem] font-black uppercase tracking-[0.25em] text-xs transition-all duration-400 cursor-pointer select-none active:scale-[0.98] text-center ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.15)] scale-[1.03] font-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <main className="w-full min-w-0">
            {activeTab === 'profile' && (
              <div className="space-y-16 account-animate-fade-in">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">Profile Details</h2>
                  </div>

                  <div className="stella-card p-12 space-y-10 relative overflow-hidden border-white/[0.06] bg-stella-charcoal/40 backdrop-blur-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-stella-red/5 rounded-full filter blur-[80px] pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3 relative group">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Name</label>
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-stella-black/60 border border-white/10 text-white rounded-2xl py-5 px-8 focus:border-stella-red/60 focus:bg-stella-black/80 focus:shadow-[0_0_20px_rgba(230,57,70,0.12)] outline-none text-xs font-bold uppercase tracking-widest transition-all duration-300" />
                      </div>
                      <div className="space-y-3 relative group">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Email Address</label>
                        <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="ENTER EMAIL NODE" className="w-full bg-stella-black/60 border border-white/10 text-white rounded-2xl py-5 px-8 focus:border-stella-red/60 focus:bg-stella-black/80 focus:shadow-[0_0_20px_rgba(230,57,70,0.12)] outline-none text-xs font-bold uppercase tracking-widest transition-all duration-300" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Verified Mobile Link</label>
                      <div className="flex flex-col md:flex-row gap-5">
                        <input value={user?.phone || ''} disabled className="flex-1 bg-stella-black/20 border border-white/5 text-gray-600 rounded-2xl py-5 px-8 outline-none text-xs font-bold uppercase tracking-widest cursor-not-allowed select-none" />
                        <button type="button" onClick={openOtpModal} className="px-10 py-5 bg-stella-black border border-stella-gold/30 hover:border-stella-gold text-stella-gold hover:text-white hover:bg-stella-gold/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] font-black uppercase tracking-widest text-[9px] rounded-2xl transition-all duration-300 cursor-pointer active:scale-95">
                          Change the mobile number
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-5">
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-stella-red animate-pulse" />
                        Password Management
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full bg-stella-black/60 border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red/60 focus:bg-stella-black/80 outline-none text-xs font-bold transition-all duration-300" />
                        <div className="flex gap-3">
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="flex-1 bg-stella-black/60 border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red/60 focus:bg-stella-black/80 outline-none text-xs font-bold transition-all duration-300" />
                          <button type="button" onClick={handleUpdatePassword} disabled={updatingPassword || !currentPassword || !newPassword} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] border border-white/10 transition-all duration-300 disabled:opacity-50">
                            {updatingPassword ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end">
                      <button type="button" onClick={saveProfile} disabled={savingProfile} className="stella-button bg-gradient-to-r from-stella-red to-[#b91c1c] text-white px-16 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-stella-red/20 hover:shadow-stella-red/40 hover:scale-102 transition-all duration-300 cursor-pointer disabled:opacity-50 active:scale-95">
                        {savingProfile ? 'Saving Changes...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-stella-gold animate-pulse" />
                      Shipping Details
                    </h2>
                    <button type="button" onClick={openAddAddressModal} className="px-8 py-4 bg-stella-red hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-stella-red/25 transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-103 active:scale-95">
                      <span>+ Add Shipping Details</span>
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-52 bg-stella-charcoal/80 border border-white/5 rounded-[2.5rem] animate-pulse" />
                      ))}
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="stella-card p-20 text-center flex flex-col items-center border-dashed border-white/10 bg-stella-charcoal/20">
                      <div className="flex justify-center mb-6 opacity-20"><MapPin size={60} /></div>
                      <h3 className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">No Shipping Details Configured</h3>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-2">Add your first shipping details to enable direct shipping</p>
                      <button type="button" onClick={openAddAddressModal} className="mt-6 text-stella-red font-black uppercase tracking-[0.3em] text-[10px] border-b border-stella-red/20 pb-1 hover:border-stella-red transition-all cursor-pointer">Add Shipping Details</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`stella-card p-10 flex flex-col justify-between border-white/[0.05] bg-stella-charcoal/50 backdrop-blur-2xl hover:border-white/15 hover:-translate-y-1.5 transition-all duration-500 relative group overflow-hidden ${addr.is_default ? 'border-stella-gold/30 shadow-[0_10px_30px_rgba(245,158,11,0.05)]' : ''}`}
                        >
                          <div className="space-y-5">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1.5">
                                {addr.address_name && <p className="text-white font-black text-sm uppercase tracking-[0.2em]">{addr.address_name}</p>}
                                {addr.is_default && (
                                  <span className="inline-flex px-4 py-1.5 bg-stella-gold/10 border border-stella-gold/30 rounded-full text-[8px] font-black text-stella-gold uppercase tracking-[0.3em]">Primary Address</span>
                                )}
                              </div>
                              <button type="button" onClick={() => deleteAddress(addr.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-stella-red hover:border-stella-red/50 flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0">✕</button>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-white font-bold text-sm leading-relaxed">{addr.street_address}</p>
                              {addr.landmark && <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.2em]">Near: {addr.landmark}</p>}
                              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.25em]">{addr.city}, {addr.state} - {addr.postal_code}</p>
                            </div>
                          </div>
                          <div className="flex gap-3 pt-6 mt-6 border-t border-white/5">
                            <button type="button" onClick={() => openEditAddressModal(addr)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/[0.08] hover:border-white/20 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all duration-300 cursor-pointer active:scale-95">Edit Address</button>
                            {!addr.is_default ? (
                              <button type="button" onClick={() => setAddressAsDefault(addr)} className="flex-1 py-4 bg-stella-gold/10 hover:bg-stella-gold/20 text-stella-gold border border-stella-gold/40 hover:border-stella-gold rounded-xl font-black uppercase tracking-widest text-[9px] transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 hover:shadow-[0_0_16px_rgba(245,158,11,0.2)]">
                                <span>★</span> Mark as Primary
                              </button>
                            ) : (
                              <div className="flex-1 py-4 flex items-center justify-center gap-1.5 bg-stella-gold/5 border border-stella-gold/20 rounded-xl text-[9px] font-black text-stella-gold uppercase tracking-widest select-none">
                                <span>★</span> Primary
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="space-y-10 account-animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">Tracking Details</h2>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">{activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}</span>
                </div>

                {activeOrders.length === 0 ? (
                  <div className="stella-card p-24 text-center flex flex-col items-center bg-stella-charcoal/20 border-white/[0.04]">
                    <h3 className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">No Active Orders</h3>
                    <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">Your orders will appear here once placed</p>
                    <button type="button" onClick={() => navigate('/products')} className="mt-8 text-stella-red font-black uppercase tracking-[0.3em] text-[10px] border-b border-stella-red/20 pb-1 hover:border-stella-red transition-all cursor-pointer">Browse Products</button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="stella-card border border-white/[0.06] bg-stella-charcoal/40 backdrop-blur-2xl overflow-hidden relative">
                        <div className={`absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none ${order.status === 'shipped' ? 'bg-blue-500/5 blur-[80px]' : order.status === 'processing' ? 'bg-stella-gold/5 blur-[80px]' : 'bg-stella-red/5 blur-[80px]'}`} />

                        <div className="px-8 pt-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05]">
                          <div className="flex items-center gap-4">
                            <div className={`w-1 h-10 rounded-full flex-shrink-0 ${order.status === 'shipped' ? 'bg-blue-400' : order.status === 'processing' ? 'bg-stella-gold' : 'bg-stella-red'}`} />
                            <div>
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Order ID</p>
                              <h3 className="text-base font-black text-white tracking-widest">#{order.id}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.25em] border ${
                              order.status === 'shipped' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : order.status === 'processing' ? 'bg-stella-gold/10 border-stella-gold/30 text-stella-gold'
                                  : 'bg-stella-red/10 border-stella-red/30 text-stella-red'
                            }`}>
                              {getStatusLabel(order.status)}
                            </span>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total</p>
                              <p className="text-lg font-black text-white">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="px-8 py-8">
                          <div className="relative">
                            <div className="absolute top-5 left-5 right-5 h-[2px] bg-white/[0.06] z-0" />
                            <div
                              className={`absolute top-5 left-5 h-[2px] z-0 transition-all duration-1000 rounded-full ${
                                order.status === 'shipped' ? 'bg-gradient-to-r from-stella-red via-stella-red to-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.4)]'
                                  : order.status === 'processing' ? 'bg-gradient-to-r from-stella-red to-stella-gold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                    : 'bg-stella-red shadow-[0_0_10px_rgba(230,57,70,0.3)]'
                              }`}
                              style={{ width: getProgressWidth(order.status) }}
                            />
                            <div className="relative z-10 flex justify-between">
                              {TRACKING_STEPS.map((step, i) => (
                                <div key={step.label} className="flex flex-col items-center gap-2 flex-1">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-500 ${
                                    isStepActive(order.status, i + 1)
                                      ? (i === 3 ? 'bg-green-500 border-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.5)]' : 'bg-stella-red border-stella-red text-white shadow-[0_0_16px_rgba(230,57,70,0.4)]')
                                      : 'bg-[#0e0e11] border-white/10 text-gray-600'
                                  }`}>
                                    {isStepActive(order.status, i + 1) ? '✓' : (i + 1)}
                                  </div>
                                  <div className="text-center hidden sm:block">
                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isStepActive(order.status, i + 1) ? (i === 3 ? 'text-green-400' : 'text-white') : 'text-gray-600'}`}>{step.label}</p>
                                    <p className="text-[8px] text-gray-600 mt-0.5">{step.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="bg-black/30 rounded-2xl p-5 border border-white/[0.04] space-y-4">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Items in this order</p>
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-stella-black border border-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                                  <img src={item.image_url?.startsWith('/') ? `${API.replace('/api', '')}${item.image_url}` : item.image_url} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-lighten" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                  <p className="text-[10px] text-gray-500">Qty: {item.quantity} &nbsp;·&nbsp; ₹{Number(item.price).toLocaleString('en-IN')}</p>
                                </div>
                                <p className="text-xs font-black text-white flex-shrink-0">₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</p>
                              </div>
                            ))}
                          </div>

                          <div className="bg-black/30 rounded-2xl p-5 border border-white/[0.04] space-y-4">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Delivery Details</p>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div>
                                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{order.delivery_type === 'delivery' ? 'Shipping To' : 'Store Pickup'}</p>
                                  <p className="text-xs font-semibold text-gray-200 leading-relaxed">
                                    {order.delivery_type === 'delivery'
                                      ? `${order.street_address}, ${order.city}, ${order.state} - ${order.postal_code}`
                                      : order.branch_name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                                <div>
                                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Payment</p>
                                  <p className="text-xs font-semibold text-gray-200 capitalize">{order.payment_method?.replace(/_/g, ' ')}</p>
                                </div>
                                <span className={`ml-auto text-[9px] font-black px-3 py-1.5 rounded-full border ${order.payment_status === 'paid' ? 'text-green-400 bg-green-950/30 border-green-500/20' : 'text-stella-gold bg-stella-gold/10 border-stella-gold/20'}`}>
                                  {order.payment_status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                                <div>
                                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Placed On</p>
                                  <p className="text-xs font-semibold text-gray-200">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                              </div>
                              {order.expected_delivery_date && (
                                <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/[0.04] bg-white/[0.02] rounded-xl px-4 py-3">
                                  <div>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Expected Delivery</p>
                                    <p className="text-sm font-black text-white">{new Date(order.expected_delivery_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                  </div>
                                  <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-stella-gold/10 text-stella-gold border border-stella-gold/20'}`}>
                                    {order.status === 'shipped' ? 'On the way' : 'Estimated'}
                                  </span>
                                </div>
                              )}
                              <div className="pt-4 mt-2">
                                <button type="button" onClick={() => downloadInvoice(order.id)} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl transition-all border border-white/5">
                                  <span className="text-sm"><FileText size={16} /></span> Download Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-12 account-animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">Order History</h2>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Past Orders</span>
                </div>

                {loadingOrders ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-stella-charcoal/80 border border-white/5 rounded-[2.5rem] animate-pulse" />
                    ))}
                  </div>
                ) : completedOrders.length === 0 ? (
                  <div className="stella-card p-24 text-center flex flex-col items-center bg-stella-charcoal/20 border-white/[0.04]">
                    <div className="flex justify-center mb-6 opacity-20"><Package size={48} /></div>
                    <h3 className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">No Past Orders Found</h3>
                    <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">Your completed or cancelled orders will appear here</p>
                    <button type="button" onClick={() => navigate('/products')} className="mt-8 text-stella-red font-black uppercase tracking-[0.3em] text-[10px] border-b border-stella-red/20 pb-1 hover:border-stella-red transition-all cursor-pointer">Browse Products</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {completedOrders.map((order) => (
                      <div key={order.id} className="stella-card overflow-hidden border border-white/[0.05] bg-stella-charcoal/40 backdrop-blur-2xl transition-all duration-300">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleOrderExpanded(order.id)}
                          onKeyDown={(e) => e.key === 'Enter' && toggleOrderExpanded(order.id)}
                          className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center group cursor-pointer hover:bg-white/[0.02] transition-all duration-300 select-none"
                        >
                          <div className="flex items-center gap-6 w-full md:w-auto mb-6 md:mb-0">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-105 group-hover:border-stella-gold/30 flex-shrink-0">
                              {order.status === 'delivered' ? <Package size={24} /> : <X size={24} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm">Order #{order.id}</h3>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${order.status === 'delivered' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-stella-red/30 text-stella-red bg-stella-red/10'}`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • {order.items?.length || 0} Item{order.items?.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between w-full md:w-auto gap-8">
                            <div className="text-right">
                              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                              <p className="text-xl font-black text-white tracking-tighter">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                            </div>
                            <button type="button" className={`w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 ${expandedOrders[order.id] ? 'rotate-180 bg-white/10' : ''}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                          </div>
                        </div>

                        {expandedOrders[order.id] && (
                          <div className="p-8 md:p-10 bg-black/40 border-t border-white/[0.04] space-y-8 account-animate-fade-in">
                            <div className="space-y-4">
                              <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-white/5 pb-3">Items in Order</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {order.items?.map((item) => (
                                  <div key={item.id} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.03] hover:border-white/10 transition-colors">
                                    <div className="w-16 h-16 rounded-xl bg-stella-black border border-white/5 flex items-center justify-center p-2 flex-shrink-0">
                                      <img src={item.image_url?.startsWith('/') ? `${API.replace('/api', '')}${item.image_url}` : item.image_url} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-lighten" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-white font-bold text-xs truncate mb-1">{item.name}</h5>
                                      <p className="text-[10px] text-gray-500 font-bold">Qty: {item.quantity} &nbsp;·&nbsp; ₹{Number(item.price).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-sm font-black text-white flex-shrink-0">₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                              <div className="space-y-3 bg-white/[0.02] p-6 rounded-2xl border border-white/[0.03]">
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Delivery Information</h4>
                                <div className="flex items-start gap-3">
                                  <div>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{order.delivery_type === 'delivery' ? 'Shipping Address' : 'Store Pickup'}</p>
                                    <p className="text-xs font-semibold text-gray-200 leading-relaxed">
                                      {order.delivery_type === 'delivery'
                                        ? `${order.street_address}, ${order.city}, ${order.state} - ${order.postal_code}`
                                        : order.branch_name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3 bg-white/[0.02] p-6 rounded-2xl border border-white/[0.03]">
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Payment Information</h4>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Method</p>
                                    <p className="text-xs font-semibold text-gray-200 capitalize">{order.payment_method?.replace(/_/g, ' ')}</p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                                    <span className={`font-black px-3 py-1 rounded-full text-[9px] border ${order.payment_status === 'paid' ? 'text-green-400 bg-green-950/30 border-green-500/20' : 'text-stella-red bg-stella-red/10 border-stella-red/20'}`}>
                                      {order.payment_status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-span-1 md:col-span-2 mt-2">
                                <button type="button" onClick={() => downloadInvoice(order.id)} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all border border-white/5">
                                  <span className="text-sm"><FileText size={16} /></span> Download Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md account-animate-fade-in" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && closeOtpModal()}>
          <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/10 p-10 rounded-[2.5rem] space-y-8 account-animate-slide-up shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <button type="button" onClick={closeOtpModal} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[1.5px] bg-stella-gold" />
                <h3 className="text-stella-gold font-black uppercase tracking-widest text-[9px]">Telecom Relay Protocol</h3>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">Secure Mobile Sync</h2>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-relaxed">Updates the primary verification node associated with this portal credentials sync.</p>
            </div>
            {otpStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">New Mobile Synchronization Number</label>
                  <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-5 px-8 focus:border-stella-red outline-none text-xs font-bold uppercase tracking-widest text-center transition-all duration-300 focus:shadow-[0_0_15px_rgba(230,57,70,0.1)]" />
                </div>
                <button type="button" onClick={handleSendOtp} disabled={sendingOtp} className="w-full py-5 bg-stella-red hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-300 shadow-lg shadow-stella-red/25 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-95">
                  {sendingOtp ? 'TRANSMITTING OTP PROTOCOL...' : 'TRANSMIT OTP SECURE KEY'}
                </button>
              </div>
            )}
            {otpStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Enter Secure OTP (MOCK: 123456)</label>
                  <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="ENTER 6-DIGIT VERIFICATION KEY" maxLength={6} className="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-5 px-8 focus:border-stella-red outline-none text-xs font-bold uppercase tracking-widest text-center transition-all duration-300 focus:shadow-[0_0_15px_rgba(230,57,70,0.15)]" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setOtpStep(1)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest text-[9px] rounded-2xl transition-all cursor-pointer">Back</button>
                  <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp} className="flex-[2] py-5 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest text-[9px] rounded-2xl transition-all shadow-lg shadow-green-500/25 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-95">
                    {verifyingOtp ? 'SYNCHRONIZING System...' : 'VERIFY & FINALIZE SYNC'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md account-animate-fade-in" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && closeAddressModal()}>
          <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/10 rounded-[2.5rem] account-animate-slide-up shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="overflow-y-auto max-h-[90vh] p-10 space-y-7">
              <button type="button" onClick={closeAddressModal} className="absolute top-7 right-7 w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer">✕</button>
              <div className="space-y-2 pr-10">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">{editingAddress ? 'Modify Shipping Address' : 'Add Shipping Address'}</h2>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Full Name *</label>
                  <input value={addressForm.address_name} onChange={(e) => updateAddressField('address_name', e.target.value)} placeholder="Recipient's full name" className="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Street Address *</label>
                  <input value={addressForm.street_address} onChange={(e) => updateAddressField('street_address', e.target.value)} placeholder="House / Flat No., Building, Street Name" className="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Landmark</label>
                  <input value={addressForm.landmark} onChange={(e) => updateAddressField('landmark', e.target.value)} placeholder="Near a school, mall, hospital, etc." className="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">City *</label>
                    <input value={addressForm.city} onChange={(e) => updateAddressField('city', e.target.value)} placeholder="City" className="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">State *</label>
                    <input value={addressForm.state} onChange={(e) => updateAddressField('state', e.target.value)} placeholder="State" className="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Postal Code *</label>
                  <input value={addressForm.postal_code} onChange={(e) => updateAddressField('postal_code', e.target.value)} placeholder="6-digit postal code" className="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                </div>
                <div role="button" tabIndex={0} className="flex items-center space-x-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 cursor-pointer group" onClick={() => updateAddressField('is_default', !addressForm.is_default)} onKeyDown={(e) => e.key === 'Enter' && updateAddressField('is_default', !addressForm.is_default)}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${addressForm.is_default ? 'bg-stella-red border-stella-red' : 'border-white/20 bg-transparent'}`}>
                    {addressForm.is_default && <span className="text-white text-[10px] font-black">✓</span>}
                  </div>
                  <label className="text-xs font-semibold text-gray-300 cursor-pointer select-none group-hover:text-white transition-colors">Mark as Primary Address</label>
                </div>
                <button type="button" onClick={saveAddress} disabled={savingAddress} className="w-full py-5 bg-stella-red hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-300 shadow-lg shadow-stella-red/25 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-95 mt-2">
                  {savingAddress ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
