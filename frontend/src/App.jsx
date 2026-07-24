import { useEffect, useState, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE as API, getImageUrl } from './lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import LoginModal from '@/components/LoginModal';
import CartDrawer from '@/components/CartDrawer';
import ToastNotification from '@/components/ToastNotification';
import HomePage from '@/pages/HomePage';
import ProductListPage from '@/pages/ProductListPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CustomerAccountPage from '@/pages/CustomerAccountPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import LoginPage from '@/pages/LoginPage';
import Reveal3D from '@/components/Reveal3D';
import CleanLogo from '@/components/CleanLogo';
import OldCleanLogo from '@/components/OldCleanLogo';
import LegalPage from '@/pages/LegalPage';

// Removed local API declaration because it's imported above
const defaultNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Our Story', path: '/#our-story' },
  { name: 'Franchise', path: '/#franchise' },
];

const footerSections = [
  {
    title: 'Legal & Policies',
    links: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Product Warranty', path: '/warranty' },
      { name: 'Return Policy', path: '/return-policy' },
    ],
  },
  {
    title: 'Customer Support',
    links: [
      { name: 'My Account', path: '/account' },
      { name: 'Track Your Order', path: '/account?tab=tracking' },
      { name: 'Order History', path: '/account?tab=orders' },
    ],
  },
  {
    title: 'Stella Mobiles',
    links: [
      { name: 'Our Story', path: '/#our-story' },
      { name: 'Franchise Program', path: '/#franchise' },
      { name: 'Our Branches', path: '/#branches' },
    ],
  },
];

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 112;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);
  return null;
}

