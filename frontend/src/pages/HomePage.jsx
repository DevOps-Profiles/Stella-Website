import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getImageUrl } from '../lib/api';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DealsCountdown from '@/components/DealsCountdown';
import DealsHoverExpand from '@/components/DealsHoverExpand';
import KineticTitle from '@/components/KineticTitle';
import Reveal3D from '@/components/Reveal3D';
import TiltCard from '@/components/TiltCard';
import FranchiseHubsGallery from '@/components/FranchiseHubsGallery';
import StoreLocatorModal from '@/components/StoreLocatorModal';
import HubModal from '@/components/HubModal';
import CleanLogo from '@/components/CleanLogo';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useToastStore } from '@/stores/toastStore';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, EffectCards, Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, Phone } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const API = import.meta.env.VITE_API_BASE_URL;

const DEFAULT_HOMEPAGE_CONFIG = {
  hero: {
    slides: [
      {
        id: 1,
        title: 'Unleash the Future',
        subtitle: 'Experience the next generation of mobile performance and design.',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=80',
      },
      {
        id: 2,
        title: 'Titanium Strength',
        subtitle: 'Aerospace-grade titanium design. Incredibly strong. Incredibly light.',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1920&q=80',
      },
      {
        id: 3,
        title: 'Pure Audio Bliss',
        subtitle: 'Crystal clear sound with advanced active noise cancellation technology.',
        image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1920&q=80',
      },
    ],
    buttonText: 'Discover Elite',
  },
  deals: { show: true },
};

function parseMaybeJson(value) {
  let parsed = value;
  while (typeof parsed === 'string') {
    try {
      const next = JSON.parse(parsed);
      if (next === parsed) break;
      parsed = next;
    } catch {
      break;
    }
  }
  return parsed;
}

