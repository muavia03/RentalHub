import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Clock, Bell, Map as MapIcon, MessageSquare, SlidersHorizontal, MapPin } from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';
import { PropertyCard } from '../components/PropertyCard';
import { LocationSelector } from '../components/LocationSelector';
import { cn } from '../lib/utils';
import { useLocation } from '../context/LocationContext';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, currentRole } = useAuth();
  const { city } = useLocation();
  const [listings, setListings] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[];
      if (data.length > 0) {
        setListings(data);
      } else {
        setListings(MOCK_PROPERTIES); // Fallback to mock if empty
      }
      setLoading(false);
    }, (error) => {
      console.error("Dashboard list error", error);
      setListings(MOCK_PROPERTIES); // Fallback on error
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const topMatch = listings[0] || MOCK_PROPERTIES[0];

  return (
    <div className="space-y-12 pb-32 pt-6">
      {/* Brand Hero Section */}
      <section className="relative px-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-high rounded-[32px] p-8 md:p-12 overflow-hidden relative"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
              <MapPin size={14} />
              Viewing Estates in {city}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-on-surface leading-[1.1] mb-6">
              Find Your Perfect <br/> 
              <span className="text-primary italic">Rental Space</span> in Pakistan.
            </h1>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed mb-8">
              The premium real estate platform for authentic listings, direct owner contact, and verified documentation. Whether you're looking to sell or buy, we make it seamless.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/search')}
                className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                Browse Listings
              </button>
              <button 
                onClick={() => navigate('/management')}
                className="bg-white border border-outline-variant text-on-surface px-8 py-4 rounded-2xl font-bold hover:bg-surface-container transition-all active:scale-95"
              >
                Post Property
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* App Features / How it Works */}
      <section className="px-2">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-on-surface">Core Features</h2>
          <p className="text-on-surface-variant font-medium">Everything you need to find or list a home.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Verified Listings", 
              desc: "All properties go through a manual verification process to ensure authenticity and trust.",
              icon: MapIcon,
              color: "text-blue-500",
              bg: "bg-blue-50"
            },
            { 
              title: "Direct Communication", 
              desc: "Connect directly with owners and sellers through our secure messaging and call system.",
              icon: MessageSquare,
              color: "text-green-500",
              bg: "bg-green-50"
            },
            { 
              title: "Smart Filters", 
              desc: "Find exact properties in your desired neighborhood with our advanced location search.",
              icon: SlidersHorizontal,
              color: "text-orange-500",
              bg: "bg-orange-50"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl border border-outline-variant hover:border-primary/50 transition-colors group"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.bg, feature.color)}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Role-Based Quick Actions */}
      <section className="px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-secondary-container text-on-secondary-container p-8 rounded-[32px] flex flex-col justify-between h-64 relative overflow-hidden group">
              <div className="relative z-10">
                <Clock className="mb-4 opacity-70" size={32} />
                <h3 className="text-2xl font-display font-bold mb-2">Are you a Buyer?</h3>
                <p className="opacity-80 font-medium max-w-xs">Start searching for your dream house in Multan, Lahore, or Karachi today.</p>
              </div>
              <button 
                onClick={() => navigate('/search')}
                className="relative z-10 w-fit bg-on-secondary-container text-secondary-container px-6 py-2 rounded-full font-bold text-sm active:scale-95 transition-transform"
              >
                Go to Search
              </button>
              <Heart size={120} className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform" />
           </div>

           <div className="bg-tertiary-container text-on-tertiary-container p-8 rounded-[32px] flex flex-col justify-between h-64 relative overflow-hidden group">
              <div className="relative z-10">
                <Bell className="mb-4 opacity-70" size={32} />
                <h3 className="text-2xl font-display font-bold mb-2">Are you a Seller?</h3>
                <p className="opacity-80 font-medium max-w-xs">List your property for free and get reached by thousands of verified buyers.</p>
              </div>
              <button 
                onClick={() => navigate('/management')}
                className="relative z-10 w-fit bg-on-tertiary-container text-tertiary-container px-6 py-2 rounded-full font-bold text-sm active:scale-95 transition-transform"
              >
                Manage My Listings
              </button>
              <Sparkles size={120} className="absolute -bottom-4 -right-4 opacity-10 group-hover:rotate-12 transition-transform" />
           </div>
        </div>
      </section>

      {/* Recent Listings in your City */}
      <section className="px-2">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold">Recently Added</h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Popular rentals in <span className="text-primary font-bold">{city}</span> and surrounding areas.
            </p>
          </div>
          <button 
            onClick={() => navigate('/search')}
            className="text-primary text-sm font-bold hover:underline uppercase tracking-wider"
          >
            See All
          </button>
        </div>
        
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {[1,2,3].map(i => <div key={i} className="w-72 h-64 bg-surface-container animate-pulse rounded-3xl shrink-0" />)}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory">
            {listings.length > 0 ? (
              listings.map(property => (
                <div key={property.id} className="snap-start shrink-0">
                  <PropertyCard property={property} compact />
                </div>
              ))
            ) : (
              <div className="w-full py-12 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant flex flex-col items-center justify-center text-center px-6">
                <MapIcon size={40} className="text-outline mb-4" />
                <p className="text-on-surface font-bold">No real listings in {city} yet.</p>
                <p className="text-on-surface-variant text-xs mt-1">Be the first to list a property here!</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="px-2 mb-12">
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center gap-6">
           <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Heart size={32} />
           </div>
           <div>
              <h3 className="text-xl font-display font-bold">Why choose RentalHub?</h3>
              <p className="text-on-surface-variant text-sm mt-1">We are Pakistan's most trusted real estate community. Join us and experience the difference.</p>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
