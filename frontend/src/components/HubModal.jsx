import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { MapPin, Phone, User } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function HubModal({ isOpen, onClose, hub }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !hub) return null;

  // Handle both string image and array of images
  const images = Array.isArray(hub.images) && hub.images.length > 0
    ? hub.images
    : (hub.image ? [hub.image] : ['https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80']);

  const getMapsUrl = () => {
    if (hub.mapUrl) return hub.mapUrl;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hub.address)}`;
  };

  const getWhatsAppUrl = () => {
    if (!hub.phone) return '#';
    const number = hub.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${number}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
            className="relative w-full max-w-4xl bg-[#0a0a0c] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 z-10 flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-stella-red text-white flex items-center justify-center border border-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Left: Image Slider */}
            <div className="w-full md:w-[55%] h-[300px] md:h-auto min-h-[300px] bg-black relative">
              <div className="absolute inset-0 w-full h-full">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  loop={images.length > 1}
                  className="w-full h-full hub-modal-swiper"
                >
                  {images.map((img, idx) => (
                    <SwiperSlide key={idx} className="w-full h-full bg-black flex items-center justify-center">
                      <img src={img} alt={`${hub.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* Right: Store Details */}
            <div className="w-full md:w-[45%] p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col bg-gradient-to-b from-[#111116] to-[#0a0a0c]">
              <span className="inline-block bg-stella-red/10 text-stella-red text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-stella-red/20 mb-4 w-fit">
                {hub.tag || 'Stella Store'}
              </span>

              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-tight">
                {hub.name}
              </h2>

              {hub.description && (
                <p className="text-gray-400 text-xs leading-relaxed mb-8">
                  {hub.description}
                </p>
              )}

              <div className="space-y-6 mt-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-stella-gold" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1">Location</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{hub.address}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-stella-gold" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1">Contact</h4>
                    <p className="text-gray-400 text-xs">{hub.phone}</p>
                  </div>
                </div>

                {hub.manager && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-stella-gold" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1">Store Manager</h4>
                      <p className="text-gray-400 text-xs">{hub.manager}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 flex flex-col gap-3 mt-auto">
                <a
                  href={getMapsUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-stella-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> Get Directions
                </a>

                {hub.phone && (
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl border border-[#25D366]/30 hover:border-[#25D366] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    WhatsApp Store
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
