import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, Star, Heart } from 'lucide-react';
import { MOCK_PROPERTIES, PAKISTAN_CITIES } from '../constants';
import { PropertyCard } from '../components/PropertyCard';
import { formatPrice, cn } from '../lib/utils';
import { useLocation } from '../context/LocationContext';

import { collection, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';

const SearchScreen = () => {
  const { city: globalCity } = useLocation();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: globalCity || 'All Neighborhoods',
    type: 'All Types',
    minPrice: '',
    maxPrice: '',
  });

  // Effect to sync global location changes to filters
  useEffect(() => {
    if (globalCity && globalCity !== 'Karachi') { 
        setFilters(prev => ({ ...prev, city: globalCity }));
        // fetchListings will be called by the existing useEffect on mount or we can trigger it
    }
  }, [globalCity]);

  const [searchQuery, setSearchQuery] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[];
      
      const hasRealListings = data.length > 0;

      // Client-side filtering
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        data = data.filter(l => 
          (l.title?.toLowerCase() || '').includes(queryLower) || 
          (l.location?.toLowerCase() || '').includes(queryLower) || 
          (l.city?.toLowerCase() || '').includes(queryLower) ||
          (l.description?.toLowerCase() || '').includes(queryLower)
        );
      }
      
      if (filters.city !== 'All Neighborhoods') {
        data = data.filter(l => l.city === filters.city);
      }
      if (filters.type !== 'All Types') {
        data = data.filter(l => l.type === filters.type);
      }
      if (filters.minPrice) {
        data = data.filter(l => Number(l.price) >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        data = data.filter(l => Number(l.price) <= Number(filters.maxPrice));
      }
      
      // If we have real listings but NONE match the filter, show empty list (the truth)
      // If we have NO real listings at all in the system, show mock properties as examples
      setListings(data.length > 0 ? data : (hasRealListings ? [] : MOCK_PROPERTIES));
      
      // Store whether these are real or mock for UI hints
      (window as any)._isShowingRealData = data.length > 0;
      (window as any)._systemHasRealListings = hasRealListings;
    } catch (err) {
      console.error("Search fetch error", err);
      setListings(MOCK_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchListings();
  }, []);

  const handleApplyFilters = () => {
    fetchListings();
  };

  const handleClearFilters = () => {
    setFilters({
      city: 'All Neighborhoods',
      type: 'All Types',
      minPrice: '',
      maxPrice: '',
    });
    setSearchQuery('');
  };

  const isShowingMock = listings.length > 0 && !(window as any)._isShowingRealData;
  const noMatchesFound = listings.length === 0 && (window as any)._systemHasRealListings;

  return (
    <div className="space-y-6 pb-32">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display font-bold text-on-surface">Search Listings</h2>
          {listings.length > 0 && !isShowingMock && (
             <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
               {listings.length} Real Results
             </span>
          )}
        </div>
        <div className="relative w-full h-14">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
            <Search size={22} />
          </span>
          <input 
            className="w-full h-full pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-2xl text-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-sm" 
            placeholder="Search by title, city (e.g. Multan), or neighborhood..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
          />
        </div>
      </header>

      {/* Filters Preview / Toggle */}
      <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-on-surface">Filters</h4>
          <button 
            onClick={handleClearFilters}
            className="text-primary text-sm font-semibold active:scale-95"
          >
            Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Location</label>
            <div className="relative">
              <select 
                value={filters.city}
                onChange={(e) => setFilters({...filters, city: e.target.value})}
                className="w-full h-12 appearance-none bg-surface-container-low border border-outline-variant rounded-xl px-4 text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option>All Neighborhoods</option>
                {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Property Type</label>
            <div className="relative">
              <select 
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full h-12 appearance-none bg-surface-container-low border border-outline-variant rounded-xl px-4 text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option>All Types</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Villa</option>
                <option>Commercial</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-bold">Price Range (PKR/mo)</label>
              <span className="text-primary text-sm font-semibold">Custom Range</span>
            </div>
            <div className="flex gap-4">
              <input 
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="flex-1 h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 text-sm" 
                placeholder="Min" 
                type="number" 
              />
              <input 
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="flex-1 h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 text-sm" 
                placeholder="Max" 
                type="number" 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button 
            onClick={handleApplyFilters}
            className="flex-1 h-12 bg-primary text-white font-bold rounded-xl active:scale-[0.98] transition-transform shadow-md"
          >
            {loading ? 'Searching...' : 'Apply Filters'}
          </button>
          <button 
            onClick={handleClearFilters}
            className="flex-1 h-12 text-on-surface-variant font-semibold rounded-xl hover:bg-surface-container transition-colors"
          >
            Clear All
          </button>
        </div>
      </section>

      {/* Results List */}
      <section className="space-y-6">
        {isShowingMock && (
           <div className="bg-secondary-container/30 border border-secondary-container p-4 rounded-2xl flex items-center gap-3">
              <Star size={20} className="text-secondary" />
              <p className="text-sm font-medium text-on-secondary-container leading-tight">
                Showing <span className="font-bold underline">Suggestions</span>. Start by searching for a city or neighborhood to see real listings!
              </p>
           </div>
        )}

        {noMatchesFound ? (
          <div className="py-16 text-center space-y-4">
             <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-outline">
                <Search size={32} />
             </div>
             <div>
                <h3 className="text-xl font-display font-bold">No real listings found</h3>
                <p className="text-on-surface-variant max-w-xs mx-auto">We couldn't find any real properties matching your search. Try a broader city or keyword.</p>
             </div>
             <button 
              onClick={handleClearFilters}
              className="text-primary font-bold hover:underline"
             >
                View all listings
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-full space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-64 bg-surface-container animate-pulse rounded-3xl" />)}
              </div>
            ) : (
              listings.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchScreen;
