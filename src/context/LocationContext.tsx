import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  city: string;
  setCity: (city: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Multan if stored, or just Karachi as general default
  const [city, setCityState] = useState<string>(() => {
    return localStorage.getItem('user_city') || 'Karachi';
  });

  const setCity = (newCity: string) => {
    setCityState(newCity);
    localStorage.setItem('user_city', newCity);
  };

  return (
    <LocationContext.Provider value={{ city, setCity }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
