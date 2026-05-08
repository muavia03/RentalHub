import React from 'react';
import { Search, SlidersHorizontal, UserCircle, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LocationSelector } from './LocationSelector';
import { cn } from '../lib/utils';

export const Header = () => {
  const { currentRole, switchRole, user } = useAuth();

  return (
    <header className="bg-surface sticky top-0 z-40 w-full shadow-sm border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2">
             <Building2 size={28} className="text-primary" />
             <h1 className="font-display text-2xl font-extrabold text-primary tracking-tight">RentalHub</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <LocationSelector />
            
            {/* Mode Switcher */}
            {user && (
              <div className="bg-surface-container rounded-full p-1 flex items-center shadow-inner border border-outline-variant/20">
                <button 
                  onClick={() => switchRole('Tenant')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    currentRole === 'Tenant' ? "bg-primary text-white shadow-md scale-105" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  Buyer
                </button>
                <button 
                  onClick={() => switchRole('Landlord')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    currentRole === 'Landlord' ? "bg-primary text-white shadow-md scale-105" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  Seller
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 items-center mr-2">
            <span className="text-[10px] text-primary font-bold cursor-pointer uppercase tracking-widest">Discover</span>
            <span className="text-[10px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer uppercase tracking-widest">Alerts</span>
            <span className="text-[10px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer uppercase tracking-widest">Support</span>
          </nav>
          <div className="flex items-center gap-1 bg-surface-container-low rounded-full px-1 py-1 border border-outline-variant/30">
            <button className="text-primary hover:bg-white transition-all p-2 rounded-full active:scale-90">
              <Search size={20} />
            </button>
            <button className="text-on-surface-variant hover:bg-white transition-all p-2 rounded-full active:scale-90">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

import { NavLink } from 'react-router-dom';
import { Sparkles, Search as SearchIcon, Heart, User, LayoutDashboard, Plus } from 'lucide-react';

export const BottomNav = () => {
  const { currentRole } = useAuth();
  
  const allLinks = [
    { to: '/home', icon: Sparkles, label: 'Home' },
    { to: '/search', icon: SearchIcon, label: 'Search' },
    { to: '/create', icon: Plus, label: 'Post', role: 'Landlord' },
    { to: '/management', icon: LayoutDashboard, label: 'Manage', role: 'Landlord' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  // Filter links based on role
  const links = allLinks.filter(link => !link.role || link.role === currentRole);

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-t border-outline-variant shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-20 flex items-center justify-around px-2 pb-safe">
      {links.map((link) => {
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center rounded-2xl p-2 transition-all duration-300 w-16 mb-2",
                isActive ? "text-primary bg-primary/5 -translate-y-1" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              )
            }
          >
            <div className={cn(
               "mb-1.5 p-1 rounded-lg transition-transform",
               link.label === 'Post' && "bg-primary text-white p-2 mb-2 shadow-lg shadow-primary/20 scale-110"
            )}>
              <link.icon size={link.label === 'Post' ? 24 : 22} />
            </div>
            {link.label !== 'Post' && <span className="text-[9px] font-bold uppercase tracking-widest">{link.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
};