function getNavLinkPath(name) {
  if (!name) return '/';
  const norm = name.trim().toLowerCase();
  if (norm === 'home') return '/';
  if (norm === 'products') return '/products';
  if (norm === 'our story' || norm === 'about' || norm === 'about us') return '/#our-story';
  if (norm === 'franchise') return '/#franchise';
  return `/products?category=${encodeURIComponent(name.trim())}`;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const showLoginModal = useAuthStore((s) => s.showLoginModal);
  const toggleLoginModal = useAuthStore((s) => s.toggleLoginModal);
  const totalItems = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0));

  const [showCart, setShowCart] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [showMobileProductsDropdown, setShowMobileProductsDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  const [globalConfig, setGlobalConfig] = useState(null);

  useEffect(() => {
    fetch(`${API}/site-config/homepage`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            setGlobalConfig(parsed);
          } catch (e) {
            console.error('Failed to parse global config', e);
          }
        }
      })
      .catch((err) => console.error('Error fetching global config:', err));
  }, []);

  const hideNav = location.pathname === '/login';

  const navLinks = (globalConfig?.navLinks && globalConfig.navLinks.length > 0)
    ? globalConfig.navLinks.map(link => ({
      name: link.name || link.label,
      path: link.path || link.link || (link.category ? `/products?category=${encodeURIComponent(link.category)}` : '/')
    }))
    : defaultNavLinks;
  const currentFooterSections = globalConfig?.footerSections || footerSections;
  const companyDescription = globalConfig?.companyDescription || "Redefining the premium mobile shopping experience across India. Innovation, trust, and zero-compromise service.";

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => {
            const orderA = a.sort_order && Number(a.sort_order) > 0 ? Number(a.sort_order) : 99999;
            const orderB = b.sort_order && Number(b.sort_order) > 0 ? Number(b.sort_order) : 99999;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return (a.name || '').localeCompare(b.name || '');
          });
          setCategories(sorted);
        }
      })
      .catch((err) => console.error('Error fetching dynamic categories:', err));
  }, [location.pathname]);

  const handleAccountClick = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/account');
    } else {
      toggleLoginModal(true);
    }
  };

  const goToCheckout = () => {
    setShowCart(false);
    navigate('/checkout');
  };

  const handleNavClick = (e, path) => {
    if (path && path.startsWith('/#')) {
      e.preventDefault();
      const id = path.slice(2);
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 112;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        navigate(path);
      }
    }
  };

  useEffect(() => {
    let timeout;
    if (showProductsDropdown) {
      timeout = setTimeout(() => {
         // handle delayed closing logic if we want, but for now we'll rely on onMouseLeave
      }, 300);
    }
    return () => clearTimeout(timeout);
  }, [showProductsDropdown]);

  return (
    <div className="relative min-h-screen w-full">
      <div className="stella-bg" aria-hidden="true" />
      <div className="relative z-10 w-full">
        <ScrollManager />

        {!hideNav && createPortal(
          <>
          <header
            className="site-header fixed top-0 left-0 right-0 z-[100] border-b border-white/5 px-4 sm:px-6 h-[4.5rem] md:h-20 bg-[#0a0a0c]"
            style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="relative max-w-7xl mx-auto h-full flex items-center pr-[7rem] md:pr-40">
              <div
                className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0 min-w-0"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <CleanLogo
                  className="h-11 w-11 md:h-14 md:w-14 object-contain rounded-full shrink-0"
                />
                <OldCleanLogo
                  className="h-11 w-[140px] md:h-14 md:w-[200px] object-contain object-left shrink-0"
                />
              </div>

              <nav className="hidden md:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2">
                {navLinks.map((link) => (
                  <div 
                    key={link.name} 
                    className={`relative ${link.name === 'Products' ? 'products-dropdown-container group/navitem' : ''}`}
                    onMouseEnter={() => link.name === 'Products' && setShowProductsDropdown(true)}
                    onMouseLeave={() => link.name === 'Products' && setShowProductsDropdown(false)}
                  >
                    <Link
                      to={link.name === 'Products' ? '/products' : getNavLinkPath(link.name)}
                      onClick={(e) => {
                        if (link.name !== 'Products') {
                          handleNavClick(e, link.path);
                        }
                        setShowProductsDropdown(false);
                      }}
                      className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors py-8 inline-block relative group"
                    >
                      {link.name}
                      <span className="absolute bottom-6 left-0 w-0 h-[2px] bg-stella-red transition-all duration-300 group-hover:w-full" />
                    </Link>
                    {link.name === 'Products' && categories.length > 0 && (
                      <div 
                        className={`fixed top-20 left-0 w-full bg-black/90 backdrop-blur-2xl border-b border-white/10 overflow-hidden transition-all duration-300 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 ${showProductsDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}
                        style={{ backdropFilter: 'blur(20px)' }}
                      >
                        <div className="max-w-7xl mx-auto p-10">
                          <h3 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-8 border-b border-white/10 pb-4">Shop by Category</h3>
                          <div className="grid grid-cols-4 lg:grid-cols-5 gap-x-10 gap-y-6">
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/products?category=${encodeURIComponent(cat.name)}`}
                                onClick={() => setShowProductsDropdown(false)}
                                className="group/cat flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5"
                              >
                                {cat.image_url ? (
                                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1 shrink-0 group-hover/cat:border-stella-gold/40 transition-colors">
                                    <img src={getImageUrl(cat.image_url)} alt={cat.name} className="w-full h-full object-contain mix-blend-lighten" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/cat:border-stella-gold/40 transition-colors">
                                    <div className="w-3.5 h-3.5 rounded-full bg-stella-gold/50" />
                                  </div>
                                )}
                                <span className="block text-[9px] font-black text-gray-400 group-hover/cat:text-white uppercase tracking-widest transition-colors leading-tight">
                                  {cat.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                          
                          <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Explore our complete catalog</p>
                            <Link 
                              to="/products"
                              onClick={() => setShowProductsDropdown(false)}
                              className="text-[9px] text-stella-gold font-black uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-2"
                            >
                              View All Products <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </header>

          {/* Icons in their own fixed opaque tray — solid bg so hero fade can't composite through them */}
          <div
            className="fixed top-0 right-0 z-[110] h-[4.5rem] md:h-20 flex items-center gap-1.5 sm:gap-3 md:gap-6 px-4 sm:px-6 bg-[#0a0a0c] pointer-events-auto"
            style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
                <Link to="/" className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-stella-gray border border-white/5 text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>

                <button onClick={handleAccountClick} className="group flex items-center gap-2">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-stella-gray border border-white/5 flex items-center justify-center group-hover:border-stella-red/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  {user && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white hidden lg:block">
                      {user.name.split(' ')[0]}
                    </span>
                  )}
                </button>

                <button onClick={() => setShowCart(true)} className="hidden md:flex group relative items-center justify-center w-9 h-9 shrink-0">
                  <div className="w-full h-full rounded-full bg-stella-gray border border-white/5 flex items-center justify-center group-hover:border-stella-red/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-stella-red text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-stella-black">
                      {totalItems}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-stella-gray border border-white/5 text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
          </div>
          </>,
          document.body
        )}

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-[120] bg-stella-black/80 backdrop-blur-md md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {isMobileMenuOpen && (
          <div className="fixed inset-y-0 right-0 z-[130] w-[80%] max-w-sm bg-[#0d0d10] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] md:hidden flex flex-col animate-curtain-reveal">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>
                <CleanLogo className="h-10 w-10 object-contain rounded-full" height={40} />
                <div className="flex flex-col items-center justify-center">
                  <OldCleanLogo className="h-16 object-contain" height={64} />
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/10 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Reveal3D tag="div" variant="right" stagger={60} className="flex-1 overflow-y-auto px-6 py-8 space-y-3 custom-scrollbar" refreshKey="mobile-menu">
              {navLinks.filter(l => l.name !== 'Home').map((link) => (
                <div key={link.name} data-reveal-child>
                  <Link
                    to={link.name === 'Products' ? '#' : getNavLinkPath(link.name)}
                    onClick={(e) => {
                      if (link.name === 'Products') {
                        e.preventDefault();
                        setShowMobileProductsDropdown(!showMobileProductsDropdown);
                      } else {
                        handleNavClick(e, link.path);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="flex items-center space-x-4 text-sm font-black uppercase tracking-widest text-gray-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.02] hover:border-stella-red/50 px-5 py-4 rounded-xl transition-all duration-300 hover:translate-x-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-stella-red group-hover:shadow-[0_0_10px_rgba(229,9,20,0.8)] transition-shadow" />
                    <span className="group-hover:text-glow-red transition-all duration-300 flex-1">{link.name}</span>
                    {link.name === 'Products' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${showMobileProductsDropdown ? 'rotate-180 text-stella-red' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>
                  {link.name === 'Products' && categories.length > 0 && (
                    <div className={`ml-8 mt-2 space-y-2 border-l border-white/10 pl-4 overflow-hidden transition-all duration-300 ${showMobileProductsDropdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-transparent mt-0'}`}>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setShowMobileProductsDropdown(false);
                          }}
                          className="block text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white py-2"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div data-reveal-child>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowCart(true);
                  }}
                  className="w-full flex items-center space-x-4 text-sm font-black uppercase tracking-widest text-gray-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.02] hover:border-stella-red/50 px-5 py-4 rounded-xl transition-all duration-300 hover:translate-x-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-stella-gold group-hover:shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-shadow" />
                  <span className="flex-1 text-left">Cart</span>
                  {totalItems > 0 && (
                    <span className="min-w-5 h-5 px-1.5 bg-stella-red text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </Reveal3D>
          </div>
        )}

        <main className={hideNav ? '' : 'pt-20'}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-stella-red border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/account" element={<CustomerAccountPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/privacy" element={<LegalPage type="privacy" />} />
              <Route path="/terms" element={<LegalPage type="terms" />} />
              <Route path="/warranty" element={<LegalPage type="warranty" />} />
              <Route path="/return-policy" element={<LegalPage type="return_policy" />} />
            </Routes>
          </Suspense>
        </main>

        {showLoginModal && <LoginModal onClose={() => toggleLoginModal(false)} />}
        {showCart && <CartDrawer onClose={() => setShowCart(false)} onCheckout={goToCheckout} />}

        {!hideNav && (
          <footer className="bg-stella-black border-t border-white/5 py-6 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:grid md:grid-cols-4 gap-6 mb-6">
                <div className="md:col-span-1">
                  <div className="flex items-center space-x-3 group mb-3">
                    <CleanLogo className="h-10 w-10 object-contain rounded-full" height={40} />
                    <div className="flex flex-col items-center justify-center">
                      <OldCleanLogo className="h-16 md:h-20 object-contain" height={64} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 font-medium max-w-sm">
                    {companyDescription}
                  </p>
                  <div className="flex space-x-3">
                    {[
                      { name: 'WhatsApp', url: 'https://wa.me/919345110510', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg> },
                      { name: 'Instagram', url: 'https://instagram.com/stellahitech/', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
                      { name: 'Facebook', url: 'https://facebook.com/stellahitech', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> },
                      { name: 'YouTube', url: 'https://youtube.com/@StellaHiTech', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg> },
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={social.name}
                        className="w-8 h-8 rounded-full bg-stella-charcoal flex items-center justify-center border border-white/5 hover:border-stella-red hover:text-stella-red text-white transition-all hover:-translate-y-1"
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:col-span-3">
                  {currentFooterSections.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-white font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mb-3 leading-tight break-words">{section.title}</h4>
                      <ul className="space-y-2">
                        {section.links.map((link) => (
                          <li key={link.name}>
                            <Link
                              to={link.path}
                              onClick={(e) => {
                                if (!user && link.path.startsWith('/account')) {
                                  e.preventDefault();
                                  toggleLoginModal(true);
                                }
                              }}
                              className="text-gray-500 hover:text-white text-[10px] sm:text-xs transition-colors font-medium block leading-snug"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-center md:text-left">
                <p className="text-gray-600 text-[10px] font-medium uppercase tracking-widest">&copy; 2026 Stella Mobiles. Master Control Systems.</p>
              </div>
            </div>
          </footer>
        )}

        <ToastNotification />

        <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        .animate-curtain-reveal { animation: curtainReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes curtainReveal {
          from {
            clip-path: circle(0% at 100% 0%);
          }
          to {
            clip-path: circle(150% at 100% 0%);
          }
        }
      `}</style>
      </div>
    </div>
  );
}