const defaultHubs = [
  { tag: 'Own Outlet', name: 'Unit I, Hongkong Plaza', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Stella%20Mobiles%20Unit%201%20-%20Hongkong%20Plaza.png' },
  { tag: 'Own Outlet', name: 'Unit II, Hongkong Plaza', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Stella%20Mobiles%20Unit%201%20-%20Hongkong%20Plaza%202.png' },
  { tag: 'Own Outlet', name: 'Thalamuthunagar', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Stella%20Mobiles%20Thalamuthunagar.jpeg' },
  { tag: 'Own Outlet', name: 'Chidambara Nagar', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
  { tag: 'Own Outlet', name: 'Kulathur', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Stella%20Mobiles%20-%20KULATHUR.png' },
  { tag: 'Franchise Outlet', name: 'Pudukottai', address: 'Pudukottai', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Franchisee%20Shops/STELLA%20Hi%20TECH%20MOBILES%20-%20PUDUKOTTAI/IMG-20250327-WA0007.jpg.jpeg' },
  { tag: 'Franchise Outlet', name: 'Kulathur', address: 'Kulathur', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Franchisee%20Shops/STELLA%20Hi%20TECH%20MOBILES%20-%20KULATHUR/IMG-20251002-WA0014.jpg.jpeg' },
  { tag: 'Franchise Outlet', name: 'MR.93 Thoothukudi', address: 'Thoothukudi', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Franchisee%20Shops/MR%2093%20Hi%20TECH%20MOBILES/20260703_124126.jpg.jpeg' },
];

const defaultCol1Reviews = [
  { id: 1, name: 'Rahul S.', text: 'Best mobile buying experience! The staff at Anna Nagar were incredibly helpful.', stars: 5 },
  { id: 2, name: 'Priya K.', text: 'Got my Stella Pro at an unbelievable deal. Highly recommend the seamless store pickup!', stars: 5 },
  { id: 3, name: 'Vikram M.', text: 'Authentic products and 0% UPI fee makes a huge difference when buying flagships.', stars: 5 },
];

const defaultCol2Reviews = [
  { id: 4, name: 'Anjali R.', text: 'Super fast checkout! The custom UPI payments are fully transparent and fee-free.', stars: 5 },
  { id: 5, name: 'Karthik B.', text: 'Elite premium customer support. Setup my new smartphone right in their luxury lounge.', stars: 5 },
  { id: 6, name: 'Deepa T.', text: 'Outstanding store design. The bento layout and dark mode look premium online & offline.', stars: 5 },
];

const defaultCol3Reviews = [
  { id: 7, name: 'Sanjay V.', text: 'Excellent twilio OTP secure login. My orders are safe, and tracking is very accurate.', stars: 5 },
  { id: 8, name: 'Meera N.', text: 'Best gadget accessories in Chennai. Visited Pondy Bazaar Express Hub, absolute speed.', stars: 5 },
  { id: 9, name: 'Arun K.', text: 'Stella franchise protocol is highly systematic. Excited to grow our partnership.', stars: 5 },
];

const franchiseBentoItems = [
  { title: 'Zero Franchise Fee', desc: 'No upfront cost. Pure equity partnership.' },
  { title: 'Elite Supply Chain', desc: "Direct access to Stella's premium inventory." },
  { title: '200% Growth YOY', desc: 'Fastest growing mobile retail brand in South India.' },
  { title: 'Full Brand Support', desc: 'Training, marketing & operations backed by Stella.' },
];

const franchiseModalBenefits = [
  { title: 'Comprehensive Mobile Solutions', desc: 'Stella Hit Tech offers not only mobile sales but also top-tier after-sales services, ensuring a seamless experience.' },
  { title: 'Tech Expertise', desc: 'With a strong foundation in software development and customized applications, we understand diverse business needs.' },
  { title: 'Innovation-Driven', desc: 'We stay ahead of industry trends, constantly evolving with the latest technologies like AI and cloud solutions.' },
  { title: 'Customer-Centric Approach', desc: 'Customer satisfaction is at the heart of what we do. We provide personalized services to meet client needs.' },
  { title: 'Skilled Team', desc: 'Our passionate professionals bring expertise in both mobile technology and software development.' },
  { title: 'Affordable & Scalable', desc: 'We offer scalable solutions that are both cost-effective and tailored to your unique requirements.' },
];

const aboutUsCards = [
  { id: 1, image: '/images/hubs/Stella%20Hi%20Tech%20Pvt%20Ltd/IMG-20250410-WA0004.jpg.jpeg', alt: 'Premium Curation' },
  { id: 2, image: '/images/hubs/Stella%20Hi%20Tech%20Pvt%20Ltd/IMG-20250410-WA0005.jpg.jpeg', alt: 'Elite Customer Care' },
  { id: 3, image: '/images/hubs/Stella%20Hi%20Tech%20Pvt%20Ltd/IMG-20250410-WA0006.jpg.jpeg', alt: 'Flagship Store' },
];

function ReviewCard({ review, keyPrefix = '' }) {
  return (
    <div className="review-card glass p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/[0.01] rounded-full blur-lg" />
      <div className="flex space-x-0.5 text-[9px] text-stella-gold">
        {Array.from({ length: review.stars }, (_, s) => (
          <span key={`${keyPrefix}star-${s}`}>★</span>
        ))}
      </div>
      <p className="text-gray-300 text-xs italic font-medium leading-relaxed">&quot;{review.text}&quot;</p>
      <div className="flex items-center space-x-3 pt-3 border-t border-white/5">
        <div className="w-8 h-8 rounded-full bg-stella-red/10 border border-stella-red/20 flex items-center justify-center text-stella-red font-black text-[9px]">
          {review.name[0]}
        </div>
        <span className="text-white font-black uppercase tracking-widest text-[9px]">{review.name}</span>
      </div>
    </div>
  );
}

function HubCard({ hub, className = '' }) {
  return (
    <div
      className={`glass p-5 rounded-2xl min-w-[260px] md:min-w-[300px] text-left border border-white/5 hover:border-stella-red/30 transition-all duration-300 relative group overflow-hidden shrink-0 flex flex-col justify-between ${className}`}
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-stella-red/5 rounded-full blur-xl group-hover:bg-stella-red/10 transition-all duration-500" />

      {hub.image && (
        <div className="w-full h-32 mb-4 overflow-hidden rounded-xl border border-white/5 relative z-10 shrink-0">
          <img src={hub.image} alt={hub.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="bg-stella-red text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">{hub.tag}</span>
        </div>
        <h3 className="text-base font-black uppercase tracking-wide text-white mt-1 mb-2 leading-tight flex-1">
          {hub.tag?.includes('Own') ? 'Stella Mobiles Sales and Services - ' + hub.name : hub.name}
        </h3>
        <p className="text-gray-400 text-[11px] font-medium leading-relaxed mb-3">
          <strong className="text-gray-200">{hub.tag?.includes('Own') ? 'Stella Mobiles Sales and Services - ' + hub.name : hub.name}</strong>, {hub.address}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10 shrink-0">
        <a href={`tel:${hub.phone}`} className="text-stella-gold font-black uppercase tracking-[0.2em] text-[8px] hover:text-white transition-colors">
          {hub.phone}
        </a>
        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">{hub.hours}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const toggleLoginModal = useAuthStore((s) => s.toggleLoginModal);
  const addToCartStore = useCartStore((s) => s.addToCart);
  const addToast = useToastStore((s) => s.addToast);

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homepageConfig, setHomepageConfig] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [selectedNetworkHub, setSelectedNetworkHub] = useState(null);

  const homepageConfigRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const scrollPosRef = useRef(0);
  const animationFrameRef = useRef(null);
  const slideIntervalRef = useRef(null);
  const stackContainerRef = useRef(null);
  const aboutCardRefs = useRef([]);

  const hubs = homepageConfig?.franchise?.hubs || defaultHubs;

  const col1Reviews = useMemo(
    () => homepageConfig?.testimonials?.col1 || defaultCol1Reviews,
    [homepageConfig],
  );
  const col2Reviews = useMemo(
    () => homepageConfig?.testimonials?.col2 || defaultCol2Reviews,
    [homepageConfig],
  );
  const col3Reviews = useMemo(
    () => homepageConfig?.testimonials?.col3 || defaultCol3Reviews,
    [homepageConfig],
  );
  const allMobileReviews = useMemo(
    () => [...col1Reviews, ...col2Reviews, ...col3Reviews],
    [col1Reviews, col2Reviews, col3Reviews],
  );

  const fetchConfigs = useCallback(async () => {
    try {
      const response = await fetch(`${API}/site-config/homepage`);
      if (response.ok) {
        let data = parseMaybeJson(await response.json());
        if (!data?.hero?.slides?.length) {
          data = DEFAULT_HOMEPAGE_CONFIG;
        }
        console.log('Homepage Config Loaded:', data);
        homepageConfigRef.current = data;
        setHomepageConfig(data);

        if (data.hero?.slides?.length > 1) {
          slideIntervalRef.current = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % data.hero.slides.length);
          }, 6000);
        }
      } else {
        console.error('Failed to load homepage config:', response.status);
      }
    } catch (err) {
      console.error('Error fetching site config:', err);
      homepageConfigRef.current = DEFAULT_HOMEPAGE_CONFIG;
      setHomepageConfig(DEFAULT_HOMEPAGE_CONFIG);
    }
  }, []);

  const fetchDeals = useCallback(async () => {
    try {
      const productsResponse = await fetch(`${API}/products`);
      if (!productsResponse.ok) throw new Error('Failed to fetch products');
      const allProducts = await productsResponse.json();

      const config = homepageConfigRef.current;
      if (config?.deals?.items && config.deals.items.length > 0) {
        const configuredDeals = [];
        config.deals.items.forEach((item) => {
          const prod = allProducts.find((p) => p.id === parseInt(item.productId, 10));
          if (prod) {
            configuredDeals.push({
              id: prod.id,
              name: prod.name,
              price: item.dealPrice && item.dealPrice > 0 ? item.dealPrice : prod.price,
              oldPrice: parseFloat(prod.price),
              tag: item.customLabel || prod.deal_label || 'Special Offer',
              subtitle: item.subtitle || prod.description || 'Exclusive Stella Engineering Protocol',
              img: getImageUrl(prod.image_url) || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80',
            });
          }
        });

        if (configuredDeals.length > 0) {
          setDeals(configuredDeals);
          return;
        }
      }

      const response = await fetch(`${API}/products/deals`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setDeals(
            data.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              oldPrice: parseFloat(item.price) * 1.2,
              tag: item.deal_label || 'Special Offer',
              subtitle: item.description || 'Exclusive Stella Engineering Protocol',
              img: getImageUrl(item.image_url) || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80',
            })),
          );
          return;
        }
      }

      setDeals([]);
    } catch (err) {
      console.error('Error fetching deals, returning empty:', err);
      setDeals([]);
    }
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const animateScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (!isHoveredRef.current) {
      scrollPosRef.current += 0.75;
      if (scrollPosRef.current >= el.scrollWidth / 2) {
        scrollPosRef.current = 0;
      }
      el.scrollLeft = scrollPosRef.current;
    } else {
      scrollPosRef.current = el.scrollLeft;
    }
    animationFrameRef.current = requestAnimationFrame(animateScroll);
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (scrollContainerRef.current) {
      scrollPosRef.current = scrollContainerRef.current.scrollLeft;
    }
    animationFrameRef.current = requestAnimationFrame(animateScroll);
  }, [animateScroll, stopAutoScroll]);

  const addToCart = (product) => {
    if (!user) {
      toggleLoginModal(true);
      return;
    }
    addToCartStore(product);
    addToast(`${product.name} added to cart!`, 'success');
  };


  const viewProduct = (deal) => {
    navigate(`/product/${deal.id}`);
  };

  const scrollToBranches = (e) => {
    e.preventDefault();
    document.getElementById('branches')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      await fetchConfigs();
      await fetchDeals();
      if (mounted) setLoading(false);
    }

    load();

    return () => {
      mounted = false;
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [fetchDeals, fetchConfigs]);

  useEffect(() => {
    if (!loading) startAutoScroll();
    return stopAutoScroll;
  }, [loading, startAutoScroll, stopAutoScroll]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const franchiseTitle = homepageConfig?.franchise?.title || 'Partner with Stella';
  const franchiseTitleParts = franchiseTitle.split(' ');
  const visionTitle = homepageConfig?.our_story?.vision_title || 'The Stella Vision';
  const visionTitleParts = visionTitle.split(' ');

  const franchiseStats = homepageConfig?.franchise?.stats || [
    { label: 'Own Outlets', value: '5' },
    { label: 'Franchise Outlets', value: '3' },
  ];

  const modalFranchiseStats = homepageConfig?.franchise?.stats || [
    { label: 'Outlets', value: '50+' },
    { label: 'Growth YOY', value: '200%' },
  ];

  const ourStoryStats = homepageConfig?.our_story?.stats || [
    { value: '15k+', label: 'Happy Customers' },
    { value: '02', label: 'Elite Hubs' },
    { value: '24h', label: 'Express Delivery' },
  ];

  const mouseXY = useRef([0, 0]);
  const heroRef = useRef(null);
  const slideLayerRef = useRef(null);

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseXY.current = [
        ((clientX - rect.left) / rect.width - 0.5) * 2,
        ((clientY - rect.top) / rect.height - 0.5) * 2,
      ];
    };

    const onMouseMove = (e) => {
      handleMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchMove);
    };
  }, []);

  useEffect(() => {
    const layer = slideLayerRef.current;
    if (!layer) return;

    let rafId = 0;
    const update = () => {
      const [mx, my] = mouseXY.current;
      layer.style.transform = `translate(${mx * -10}px, ${my * -6}px) scale(1.06)`;
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [currentSlide]);

  const activeConfig = homepageConfig?.hero?.slides?.length ? homepageConfig : DEFAULT_HOMEPAGE_CONFIG;
  const currentSlideData = activeConfig.hero.slides[currentSlide] ?? activeConfig.hero.slides[0];
  const titleWords = (currentSlideData?.title || 'Stella Future').split(' ');

  return (
    <div className="space-y-8 md:space-y-12 pb-16">
      {/* ── Polished Bento Grid Hero ── */}
      <section
        ref={heroRef}
        className="relative w-full h-[calc(100svh-4rem)] md:h-[100svh] pt-12 md:pt-16 pb-8 md:pb-16 px-4 md:px-8 flex items-center justify-center bg-[#050508] overflow-hidden"
      >
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 grid-rows-[1fr_auto] md:grid-cols-10 md:grid-rows-1 gap-4 md:gap-6 h-[80svh] md:h-[70vh] min-h-[550px] md:min-h-[500px]">

          {/* Main Anchor: Image Mask Tile (Center, 80%) */}
          <TiltCard
            maxTilt={2}
            scale={1.01}
            className="animate-float-up-card md:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-[#0a0a0c] border border-white/[0.08] shadow-[0_30px_80px_rgba(0,0,0,0.5)] group flex flex-col h-full"
          >
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0d0d12] to-[#050508]" />
            <div className="absolute inset-0 z-0">
              {(activeConfig.hero.slides || [currentSlideData]).map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full bg-cover bg-center mix-blend-screen transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-60 z-10' : 'opacity-0 z-0'} group-hover:scale-105 animate-hero-pan`}
                  style={{ backgroundImage: `url('${slide.image || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=800&q=80'}')` }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-transparent opacity-90 z-20 pointer-events-none" />
            </div>
            {/* The Text Layer */}
            <div className="absolute inset-0 z-30 flex flex-col items-start justify-end p-6 pb-24 md:p-12 md:pb-28 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent">
              <h1 className="text-[10vw] md:text-[5vw] font-black uppercase tracking-tighter text-white leading-[0.85] text-left drop-shadow-2xl">
                {titleWords.slice(0, -1).join(' ')}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stella-gold to-yellow-200">
                  {titleWords[titleWords.length - 1]}
                </span>
              </h1>
            </div>
            {/* Floating Glass Subtitle */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20">
              <span className="inline-flex items-center gap-3 bg-white/[0.05] backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-stella-red shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                <span className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.25em]">
                  {currentSlideData?.subtitle || 'Stella Exclusives'}
                </span>
              </span>
            </div>
          </TiltCard>

          {/* Action Tile (Right Column, 20%) */}
          <TiltCard
            maxTilt={6}
            className="animate-float-down-card md:col-span-2 relative rounded-full md:rounded-[2.5rem] overflow-hidden bg-[#0d0d12] border border-stella-red/50 shadow-[0_0_40px_rgba(230,57,70,0.2)] group flex flex-col items-center justify-center p-4 md:p-6 cursor-pointer hover:scale-105 transition-all md:h-full w-full"
            onClick={() => setIsStoreLocatorOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-b md:from-stella-red/5 md:to-transparent from-stella-red/10 to-stella-red/5 opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 md:gap-6 w-full">
              <div className="flex items-center md:flex-col gap-4 md:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-stella-red rounded-full animate-ping opacity-30 transition-opacity" />
                  <div className="bg-stella-red/20 p-3 md:p-5 rounded-full backdrop-blur-md border border-stella-red/40 transition-colors">
                    <MapPinIcon className="w-5 h-5 md:w-8 md:h-8 text-stella-red drop-shadow-lg relative z-10 transition-colors" />
                  </div>
                </div>
                <span className="text-stella-red font-black uppercase tracking-[0.15em] text-sm md:text-lg text-left md:text-center drop-shadow-sm leading-tight mt-0 md:mt-2 transition-colors">
                  Store <span className="md:hidden">Locator</span><br className="hidden md:block" /> <span className="hidden md:inline">Locator</span>
                </span>
              </div>

              <div className="px-5 py-3 md:px-4 md:py-2 rounded-full bg-stella-red text-white text-[10px] font-bold uppercase tracking-widest border border-stella-red flex items-center gap-1 shadow-[0_0_15px_rgba(230,57,70,0.5)] transition-colors shrink-0">
                Find Us <ChevronRightIcon size={12} />
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Deals Section */}
      {homepageConfig?.deals?.show !== false && (loading || deals.length > 0) && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-4 md:pt-6">
          <Reveal3D variant="up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-8">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
                <KineticTitle className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                  Deals of{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stella-gold to-stella-gold">
                    the Day
                  </span>
                </KineticTitle>
                <DealsCountdown endTime={homepageConfig?.deals?.endTime} />
              </div>
              <Link
                to="/products"
                className="text-stella-gold font-black uppercase tracking-[0.3em] text-[9px] hover:text-white transition-all flex items-center mb-1"
              >
                View All Assets
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </Reveal3D>

          <Reveal3D variant="zoom" delay={120} refreshKey={loading ? 'loading' : `deals-${deals.length}`}>
            {loading ? (
              <div className="h-[28rem] md:h-[26rem] rounded-[2rem] bg-stella-charcoal animate-pulse border border-white/5" />
            ) : (
              <DealsHoverExpand
                deals={deals}
                onAddToCart={addToCart}

                onViewProduct={viewProduct}
              />
            )}
          </Reveal3D>
        </section>
      )}

      {/* Franchise Section (CTA Only) */}
      <section id="franchise" className="scroll-mt-28 relative py-16 flex flex-col items-center justify-center overflow-hidden w-full border-t border-white/5 bg-gradient-to-b from-stella-black to-[#0a0a0c]">
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-stella-red/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[450px] h-[450px] bg-stella-gold/3 rounded-full blur-[120px] pointer-events-none" />

        <Reveal3D variant="zoom">
          <div className="text-center space-y-6 relative z-20 px-6">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              {franchiseTitleParts.slice(0, 2).join(' ')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stella-gold to-white">
                {franchiseTitleParts.slice(2).join(' ')}
              </span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed mb-8">
              {homepageConfig?.franchise?.description || "Join our growing network of successful franchise partners with pure equity. Stella provides an elite supply chain with direct access to premium inventory, backed by comprehensive training, marketing, and operations support. Experience the fastest growing mobile retail brand in South India with absolutely zero upfront franchise fees."}
            </p>

            <button
              type="button"
              onClick={() => setShowFranchiseModal(true)}
              className="stella-button bg-stella-gold text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 shadow-xl shadow-stella-gold/20 inline-block transition-all hover:scale-105"
            >
              View Franchise Details
            </button>
          </div>
        </Reveal3D>
      </section>

      {/* Franchise Details Modal */}
      {createPortal(
        <AnimatePresence>
          {showFranchiseModal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[200] w-full h-screen overflow-hidden bg-gradient-to-b from-stella-black/95 to-[#0a0a0c]/95 backdrop-blur-3xl flex flex-col"
            >
              {/* Background elements (Absolute to non-scrolling parent) */}
              <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-stella-gold/10 rounded-full blur-[150px] pointer-events-none" />
              <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-stella-red/10 rounded-full blur-[150px] pointer-events-none" />

              {/* Sticky Header */}
              <div className="shrink-0 bg-stella-black/90 backdrop-blur-md border-b border-white/[0.05] px-6 md:px-16 py-6 md:py-8 flex items-center justify-between z-20 w-full">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">Franchise Program</h2>
                  <p className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1">Stella Partnership Programme</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Brochure Download */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-white font-black uppercase tracking-wider text-[11px]">Franchise Brochure</p>
                      <p className="text-gray-400 text-[8px] mt-0.5 leading-tight uppercase tracking-wider">Business model & investment guide</p>
                    </div>
                    <a
                      href={homepageConfig.franchise?.brochureUrl || "/Business_Brochure.pdf"}
                      download="Business_Brochure"
                      className="w-10 h-10 rounded-full bg-stella-red/10 border border-stella-red/20 text-stella-red flex items-center justify-center hover:bg-stella-red hover:text-white transition-all duration-300 shadow-lg shadow-stella-red/0 hover:shadow-stella-red/30 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFranchiseModal(false)}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xl font-black cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrolling Content Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
                <div className="max-w-7xl mx-auto w-full px-6 md:px-16 py-12 md:py-20 space-y-12 md:space-y-16">
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white leading-tight">
                      {homepageConfig?.franchise?.title || 'Partner with Stella'}
                    </h3>
                    <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-4xl">
                      {homepageConfig?.franchise?.description ||
                        "Stella Hi Tech Private Limited combines local market experience with a structured franchise system to deliver consistent success. With successful outlets already operating, we provide complete business support including branding, supply chain, technical guidance, and marketing assistance."}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="flex gap-12 pb-10 border-b border-white/[0.05]">
                    {franchiseStats.map((stat) => (
                      <div key={stat.label}>
                        <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400 font-black uppercase tracking-widest mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Benefits Grid (Normalized Text) */}
                  <div className="space-y-6">
                    <h4 className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-gray-300">Why Partner With Us</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(homepageConfig?.franchise?.benefits || franchiseModalBenefits).map((item, i) => (
                        <div key={i} className="glass p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
                          <h5 className="text-white font-black text-base uppercase tracking-wider mb-2">{item.title}</h5>
                          <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Franchise Hubs Gallery */}
                  <div className="space-y-6">
                    <h4 className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-gray-300">Our Franchise Partners</h4>
                    <div className="w-full">
                      <FranchiseHubsGallery hubs={hubs.filter(h => h.tag.includes('Franchise'))} />
                    </div>
                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-8 border-t border-white/[0.05]">
                      {/* Software Download */}
                      <div className="flex items-center gap-3">
                        <a
                          href={homepageConfig.franchise?.softwareUrl || "/Stella_Billing_Software.exe"}
                          download="Stella_Billing_Software"
                          className="w-10 h-10 rounded-full bg-stella-gold/10 border border-stella-gold/20 text-stella-gold flex items-center justify-center hover:bg-stella-gold hover:text-black transition-all duration-300 shadow-lg shadow-stella-gold/0 hover:shadow-stella-gold/30 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </a>
                        <div className="text-left">
                          <p className="text-white font-black uppercase tracking-wider text-[11px]">Billing Software</p>
                          <p className="text-gray-400 text-[8px] mt-0.5 leading-tight uppercase tracking-wider">Custom POS & inventory</p>
                        </div>
                      </div>
                    </div>      </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}



      {/* Our Story Section */}
      <section id="our-story" className="scroll-mt-28 border-t border-white/5 bg-[#08080a]">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          {/* Section Header */}
          <div className="space-y-4 mb-12 md:mb-16 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <span className="w-12 h-[1px] bg-stella-gold" />
              <span className="text-stella-gold font-black text-[10px] uppercase tracking-[0.5em]">The Journey</span>
              <span className="w-12 h-[1px] bg-stella-gold lg:hidden" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.9]">
              {visionTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Text content */}
            <div className="lg:col-span-6 space-y-8 text-left order-2 lg:order-1">            <div className="space-y-6 text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-xl whitespace-pre-wrap">
              {homepageConfig?.our_story?.vision_text || `Founded in 2007 by visionary Mr. Maheshkumar V, our journey began as a dedicated home appliance agency in Kulathur, Tuticorin under the brand name "STELLA".\n\nDriven by a commitment to reliability and customer satisfaction, Stella Mobiles opened its doors at Hongkong Plaza, later evolving into a full-fledged Mobile Sales Showroom in 2015. Today, we stand as a premier multi-brand retail chain offering an extensive range of the latest smartphones, smart gadgets, tablets, laptops, and TVs.\n\nWith consistent growth and transformation across multiple branches, we united as a team to launch our technology solutions firm, Stella Hi Tech Private Limited, right in the heart of the Pearl City. Our greatest strength continues to be our deeply rooted understanding of customer needs, our well-trained team, and an unwavering passion for delivering exceptional service.`}
            </div>

              {/* Head Office */}
              <Reveal3D variant="up" delay={100} className="mt-10 pt-8 border-t border-white/5 max-w-xl">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-[1px] bg-stella-red/60" />
                    <span className="text-stella-red text-[9px] font-black uppercase tracking-[0.4em]">Head Office</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg uppercase tracking-wider mb-1">Stella Hi Tech Pvt Ltd</h3>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mt-1">
                      <p className="text-gray-400 text-xs leading-relaxed">
                        102/5a/1a, Polepettai, Melur,<br />Thoothukudi, Tamil Nadu - 628 002
                      </p>
                      <a href="tel:+919095510510" className="inline-flex items-center gap-2 bg-white/5 hover:bg-stella-red border border-white/10 hover:border-stella-red px-3 py-1.5 rounded-lg transition-colors w-fit">
                        <Phone className="w-3 h-3 text-gray-400 group-hover:text-white" />
                        <span className="text-gray-300 text-[10px] font-bold tracking-widest">+91 9095510510</span>
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal3D>
            </div>

            {/* Right Column: Premium Curated Image Carousel */}
            <div className="lg:col-span-6 w-full flex items-center justify-center pt-2 lg:pt-0 order-1 lg:order-2">
              <Swiper
                spaceBetween={40}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                }}
                effect="cards"
                grabCursor={true}
                loop={aboutUsCards.length >= 3}
                modules={[EffectCards, Autoplay]}
                className="h-[380px] w-[260px] md:h-[450px] md:w-[320px]"
              >
                {[...aboutUsCards, ...aboutUsCards].map((card, idx) => (
                  <SwiperSlide key={`${card.id}-${idx}`} className="rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-stella-black">
                    <img
                      src={card.image}
                      alt={card.alt || ""}
                      className="h-full w-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section id="branches" className="max-w-7xl mx-auto px-6 py-16 w-full">
        <Reveal3D variant="up">
          <div className="text-center mb-16">
            <KineticTitle className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-stella-gold to-yellow-300">Network</span>
            </KineticTitle>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Stella operates across multiple vibrant districts. Each hub is designed to deliver a premium, hands-on experience — from device selection to instant setup and after-sales support.
            </p>
          </div>
        </Reveal3D>
        {/* Branches Controlled Scroll UI */}
        <div className="-mx-6 px-6 lg:px-12 relative group/slider">
          <div className="swiper-button-prev-custom absolute left-2 lg:left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/80 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-stella-red text-white transition-colors opacity-0 group-hover/slider:opacity-100 shadow-2xl">
            <ChevronLeftIcon className="w-6 h-6" />
          </div>
          <div className="swiper-button-next-custom absolute right-2 lg:right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/80 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-stella-red text-white transition-colors opacity-0 group-hover/slider:opacity-100 shadow-2xl">
            <ChevronRightIcon className="w-6 h-6" />
          </div>

          <Swiper
            modules={[Navigation]}
            loop={(() => {
              const hubsToRender = homepageConfig?.our_story?.hubs?.length > 0
                ? homepageConfig.our_story.hubs
                : hubs;
              return hubsToRender.length > 2;
            })()}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 20 },
              640: { slidesPerView: 2.2, spaceBetween: 24 },
              1024: { slidesPerView: 3.2, spaceBetween: 32 },
              1280: { slidesPerView: 4, spaceBetween: 40 },
            }}
            className="w-full !py-12 !px-4 -mx-4"
          >
            {(() => {
              const hubsToRender = homepageConfig?.our_story?.hubs?.length > 0
                ? homepageConfig.our_story.hubs
                : hubs;
              
              // Only duplicate if we need to fill the loop, else just render the array
              const loopSafeHubs = hubsToRender.length > 2 ? [...hubsToRender, ...hubsToRender] : hubsToRender;

              return loopSafeHubs.map((hub, idx) => {
                const displayImage = hub.images && hub.images.length > 0 ? hub.images[0] : hub.image;

                return (
                  <SwiperSlide key={`branch-${idx}`} className="h-auto relative">
                    <div
                      onClick={() => setSelectedNetworkHub(hub)}
                      className="w-full h-[380px] rounded-2xl overflow-hidden border border-white/10 bg-stella-black flex flex-col justify-end shadow-2xl transition-all duration-500 hover:scale-[1.05] hover:z-30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:border-stella-red/50 cursor-pointer group"
                    >

                      {/* Background Image Container */}
                      <div className="absolute inset-0 z-0 bg-black">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={hub.name}
                            className="w-full h-full object-cover transition-transform duration-700 opacity-60 group-hover:opacity-100 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#111116] to-[#0a0a0c] flex items-center justify-center">
                            <div className="opacity-20 group-hover:scale-125 transition-transform duration-700">
                              <CleanLogo height={60} />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
                      </div>

                      {/* Content Overlay */}
                      <div className="relative z-10 p-5 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 leading-tight drop-shadow-md">
                          {hub.name}
                        </h3>

                        <div className="pt-3 border-t border-white/20 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                          <div>
                            {hub.manager && <p className="text-white text-[10px] font-bold tracking-wide mb-0.5">{hub.manager}</p>}
                            <p className="text-white/60 text-[8px] font-medium tracking-wider">{hub.phone}</p>
                          </div>
                          <a href={`tel:${hub.phone.replace(/\s+/g, '')}`} className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-stella-red hover:text-white transition-colors shadow-lg shrink-0">
                            <Phone className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                    </div>
                  </SwiperSlide>
                );
              });
            })()}
          </Swiper>
        </div>
      </section>

      {/* Customer Trust Section */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <Reveal3D variant="flip">
          <div className="text-center mb-10">
            <KineticTitle className="text-4xl font-black uppercase tracking-tighter text-white mb-3">
              Customer&apos;s trust{' '}
              <span className="text-stella-gold italic">on Stella Mobiles</span>
            </KineticTitle>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">What our galaxy of customers say</p>
          </div>
        </Reveal3D>

        <Reveal3D variant="up" delay={100}>
          <div className="relative h-[380px] overflow-hidden mt-10">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-stella-black via-stella-black/70 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stella-black via-stella-black/70 to-transparent z-20 pointer-events-none" />

            <div className="hidden md:grid grid-cols-3 gap-6 h-full">
              <div className="reviews-column overflow-hidden h-full relative p-3">
                <div className="flex flex-col gap-4 animate-marquee-vertical-up">
                  {col1Reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                  {col1Reviews.map((review) => (
                    <ReviewCard key={`dup-${review.id}`} review={review} keyPrefix="dup-" />
                  ))}
                </div>
              </div>

              <div className="reviews-column overflow-hidden h-full relative p-3">
                <div className="flex flex-col gap-4 animate-marquee-vertical-down">
                  {col2Reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                  {col2Reviews.map((review) => (
                    <ReviewCard key={`dup-${review.id}`} review={review} keyPrefix="dup-" />
                  ))}
                </div>
              </div>

              <div className="reviews-column overflow-hidden h-full relative p-3">
                <div className="flex flex-col gap-4 animate-marquee-vertical-up">
                  {col3Reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                  {col3Reviews.map((review) => (
                    <ReviewCard key={`dup-${review.id}`} review={review} keyPrefix="dup-" />
                  ))}
                  {col3Reviews.map((review) => (
                    <ReviewCard key={`dup2-${review.id}`} review={review} keyPrefix="dup2-" />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:hidden grid-cols-1 gap-6 h-full">
              <div className="reviews-column overflow-hidden h-full relative p-3">
                <div className="flex flex-col gap-4 animate-marquee-vertical-up">
                  {allMobileReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                  {allMobileReviews.map((review) => (
                    <ReviewCard key={`dup-${review.id}`} review={review} keyPrefix="dup-" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal3D>
      </section>

      <StoreLocatorModal
        isOpen={isStoreLocatorOpen}
        onClose={() => setIsStoreLocatorOpen(false)}
        hubs={activeConfig?.franchise?.hubs || defaultHubs}
      />

      <HubModal
        isOpen={!!selectedNetworkHub}
        onClose={() => setSelectedNetworkHub(null)}
        hub={selectedNetworkHub}
      />

      <style>{`
        @keyframes hero-pan {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, 1%); }
          100% { transform: scale(1.05) translate(0, 0); }
        }
        .animate-hero-pan {
          animation: hero-pan 20s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float-up-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-down-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
        }
        .animate-float-up-card {
          animation: float-up-card 8s ease-in-out infinite;
        }
        .animate-float-down-card {
          animation: float-down-card 8s ease-in-out infinite;
        }
        @keyframes marquee-vertical-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marquee-vertical-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-marquee-vertical-up {
          animation: marquee-vertical-up 24s linear infinite;
        }
        .animate-marquee-vertical-down {
          animation: marquee-vertical-down 24s linear infinite;
        }
        .reviews-column:hover .animate-marquee-vertical-up,
        .reviews-column:hover .animate-marquee-vertical-down {
          animation-play-state: paused !important;
        }
        .review-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          cursor: pointer;
          position: relative;
          z-index: 10;
        }
        .review-card:hover {
          transform: scale(1.06) translateY(-8px) !important;
          border-color: rgba(230, 57, 70, 0.4) !important;
          box-shadow: 0 20px 45px rgba(230, 57, 70, 0.15) !important;
          background-color: rgba(26, 26, 26, 0.95) !important;
          z-index: 50 !important;
        }
      `}</style>
    </div>
  );
}
