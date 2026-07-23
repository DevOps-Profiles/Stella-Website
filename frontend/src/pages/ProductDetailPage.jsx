import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getImageUrl } from '@/lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import Reveal3D from '@/components/Reveal3D';
import KineticTitle from '@/components/KineticTitle';

const API = import.meta.env.VITE_API_BASE_URL;

const defaultReviews = [
  { id: 1, name: 'Michael T.', title: 'Exceeded all expectations!', content: "I was hesitant about upgrading, but the display is the brightest I've ever seen, and the battery lasts two full days.", stars: 5 },
  { id: 2, name: 'Priya K.', title: 'Premium experience, premium product', content: "Picked up in-store and the team was incredibly helpful with setup. The device quality is unreal for the price.", stars: 5 },
  { id: 3, name: 'Arjun S.', title: 'Best purchase this year', content: "Smooth, fast, and the camera is phenomenal. Stella's store experience makes it even better — will definitely return.", stars: 5 },
  { id: 4, name: 'Deepa R.', title: 'Worth every rupee', content: 'Bought for my husband as a gift. He absolutely loves it. The packaging and presentation from Stella was top class.', stars: 5 },
  { id: 5, name: 'Karthik B.', title: 'Stellar performance', content: 'Gaming, photography, everyday use — handles everything flawlessly. No lag, no heat issues. Very impressed.', stars: 5 },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, s) => (
        <svg key={s} className="w-3 h-3 fill-stella-gold text-stella-gold" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 space-y-2 transition-all duration-300 relative hover:border-stella-red/30 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-stella-red/10 hover:z-20">
      <StarRating count={review.stars} />
      <p className="text-white font-bold text-xs uppercase tracking-wider">{review.title}</p>
      <p className="text-gray-400 text-xs font-light leading-relaxed">{review.content}</p>
      <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">— {review.name}</p>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const toggleLoginModal = useAuthStore((s) => s.toggleLoginModal);
  const addToCartStore = useCartStore((s) => s.addToCart);
  const addToast = useToastStore((s) => s.addToast);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState(defaultReviews);
  const [newReview, setNewReview] = useState({ title: '', content: '', stars: 5 });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewHovered, setReviewHovered] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState('');

  const getSpecString = useCallback((ram, storage) => {
    const r = ram ? (String(ram).toLowerCase().includes('gb') ? ram : `${ram}GB`) : '';
    const s = storage ? (String(storage).toLowerCase().includes('gb') ? storage : `${storage}GB`) : '';
    return [r, s].filter(Boolean).join(' + ');
  }, []);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const initial = product.variants[0];
      setSelectedColor((initial.color || '').trim());
      setSelectedSpecs(getSpecString(initial.ram, initial.storage));
    }
  }, [product, getSpecString]);

  const colors = useMemo(() => {
    if (!product || !product.variants) return [];
    const unique = [];
    const seen = new Set();
    product.variants.forEach(variant => {
      if (variant.color) {
        const normalized = variant.color.trim();
        const lower = normalized.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          unique.push(normalized);
        }
      }
    });
    return unique;
  }, [product]);

  const specs = useMemo(() => {
    if (!product || !product.variants) return [];
    // Only display specs that are available for the currently selected color
    const filtered = product.variants.filter(variant => 
      (variant.color || '').trim().toLowerCase() === (selectedColor || '').trim().toLowerCase()
    );
    const targetVariants = filtered.length > 0 ? filtered : product.variants;
    return [...new Set(targetVariants.map(variant => getSpecString(variant.ram, variant.storage)).filter(Boolean))];
  }, [product, selectedColor, getSpecString]);

  const selectedVariantIdx = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    const idx = product.variants.findIndex(variant => 
      (variant.color || '').trim().toLowerCase() === (selectedColor || '').trim().toLowerCase() && 
      getSpecString(variant.ram, variant.storage) === selectedSpecs
    );
    return idx !== -1 ? idx : 0;
  }, [product, selectedColor, selectedSpecs, getSpecString]);

  const handleColorSelect = (col) => {
    setSelectedColor(col.trim());
    const matchingVariant = product.variants.find(variant => 
      (variant.color || '').trim().toLowerCase() === col.trim().toLowerCase() && 
      getSpecString(variant.ram, variant.storage) === selectedSpecs
    ) || product.variants.find(variant => 
      (variant.color || '').trim().toLowerCase() === col.trim().toLowerCase()
    );
    if (matchingVariant) {
      setSelectedSpecs(getSpecString(matchingVariant.ram, matchingVariant.storage));
    }
  };

  const handleSpecsSelect = (sp) => {
    setSelectedSpecs(sp);
    const matchingVariant = product.variants.find(variant => 
      getSpecString(variant.ram, variant.storage) === sp && 
      (variant.color || '').trim().toLowerCase() === (selectedColor || '').trim().toLowerCase()
    ) || product.variants.find(variant => 
      getSpecString(variant.ram, variant.storage) === sp
    );
    if (matchingVariant) {
      setSelectedColor((matchingVariant.color || '').trim());
    }
  };

  const reviewScrollEl = useRef(null);
  const reviewScrollPos = useRef(0);
  const animFrameId = useRef(null);

  const showMore = reviews.length > 3;
  const loopingReviews = useMemo(() => (showMore ? [...reviews, ...reviews] : reviews), [reviews, showMore]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        
        let additional = data.additional_images || [];
        if (typeof additional === 'string') {
          try {
            additional = JSON.parse(additional);
          } catch (e) {
            additional = [];
          }
        }
        if (!Array.isArray(additional)) {
          additional = [];
        }

        let parsedSpecs = data.specs || {};
        if (typeof parsedSpecs === 'string') {
          try {
            parsedSpecs = JSON.parse(parsedSpecs);
          } catch (e) {
            parsedSpecs = {};
          }
        }
        
        // Remove internal manufacturer URL from public specs display
        const mUrl = parsedSpecs.manufacturer_url;
        if (parsedSpecs.manufacturer_url) {
          delete parsedSpecs.manufacturer_url;
        }

        let parsedVariants = [];
        if (data.variants) {
          try {
            parsedVariants = typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants;
          } catch(e) {
            parsedVariants = [];
          }
        }
        
        let parsedReviews = [];
        if (data.reviews) {
          try {
            parsedReviews = typeof data.reviews === 'string' ? JSON.parse(data.reviews) : data.reviews;
          } catch(e) {
            parsedReviews = [];
          }
        }
        if (!Array.isArray(parsedReviews) || parsedReviews.length === 0) {
          parsedReviews = defaultReviews;
        }
        setReviews(parsedReviews);

        setProduct({
          id: data.id,
          name: data.name,
          price: data.price,
          description: data.description,
          stock_quantity: data.stock_quantity,
          category_name: data.category_name,
          manufacturer_url: mUrl,
          images: (data.image_url ? [data.image_url, ...additional] : ['https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=800&q=80']).map(img => getImageUrl(img)),
          specs: Object.entries(parsedSpecs).map(([label, value]) => ({ label, value })),
          variants: parsedVariants,
        });


      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!showMore) return;
    const animate = () => {
      const el = reviewScrollEl.current;
      if (el && !reviewHovered) {
        reviewScrollPos.current += 0.6;
        if (reviewScrollPos.current >= el.scrollHeight / 2) reviewScrollPos.current = 0;
        el.scrollTop = reviewScrollPos.current;
      } else if (el) {
        reviewScrollPos.current = el.scrollTop;
      }
      animFrameId.current = requestAnimationFrame(animate);
    };
    animFrameId.current = requestAnimationFrame(animate);
    return () => { if (animFrameId.current) cancelAnimationFrame(animFrameId.current); };
  }, [showMore, reviewHovered]);

  const displayPrice = useMemo(() => {
    if (product && product.variants && product.variants.length > 0 && selectedVariantIdx !== null && product.variants[selectedVariantIdx]) {
      return product.variants[selectedVariantIdx].price;
    }
    return product ? product.price : 0;
  }, [product, selectedVariantIdx]);

  const isOutOfStock = useMemo(() => {
    if (!product) return true;
    if (product.variants && product.variants.length > 0 && selectedVariantIdx !== null) {
      const variant = product.variants[selectedVariantIdx];
      if (variant) {
        const vStock = variant.stock_quantity !== undefined ? parseInt(variant.stock_quantity, 10) : 0;
        return vStock <= 0;
      }
    }
    return product.stock_quantity <= 0;
  }, [product, selectedVariantIdx]);

  const isColorOutOfStock = (col) => {
    if (!product || !product.variants) return false;
    const variantsForColor = product.variants.filter(variant => 
      (variant.color || '').trim().toLowerCase() === col.trim().toLowerCase()
    );
    if (variantsForColor.length === 0) return true;
    return variantsForColor.every(variant => {
      const vStock = variant.stock_quantity !== undefined ? parseInt(variant.stock_quantity, 10) : 0;
      return vStock <= 0;
    });
  };

  const isSpecOutOfStock = (sp) => {
    if (!product || !product.variants) return false;
    const variant = product.variants.find(variantItem => 
      (variantItem.color || '').trim().toLowerCase() === (selectedColor || '').trim().toLowerCase() && 
      getSpecString(variantItem.ram, variantItem.storage) === sp
    );
    if (!variant) return true;
    const vStock = variant.stock_quantity !== undefined ? parseInt(variant.stock_quantity, 10) : 0;
    return vStock <= 0;
  };

  const addToCart = () => {
    if (!user) { toggleLoginModal(true); return; }
    if (isOutOfStock) { addToast('This item is currently out of stock.', 'error'); return; }
    if (product) {
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 600);
      
      const hasVariants = product.variants && product.variants.length > 0;
      const currentVariant = hasVariants ? product.variants[selectedVariantIdx] : null;
      
      const cartItemPrice = currentVariant ? currentVariant.price : product.price;
      const variantDetails = currentVariant 
        ? [currentVariant.color, currentVariant.ram, currentVariant.storage].filter(Boolean).join(' / ') 
        : '';
        
      const cartItemId = currentVariant 
        ? `${product.id}-${currentVariant.color || ''}-${currentVariant.ram || ''}-${currentVariant.storage || ''}`.replace(/\s+/g, '')
        : String(product.id);

      for (let i = 0; i < quantity; i++) {
        addToCartStore({
          id: product.id,
          cartItemId: cartItemId,
          name: product.name,
          price: cartItemPrice,
          variantLabel: variantDetails,
          img: product.images[0]
        });
      }
      addToast(`${product.name}${variantDetails ? ` (${variantDetails})` : ''} added to cart!`, 'success');
    }
  };

  const buyNow = () => {
    if (!user) { toggleLoginModal(true); return; }
    if (isOutOfStock) { addToast('This item is currently out of stock.', 'error'); return; }
    addToCart();
    navigate('/checkout');
  };

  const submitReview = async () => {
    if (!newReview.title.trim() || !newReview.content.trim()) return;
    setReviewSubmitting(true);
    try {
      const newReviewObj = {
        id: Date.now(),
        name: user?.name || 'Anonymous',
        title: newReview.title,
        content: newReview.content,
        stars: newReview.stars
      };
      const updatedReviews = [newReviewObj, ...reviews];
      const response = await fetch(`${API}/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: updatedReviews })
      });
      if (!response.ok) throw new Error('Failed to submit review');
      
      setReviews(updatedReviews);
      setNewReview({ title: '', content: '', stars: 5 });
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
      addToast('Review submitted successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-stella-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Product Not Found</h2>
        <Link to="/products" className="stella-button bg-stella-red text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
      <nav className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        {product.category_name ? (
          <>
            <Link to={`/products?category=${encodeURIComponent(product.category_name)}`} className="hover:text-white transition-colors">{product.category_name}</Link>
            <span>/</span>
          </>
        ) : (
          <>
            <Link to="/products" className="hover:text-white transition-colors">Catalog</Link>
            <span>/</span>
          </>
        )}
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="bg-[#0e0e11] rounded-2xl border border-white/[0.05] h-[320px] lg:h-[380px] flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(230,57,70,0.04)_0%,transparent_70%)]" />

            <img src={product.images[activeImage]} alt={product.name} className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition-all duration-500 relative z-10 hero-img-float" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 justify-center">
              {product.images.map((img, idx) => (
                <div key={idx} onClick={() => setActiveImage(idx)} className={`w-20 h-20 bg-[#0e0e11] border rounded-xl flex items-center justify-center cursor-pointer transition-all p-2 ${activeImage === idx ? 'border-stella-red shadow-lg shadow-stella-red/20' : 'border-white/[0.05] hover:border-white/20'}`}>
                  <img src={img} alt={`thumb-${idx}`} className="max-h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>

        <Reveal3D variant="up" stagger={60} className="flex flex-col justify-center space-y-5" refreshKey={`details-${product.id}`}>
          <KineticTitle tag="h1" className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white leading-tight">
            {product.name}
          </KineticTitle>
          <p data-reveal-child className="text-2xl font-black text-white">₹{Number(displayPrice).toLocaleString('en-IN')}</p>
          <p data-reveal-child className="text-gray-300 font-medium leading-relaxed text-base border-b border-white/[0.05] pb-5">{product.description}</p>
          
          {product.variants && product.variants.length > 0 && (
            <div data-reveal-child className="space-y-4 py-4 border-y border-white/[0.05]">
              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Select Colour</span>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((col) => {
                      const isSelected = selectedColor === col;
                      const isColDisabled = isColorOutOfStock(col);
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleColorSelect(col)}
                          disabled={isColDisabled}
                          className={`px-3.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                            isColDisabled
                              ? 'border-white/5 bg-white/[0.01] text-gray-600 line-through cursor-not-allowed opacity-30'
                              : isSelected
                              ? 'border-stella-red bg-stella-red/10 text-white shadow-lg shadow-stella-red/10 cursor-pointer'
                              : 'border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/10 hover:bg-white/[0.04] cursor-pointer'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specs Selection */}
              {specs.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Select RAM / Storage</span>
                  <div className="flex flex-wrap gap-2">
                    {specs.map((sp) => {
                      const isSelected = selectedSpecs === sp;
                      const isSpDisabled = isSpecOutOfStock(sp);
                      return (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => handleSpecsSelect(sp)}
                          disabled={isSpDisabled}
                          className={`px-3.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                            isSpDisabled
                              ? 'border-white/5 bg-white/[0.01] text-gray-600 line-through cursor-not-allowed opacity-30'
                              : isSelected
                              ? 'border-stella-red bg-stella-red/10 text-white shadow-lg shadow-stella-red/10 cursor-pointer'
                              : 'border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/10 hover:bg-white/[0.04] cursor-pointer'
                          }`}
                        >
                          {sp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div data-reveal-child className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden shrink-0">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-base">−</button>
                <span className="w-8 text-center text-white font-black text-sm">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-base">+</button>
              </div>
              <button onClick={addToCart} disabled={isOutOfStock} title="Add to Cart" className={`h-9 w-12 flex items-center justify-center rounded-xl transition-all relative ${isOutOfStock ? 'bg-white/10 cursor-not-allowed opacity-50 text-gray-500' : 'bg-stella-red text-white hover:bg-red-700 shadow-lg shadow-stella-red/20 active:scale-[0.98]'} ${cartPulse ? 'pulse-ring-active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </button>
              <button onClick={buyNow} disabled={isOutOfStock} className={`flex-1 bg-white/[0.04] border border-white/[0.08] text-white py-2.5 px-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 ${isOutOfStock ? 'cursor-not-allowed opacity-50 text-gray-500' : 'hover:bg-white hover:text-black active:scale-[0.98]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>{isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
              </button>
            </div>
          </div>
        </Reveal3D>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-white/[0.04] pt-16">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-stella-red rounded-full" /> Specifications
          </h2>
          <div className="rounded-2xl border border-white/[0.05] overflow-hidden">
            {product.specs?.length > 0 ? (
              <Reveal3D tag="div" variant="up" stagger={40} refreshKey={`specs-${product.id}`}>
                {product.specs.map((spec, idx) => (
                  <div data-reveal-child key={idx} className="flex border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <div className="w-2/5 px-5 py-3.5 bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center">{spec.label}</div>
                    <div className="w-3/5 px-5 py-3.5 text-white text-sm font-semibold flex items-center">{spec.value}</div>
                  </div>
                ))}
              </Reveal3D>
            ) : (
              <div className="px-5 py-8 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">No specifications available</div>
            )}
          </div>
          {product.manufacturer_url && (
            <div className="flex justify-center w-full">
              <a href={product.manufacturer_url} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-max items-center justify-center gap-2 bg-gradient-to-r from-stella-red/90 to-[#8a0010] hover:from-stella-red hover:to-red-800 text-white px-5 py-2.5 rounded-lg font-black uppercase tracking-[0.1em] text-[9px] shadow-md shadow-stella-red/20 transition-all duration-300 active:scale-[0.98]">
                Discover More Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-stella-red rounded-full" /> Reviews
          </h2>

          {showMore ? (
            <div ref={reviewScrollEl} onMouseEnter={() => setReviewHovered(true)} onMouseLeave={() => setReviewHovered(false)} className="h-[340px] overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-stella-black to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-stella-black to-transparent z-10 pointer-events-none" />
              <div className="flex flex-col gap-3">
                {loopingReviews.map((review, idx) => <ReviewCard key={`rv-${idx}`} review={review} />)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          )}

          <div className="mt-6">
            {user ? (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Write a Review</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setNewReview({ ...newReview, stars: s })} className="transition-transform hover:scale-110">
                      <svg className={`w-5 h-5 ${s <= newReview.stars ? 'fill-stella-gold text-stella-gold' : 'fill-white/10 text-white/10'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <input value={newReview.title} onChange={(e) => setNewReview({ ...newReview, title: e.target.value })} placeholder="Review title" className="w-full bg-black/30 border border-white/[0.06] text-white rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-stella-red outline-none placeholder-gray-600" />
                <textarea value={newReview.content} onChange={(e) => setNewReview({ ...newReview, content: e.target.value })} placeholder="Share your experience..." rows={3} className="w-full bg-black/30 border border-white/[0.06] text-white rounded-xl px-4 py-2.5 text-xs font-light leading-relaxed focus:border-stella-red outline-none placeholder-gray-600 resize-none" />
                <div className="flex items-center gap-3">
                  <button onClick={submitReview} disabled={reviewSubmitting || !newReview.title.trim() || !newReview.content.trim()} className="bg-stella-red text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                    {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                  {reviewSubmitted && <span className="text-stella-gold text-[9px] font-black uppercase tracking-widest">✓ Review posted!</span>}
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Sign in to leave a review</p>
                <button onClick={() => toggleLoginModal(true)} className="inline-block bg-white/[0.05] border border-white/10 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>



      <style>{`
        .fill-stella-gold { fill: #c9a84c; }
        @keyframes img-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .hero-img-float {
          animation: img-float 5s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .pulse-ring-active::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 2px solid var(--color-stella-red);
          border-radius: inherit;
          animation: pulse-ring 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          pointer-events: none;
        }

      `}</style>
    </div>
  );
}
