import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../lib/api';
import HubModal from './HubModal';

const HUB_IMAGES = [
  "https://images.unsplash.com/photo-1570126618953-d437176e8c79?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80"
];

export default function FranchiseHubsGallery({ hubs = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedHub, setSelectedHub] = useState(null);

  if (!hubs || hubs.length === 0) return null;

  return (
    <div className="w-full py-4">
      {/* Desktop / Tablet Horizontal Hover Expand Gallery */}
      <div className="hidden sm:flex w-full items-center justify-center gap-2 min-h-[280px]">
        {hubs.map((hub, idx) => {
          const imgUrl = getImageUrl(hub.image || HUB_IMAGES[idx % HUB_IMAGES.length]);
          const isActive = activeIdx === idx;
          
          return (
            <motion.div
              key={`hub-desktop-${idx}`}
              className="relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 shadow-lg"
              initial={{ width: "5.5rem", height: "240px" }}
              animate={{
                width: isActive ? "24rem" : "5.5rem",
                height: "240px",
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
              onClick={() => setActiveIdx(idx)}
              onHoverStart={() => setActiveIdx(idx)}
            >
              {/* Background Image */}
              <img
                src={imgUrl}
                alt={hub.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                style={{ filter: isActive ? 'brightness(0.35) contrast(1.15)' : 'brightness(0.55) contrast(0.9)' }}
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-black/30 to-transparent opacity-85" />

              {/* Vertical Title (when collapsed) */}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <span className="text-white font-black text-[9px] tracking-[0.35em] uppercase rotate-90 whitespace-nowrap opacity-60">
                    {hub.name.replace('Stella ', '')}
                  </span>
                </div>
              )}

              {/* Expanded Content */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="absolute inset-0 flex flex-col justify-end p-6 space-y-3 z-10"
                  >
                    <div>
                      <span className="bg-stella-red text-white text-[7px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded">
                        {hub.tag || 'Stella Hub'}
                      </span>
                      <h4 className="text-white font-black uppercase tracking-wide text-lg mt-2">{hub.name}</h4>
                    </div>
                    
                    <div className="flex items-center gap-4 border-t border-white/20 pt-4 opacity-80">
                      <a 
                        href={`tel:${hub.phone.replace(/\s+/g,'')}`}
                        className="text-white text-[9px] font-bold tracking-widest hover:text-stella-red transition-colors"
                      >
                        {hub.phone}
                      </a>
                      <span className="text-white/40 text-[9px]">|</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{hub.hours || '10 AM - 9 PM'}</span>
                    </div>

                    {/* View Full Details Button */}
                    <div className="mt-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHub(hub);
                        }}
                        className="bg-stella-red hover:bg-white hover:text-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded border border-transparent hover:border-white transition-all shadow-lg"
                      >
                        View Full Details
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Vertical Expand Accordion Gallery */}
      <div className="flex sm:hidden flex-col gap-3 w-full">
        {hubs.map((hub, idx) => {
          const imgUrl = getImageUrl(hub.image || HUB_IMAGES[idx % HUB_IMAGES.length]);
          const isActive = activeIdx === idx;

          return (
            <motion.div
              key={`hub-mobile-${idx}`}
              className="relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/10 shadow-md"
              initial={{ height: "55px" }}
              animate={{
                height: isActive ? "160px" : "55px",
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              onClick={() => setActiveIdx(isActive ? -1 : idx)}
            >
              {/* Background Image */}
              <img
                src={imgUrl}
                alt={hub.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: isActive ? 'brightness(0.3) contrast(1.15)' : 'brightness(0.45) contrast(0.9)' }}
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-black/45 to-transparent" />

              {/* Collapsed Header */}
              <div className="absolute top-0 inset-x-0 h-[55px] flex items-center justify-between px-5 z-10">
                <div>
                  <span className="bg-stella-red text-white text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                    {hub.tag}
                  </span>
                  <h4 className="text-white font-black uppercase tracking-wide text-xs mt-1">{hub.name}</h4>
                </div>
                <span className="text-white text-xs opacity-60">
                  {isActive ? '▼' : '▶'}
                </span>
              </div>

              {/* Expanded Content Details */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute bottom-0 inset-x-0 p-5 pt-0 space-y-2.5 z-10"
                  >
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <a
                        href={`tel:${hub.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-stella-gold font-black text-[8px] uppercase tracking-widest"
                      >
                        {hub.phone}
                      </a>
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">{hub.hours || '10 AM - 9 PM'}</span>
                    </div>
                    {/* View Full Details Button Mobile */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHub(hub);
                        }}
                        className="w-full bg-stella-red hover:bg-white hover:text-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded transition-all"
                      >
                        View Full Details
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      
      <HubModal 
        isOpen={!!selectedHub} 
        onClose={() => setSelectedHub(null)} 
        hub={selectedHub} 
      />
    </div>
  );
}
