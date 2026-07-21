import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, MapPinIcon, PhoneIcon, NavigationIcon, UserIcon } from 'lucide-react';

export default function StoreLocatorModal({ isOpen, onClose, hubs = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeStore, setActiveStore] = useState(null);

  const allHubs = useMemo(() => hubs || [], [hubs]);

  // Set default active store when modal opens
  useEffect(() => {
    if (isOpen && allHubs.length > 0 && !activeStore) {
      setActiveStore(allHubs[0]);
    }
  }, [isOpen, allHubs, activeStore]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredHubs = useMemo(() => {
    return allHubs.filter((hub) => {
      const matchesSearch =
        hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Own' && hub.tag.includes('Own')) ||
        (activeFilter === 'Franchise' && hub.tag.includes('Franchise'));

      return matchesSearch && matchesFilter;
    });
  }, [hubs, searchQuery, activeFilter]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[1400px] h-full max-h-[90vh] bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
            >
              <XIcon size={20} />
            </button>

            {/* Left Sidebar (Directory) */}
            <div className="w-full md:w-[35%] border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-gradient-to-b from-white/[0.02] to-transparent h-1/2 md:h-full">
              
              <div className="p-6 md:p-8 shrink-0">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-md">
                  Store Locator
                </h2>
                <p className="text-gray-400 text-sm">Select a store to view its location.</p>
              </div>

              {/* Scrollable Store List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-0 space-y-4">
                {filteredHubs.length > 0 ? (
                  filteredHubs.map((hub, idx) => {
                    const isActive = activeStore?.name === hub.name;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveStore(hub)}
                        className={`cursor-pointer border rounded-2xl p-4 transition-all duration-300 group ${
                          isActive 
                            ? 'bg-stella-red/10 border-stella-red shadow-lg shadow-stella-red/10' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-base font-bold transition-colors ${isActive ? 'text-stella-red' : 'text-white group-hover:text-stella-red'}`}>
                            {hub.tag?.includes('Own') ? 'Stella Mobiles Sales and Services - ' + hub.name : hub.name}
                          </h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-3 leading-relaxed">
                          <strong className="text-gray-300">{hub.tag?.includes('Own') ? 'Stella Mobiles Sales and Services - ' + hub.name : hub.name}</strong>, {hub.address}
                        </p>
                        <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-md ${
                          hub.tag.includes('Own') ? 'bg-stella-red/20 text-stella-red' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {hub.tag}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <MapPinIcon size={32} className="text-gray-600 mb-4" />
                    <p className="text-gray-400">No stores found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel (Interactive Map) */}
            <div className="w-full md:w-[65%] h-1/2 md:h-full relative bg-[#1a1a1a] flex flex-col">
              {activeStore ? (
                <>
                  <div className="flex-1 w-full relative">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={activeStore.mapUrl?.includes('embed') ? activeStore.mapUrl : `https://maps.google.com/maps?q=${activeStore.mapUrl && !activeStore.mapUrl.startsWith('http') ? encodeURIComponent(activeStore.mapUrl) : encodeURIComponent((activeStore.tag?.includes('Own') ? 'Stella Mobiles Sales and Services - ' : '') + activeStore.name + ', ' + activeStore.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  
                  {/* Bottom Action Bar */}
                  <div className="shrink-0 bg-[#121218] border-t border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 z-10">
                    <div className="flex-1 w-full">
                      <h3 className="text-2xl font-black text-white mb-2">{activeStore.tag?.includes('Own') ? 'Stella Mobiles Sales and Services - ' + activeStore.name : activeStore.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                        {activeStore.manager && (
                          <span className="flex items-center gap-1.5"><UserIcon size={16} className="text-stella-red" /> {activeStore.manager}</span>
                        )}
                      </div>
                      <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                        <MapPinIcon className="text-stella-gold mt-1 shrink-0" size={16} />
                        <p className="text-gray-300 text-sm leading-relaxed">
                          <strong className="text-white font-bold">{activeStore.tag?.includes('Own') ? 'Stella Mobiles Sales and Services - ' + activeStore.name : activeStore.name}</strong><br />
                          {activeStore.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex w-full md:w-auto gap-3 shrink-0">
                      <a
                        href={`tel:${activeStore.phone.replace(/[^0-9+]/g, '')}`}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <PhoneIcon size={20} />
                      </a>
                      <a
                        href={activeStore.mapUrl?.startsWith('http') && !activeStore.mapUrl.includes('embed') ? activeStore.mapUrl : `https://www.google.com/maps/dir/?api=1&destination=${activeStore.mapUrl && !activeStore.mapUrl.startsWith('http') ? encodeURIComponent(activeStore.mapUrl) : encodeURIComponent((activeStore.tag?.includes('Own') ? 'Stella Mobiles and Services ' : '') + activeStore.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none bg-stella-red hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-xl shadow-stella-red/20 uppercase tracking-widest"
                      >
                        <NavigationIcon size={20} />
                        Start Navigation
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-4">
                  <MapPinIcon size={64} className="opacity-20" />
                  <p>Select a store to view the map.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
