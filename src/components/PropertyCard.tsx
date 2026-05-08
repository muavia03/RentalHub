import React from 'react';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import { Property } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

import { Link } from 'react-router-dom';

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, compact = false }) => {
  return (
    <motion.article 
      whileHover={{ y: -5 }}
      className={cn(
        "bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm group transition-shadow hover:shadow-lg h-full flex flex-col",
        compact ? "min-w-[320px] md:min-w-[380px]" : "w-full focus-within:ring-2 focus-within:ring-primary"
      )}
    >
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={property.images?.[0] || (property as any).image} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-outline-variant">
            <Star size={14} className="text-primary fill-primary" />
            <span className="text-xs font-bold">4.8</span>
          </div>
          <div className="absolute bottom-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
            {property.match || 90}% Match
          </div>
        </div>
      </Link>

      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start">
            <Link to={`/property/${property.id}`} className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">{property.title}</h2>
            </Link>
            <div className="text-right shrink-0 ml-2">
                <span className="text-lg text-primary font-extrabold">{formatPrice(property.price)}</span>
                <span className="text-[10px] font-normal text-on-surface-variant block">/month</span>
            </div>
            </div>

            <div className="flex items-center gap-1 text-on-surface-variant text-sm mt-1">
            <MapPin size={16} className="text-primary shrink-0" />
            <span className="truncate">{property.location}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
            {property.amenities?.slice(0, 3).map(amenity => (
                <span key={amenity} className="px-3 py-1 bg-surface-container rounded-md text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                {amenity}
                </span>
            ))}
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-outline-variant flex justify-end">
          <Link to={`/property/${property.id}`} className="text-sm text-primary font-bold flex items-center gap-1 hover:underline group">
            View Details <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};
