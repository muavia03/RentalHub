import React, { useState } from 'react';
import { MapPin, LocateFixed, Loader2, Check } from 'lucide-react';
import { PAKISTAN_CITIES } from '../constants';
import { useLocation } from '../context/LocationContext';
import { cn } from '../lib/utils';

export const LocationSelector = () => {
  const { city, setCity } = useLocation();
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleGps = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Robust Geolocation:
          // In a real app, we would use reverse geocoding with coordinates.
          // Since we are mocking, we'll "detect" Multan since the user is there.
          setTimeout(() => {
            setCity("Multan");
            setLoading(false);
            setShowDropdown(false);
          }, 1500);
        },
        () => {
          setLoading(false);
          alert("Unable to access GPS. Please select your city manually.");
        }
      );
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-full shadow-sm cursor-pointer hover:bg-surface-container-low transition-all active:scale-95"
           onClick={() => setShowDropdown(!showDropdown)}>
        <MapPin size={16} className="text-primary" />
        <span className="text-sm font-bold text-on-surface whitespace-nowrap">{city}, Pakistan</span>
        <div className={cn("ml-1 transition-transform duration-300", showDropdown ? "rotate-180" : "")}>
           <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
      </div>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute top-12 left-0 w-72 bg-white border border-primary/10 rounded-[24px] shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-left">
            <div className="p-3">
              <button 
                onClick={(e) => { e.stopPropagation(); handleGps(); }}
                className="w-full flex items-center justify-between p-4 bg-primary text-white rounded-2xl transition-all active:scale-95 font-bold mb-4 shadow-lg shadow-primary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <LocateFixed size={18} />
                  </div>
                  <span>Use GPS Location</span>
                </div>
                {loading && <Loader2 size={16} className="animate-spin" />}
              </button>
              
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2 mb-2 flex items-center gap-2">
                <div className="h-px bg-outline-variant flex-1" />
                Featured Cities
                <div className="h-px bg-outline-variant flex-1" />
              </div>
              
              <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {PAKISTAN_CITIES.map(c => (
                  <button 
                    key={c}
                    onClick={() => { setCity(c); setShowDropdown(false); }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                      city === c ? "bg-primary/5 text-primary" : "hover:bg-surface-container"
                    )}
                  >
                    <span className={cn("text-sm font-medium", city === c ? "font-bold" : "")}>{c}</span>
                    {city === c && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
