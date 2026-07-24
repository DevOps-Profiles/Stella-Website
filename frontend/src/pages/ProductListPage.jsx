import { useState, useEffect, useMemo, useCallback } from 'react';
import { getImageUrl } from '@/lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useToastStore } from '@/stores/toastStore';
import Reveal3D from '@/components/Reveal3D';
import TiltCard from '@/components/TiltCard';

const API = import.meta.env.VITE_API_BASE_URL;

const matchProductOption = (product, groupKey, option) => {
  const normOption = option.toLowerCase().replace(/\s+/g, '');

  if (product.specs && typeof product.specs === 'object') {
    for (const key of Object.keys(product.specs)) {
      if (key.toLowerCase() === groupKey.toLowerCase()) {
        const val = String(product.specs[key]).toLowerCase().replace(/\s+/g, '');
        if (val.includes(normOption)) return true;
      }
    }
  }

  const normName = product.name.toLowerCase().replace(/\s+/g, '');
  if (normName.includes(normOption)) return true;

  if (product.description) {
    const normDesc = product.description.toLowerCase().replace(/\s+/g, '');
    if (normDesc.includes(normOption)) return true;
  }

  return false;
};

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  const toastStore = useToastStore();

  const categoryName = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allFiltersConfig, setAllFiltersConfig] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');
  const [openGroups, setOpenGroups] = useState({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const activeFiltersConfig = useMemo(() => {
    if (!categoryName) return [];
    return allFiltersConfig[categoryName] || [];
  }, [allFiltersConfig, categoryName]);

  const hasActiveFilters = useMemo(
    () => Object.keys(selectedFilters).some((key) => {
      const val = selectedFilters[key];
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'object' && val !== null) return val.min || val.max;
      return val === true;
    }),
    [selectedFilters],
  );

  const activeHeaderBgImage = useMemo(() => {
    const cat = (categoryName || '').trim();
    if (allFiltersConfig?._category_images?.[cat]) {
      return allFiltersConfig._category_images[cat];
    }
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1920&q=80';
  }, [allFiltersConfig, categoryName]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const url = categoryName
        ? `${API}/products?category=${encodeURIComponent(categoryName)}`
        : `${API}/products`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      setProducts(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          specs: item.specs,
          originalPrice: item.deal_label ? parseFloat(item.price) * 1.2 : null,
          rating: 4.8 + Math.random() * 0.2,
          reviews: Math.floor(60 + Math.random() * 140),
          img:
            getImageUrl(item.image_url) ||
            'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80',
          isNew: new Date() - new Date(item.created_at) < 14 * 24 * 60 * 60 * 1000,
        })),
      );
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  const fetchFiltersConfig = useCallback(async () => {
    try {
      const response = await fetch(`${API}/categories`);
      if (response.ok) {
        const categories = await response.json();
        const filtersMap = {};
        for (const cat of categories) {
           let parsedFilters = [];
           if (cat.filters) {
               try {
                   parsedFilters = typeof cat.filters === 'string' ? JSON.parse(cat.filters) : cat.filters;
               } catch(e) {}
           }
           filtersMap[cat.name] = parsedFilters;
        }
        
        // Fetch category images which are still in site-config
        const configResponse = await fetch(`${API}/site-config/category_filters`);
        if (configResponse.ok) {
           const siteConfig = await configResponse.json();
           filtersMap['_category_images'] = siteConfig._category_images;
        }
        
        setAllFiltersConfig(filtersMap);
      }
    } catch (err) {
      console.error('Error fetching filters config:', err);
    }
  }, []);

  useEffect(() => {
    fetchFiltersConfig();
  }, [fetchFiltersConfig]);

  useEffect(() => {
    setSelectedFilters({});
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchInput.trim()) {
      const query = searchInput.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)),
      );
    }

    const activeFilterGroups = Object.keys(selectedFilters).filter(
      (gKey) => {
        const val = selectedFilters[gKey];
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'object' && val !== null) return val.min || val.max;
        return val === true;
      }
    );

    if (activeFilterGroups.length > 0) {
      list = list.filter((p) =>
        activeFilterGroups.every((gKey) => {
          const filterValue = selectedFilters[gKey];
          const groupConfig = activeFiltersConfig.find(g => g.key === gKey);
          if (!groupConfig) return true;
          const type = groupConfig.type || 'list';

          let pVal = null;
          if (p.specs && p.specs[gKey] !== undefined) {
             pVal = p.specs[gKey];
          } else if (gKey.toLowerCase() === 'price') {
             pVal = p.price;
          }

          if (type === 'range') {
             if (pVal === null || pVal === undefined) return false;
             const num = parseFloat(pVal);
             if (isNaN(num)) return false;
             if (filterValue.min !== undefined && filterValue.min !== '' && num < parseFloat(filterValue.min)) return false;
             if (filterValue.max !== undefined && filterValue.max !== '' && num > parseFloat(filterValue.max)) return false;
             return true;
          }

          if (type === 'boolean') {
             if (filterValue !== true) return true;
             if (!pVal) return false;
             if (typeof pVal === 'string' && ['false', '0', 'no'].includes(pVal.toLowerCase())) return false;
             return true;
          }

          if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
          return filterValue.some((opt) => matchProductOption(p, gKey, opt));
        }),
      );
    }

    if (sortBy === 'Price: Low-High') {
      list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'Price: High-Low') {
      list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [products, searchInput, selectedFilters, sortBy]);

  const isGroupOpen = (groupKey) => openGroups[groupKey] !== false;

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !(prev[groupKey] !== false),
    }));
  };

  const isFilterActive = (groupKey, option) =>
    selectedFilters[groupKey] && selectedFilters[groupKey].includes(option);

  const toggleFilter = (groupKey, option) => {
    setSelectedFilters((prev) => {
      const current = prev[groupKey] || [];
      const idx = current.indexOf(option);
      if (idx > -1) {
        const next = [...current];
        next.splice(idx, 1);
        return { ...prev, [groupKey]: next };
      }
      return { ...prev, [groupKey]: [...current, option] };
    });
  };

  const setRangeFilter = (groupKey, field, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [groupKey]: { ...prev[groupKey], [field]: value }
    }));
  };

  const setBooleanFilter = (groupKey, value) => {
    setSelectedFilters((prev) => ({ ...prev, [groupKey]: value }));
  };

  const clearFilters = () => setSelectedFilters({});

  const goToDetail = (id) => navigate(`/product/${id}`);

  const addToCart = (product) => {
    if (!authStore.user) {
      authStore.toggleLoginModal(true);
      return;
    }
    cartStore.addToCart({
      ...product,
      images: [product.img],
    });
    toastStore.addToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <div className="min-h-screen pb-32 bg-transparent text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div
          className="relative h-[42vh] flex items-end pb-12 px-8 overflow-hidden rounded-3xl border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-stella-black animate-3d-tilt"
        >
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-45 transition-all duration-1000 ease-in-out"
              style={{ backgroundImage: `url('${activeHeaderBgImage}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stella-black via-stella-black/55 to-[#0e0708]/75" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <span
              className="text-[12vw] font-extralight uppercase tracking-[0.25em] text-white/[0.015] whitespace-nowrap leading-none transition-all select-none"
              style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}
            >
              {categoryName || 'STELLA'}
            </span>
          </div>

          <div
            className="max-w-7xl mx-auto w-full relative z-10"
            style={{ transform: 'translateZ(60px)', transformStyle: 'preserve-3d' }}
          >
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight text-white font-display mb-2">
              {categoryName || 'The'}{' '}
              <span className="font-extralight text-white/50">Collection.</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-16 relative z-10">
        <div className="flex flex-col gap-6">
          <div
            className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search collection..."
                className="bg-stella-charcoal/30 border border-white/[0.08] text-white rounded-2xl py-4 px-6 focus:border-stella-red/50 focus:bg-stella-black/80 focus:shadow-[0_0_20px_rgba(230,57,70,0.1)] outline-none text-xs font-bold uppercase tracking-wider w-full transition-all"
              />
            </div>

            <div className="relative flex items-center space-x-4 w-full sm:w-auto">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] whitespace-nowrap">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stella-charcoal/30 border border-white/[0.08] text-white rounded-2xl py-4 px-6 focus:border-white/20 focus:bg-stella-black/80 outline-none text-[10px] font-black uppercase tracking-[0.15em] cursor-pointer w-full sm:w-auto transition-all appearance-none pr-10 relative"
              >
                <option value="Newest First">Newest First</option>
                <option value="Price: Low-High">Price: Low-High</option>
                <option value="Price: High-Low">Price: High-Low</option>
              </select>
              <div className="absolute right-[4.5rem] pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-2 pb-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileFiltersOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 bg-stella-charcoal/30 border border-white/[0.08] hover:border-stella-red/50 text-white hover:text-stella-red hover:bg-stella-black/80 px-8 py-3.5 rounded-2xl transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Filters</span>
              {hasActiveFilters && (
                <div className="ml-2 w-2 h-2 rounded-full bg-stella-red animate-pulse shadow-[0_0_8px_rgba(230,57,70,0.8)]" />
              )}
            </button>
          </div>

          {isMobileFiltersOpen && (
            <div
              className="fixed inset-0 z-[80] bg-stella-black/80 backdrop-blur-sm fade-overlay"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileFiltersOpen(false);
              }}
            />
          )}

          <aside
            className={`fixed inset-y-0 left-0 z-[90] w-[85%] sm:w-[400px] bg-[#050507]/85 backdrop-blur-3xl border-r border-white/10 p-6 sm:p-8 overflow-y-auto shadow-[30px_0_60px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex justify-between items-center mb-8 pb-5 border-b border-white/5">
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-stella-red shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <span className="text-[13px] font-black uppercase tracking-[0.2em] text-white truncate">Filters</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileFiltersOpen(false);
                }}
                className="shrink-0 ml-4 px-4 h-10 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-gray-400 hover:text-white hover:bg-stella-red hover:border-stella-red transition-all shadow-lg"
              >
                <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Parameters</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] font-black uppercase tracking-widest text-stella-red hover:text-white transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-6">
              {activeFiltersConfig.map((group) => (
                <div key={group.name} className="border-b border-white/[0.03] pb-6 last:border-b-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between text-left py-2 group/btn"
                  >
                    <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.2em] flex items-center">
                      <span
                        className={`w-2.5 h-[2px] bg-stella-red mr-3 opacity-60 group-hover/btn:opacity-100 transition-opacity ${
                          isGroupOpen(group.key) ? 'opacity-100 w-4' : ''
                        }`}
                      />
                      {group.name}
                    </h4>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-500 group-hover/btn:text-white transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isGroupOpen(group.key) ? 'rotate-180 text-white' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isGroupOpen(group.key) && (
                    <div className="space-y-4 mt-5 pl-4">
                      {(!group.type || group.type === 'list') && (group.options || []).map((option) => (
                        <label
                           key={option}
                          className="flex items-center space-x-4 cursor-pointer group/item text-[13px] text-gray-400 hover:text-white transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isFilterActive(group.key, option)}
                            onChange={() => toggleFilter(group.key, option)}
                            className="hidden"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border border-white/10 bg-black/40 flex items-center justify-center transition-all duration-300 relative group-hover/item:border-white/30 shrink-0 ${
                              isFilterActive(group.key, option)
                                ? 'border-stella-red bg-stella-red scale-110 shadow-[0_0_15px_rgba(230,57,70,0.4)]'
                                : ''
                            }`}
                          >
                            {isFilterActive(group.key, option) && (
                              <span className="w-2 h-2 rounded-full bg-white animate-scale" />
                            )}
                          </div>
                          <span
                            className={`font-bold uppercase tracking-wider text-[11px] transition-colors ${
                              isFilterActive(group.key, option)
                                ? 'text-white'
                                : 'text-gray-400 group-hover/item:text-gray-200'
                            }`}
                          >
                            {option}
                          </span>
                        </label>
                      ))}

                      {group.type === 'range' && (
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            placeholder="Min"
                            value={selectedFilters[group.key]?.min || ''}
                            onChange={(e) => setRangeFilter(group.key, 'min', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-lg py-2 px-3 text-xs outline-none focus:border-stella-red transition-colors"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={selectedFilters[group.key]?.max || ''}
                            onChange={(e) => setRangeFilter(group.key, 'max', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-lg py-2 px-3 text-xs outline-none focus:border-stella-red transition-colors"
                          />
                        </div>
                      )}

                      {group.type === 'boolean' && (
                        <label className="flex items-center space-x-4 cursor-pointer group/item text-[13px] text-gray-400 hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedFilters[group.key] === true}
                            onChange={(e) => setBooleanFilter(group.key, e.target.checked)}
                            className="hidden"
                          />
                          <div
                            className={`w-10 h-5 rounded-full border border-white/10 bg-black/40 flex items-center transition-all duration-300 relative group-hover/item:border-white/30 shrink-0 p-0.5 ${
                              selectedFilters[group.key] === true
                                ? 'border-stella-red bg-stella-red shadow-[0_0_15px_rgba(230,57,70,0.4)]'
                                : ''
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${selectedFilters[group.key] === true ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                          <span className={selectedFilters[group.key] === true ? 'text-white font-bold' : 'text-gray-400 font-bold'}>
                            {group.name}
                          </span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {activeFiltersConfig.length === 0 && (
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl text-center mt-4">
                Select a dynamic category in the header menu to load specifications parameters filters.
              </div>
            )}
          </aside>

          {hasActiveFilters ? (
            <div
              className="flex flex-wrap items-center gap-2 pb-8 border-b border-white/[0.03] animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mr-2">Active:</span>
              {Object.entries(selectedFilters).map(([key, options]) =>
                (options || []).map((opt) => (
                  <div
                    key={`${key}-${opt}`}
                    className="bg-stella-red/10 border border-stella-red/30 text-stella-red pl-4 pr-1.5 py-1.5 rounded-full flex items-center gap-2 transition-all text-[9px] font-black uppercase tracking-[0.1em] shadow-[0_0_10px_rgba(230,57,70,0.1)]"
                  >
                    <span>{opt}</span>
                    <button
                      type="button"
                      onClick={() => toggleFilter(key, opt)}
                      className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-stella-red hover:text-white transition-colors"
                    >
                      <span className="text-[10px] leading-none">×</span>
                    </button>
                  </div>
                )),
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white ml-4 transition-colors underline decoration-white/20 hover:decoration-white underline-offset-4"
              >
                Clear All
              </button>
            </div>
          ) : (
            <div className="border-b border-white/[0.03] pb-8" />
          )}

          <div className="w-full space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-[260px] sm:h-[380px] bg-white/[0.02] rounded-2xl border border-white/[0.03] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div
                key={`grid-${categoryName}-${sortBy}-${filteredProducts.length}-${filteredProducts[0]?.id || 0}`}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5"
              >
                {filteredProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-[#0c0c0f] border border-white/[0.05] rounded-2xl overflow-hidden cursor-pointer hover:border-white/15 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] animate-fast-fade-in"
                    style={{ animationDelay: `${Math.min(idx * 20, 100)}ms` }}
                  >
                    <article
                      onClick={() => goToDetail(product.id)}
                      className="flex flex-col h-full w-full"
                    >
                      <div className="relative bg-[#111114] overflow-hidden h-[160px] sm:h-[260px]">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(230,57,70,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-600 z-0" />

                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col items-center gap-2">


                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            title="Add to Cart"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stella-black/75 border border-white/10 flex items-center justify-center backdrop-blur-md hover:border-stella-red/50 hover:bg-stella-black transition-all text-white hover:text-stella-red"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </button>
                        </div>

                        <img
                          src={product.img}
                          alt={product.name}
                          className="absolute inset-0 m-auto object-contain z-10 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                          style={{ maxHeight: '220px', maxWidth: '80%' }}
                        />
                      </div>

                      <div className="px-3 py-3 sm:px-5 sm:py-4 flex flex-col justify-center border-t border-white/[0.04] bg-[#0c0c0f]">
                        <h3 className="text-[10px] sm:text-[13px] font-bold uppercase tracking-tight text-white group-hover:text-stella-red transition-colors duration-300 line-clamp-2 h-8 sm:h-10 font-display">
                          {product.name}
                        </h3>
                        <p className="text-[11px] sm:text-[13px] font-black text-gray-400 mt-0.5">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </article>
                  </div>
                ))}

                {!loading && filteredProducts.length === 0 && (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center border border-dashed border-white/[0.05] rounded-2xl">
                    <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs mb-2">No Products Found</h3>
                    <p className="text-gray-600 text-[9px] font-bold uppercase tracking-wider mb-5 text-center leading-relaxed">
                      Adjust your filters to reveal the collection.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="border border-white/10 text-white hover:bg-white hover:text-black px-5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

            {filteredProducts.length > 0 && (
              <div className="flex justify-center items-center mt-16 animate-fade-up">
                <div className="px-5 py-3 rounded-full flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors duration-300" />
                  <div className="w-6 h-2 rounded-full bg-stella-red shadow-lg shadow-stella-red/20 transition-all duration-300" />
                  <div className="w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors duration-300" />
                </div>
              </div>
            )}
          </div>
        </div>


       <style>{`
        .font-display {
          font-family: var(--font-display);
        }
        .fade-overlay {
          animation: fadeOverlay 0.3s ease forwards;
        }
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fast-fade-in {
          animation: fastFadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fastFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale {
          animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes auto3dTilt {
          0% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: perspective(1000px) rotateX(2.5deg) rotateY(4deg);
          }
          50% {
            transform: perspective(1000px) rotateX(-2deg) rotateY(-3.5deg);
          }
          75% {
            transform: perspective(1000px) rotateX(2deg) rotateY(-2.5deg);
          }
          100% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
          }
        }
        .animate-3d-tilt {
          animation: auto3dTilt 10s ease-in-out infinite;
          transform-style: preserve-3d;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
