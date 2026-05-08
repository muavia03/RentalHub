import { Routes, Route, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Dashboard from './screens/Dashboard';
import SearchScreen from './screens/Search';
import { PostListingScreen } from './screens/ListingActions';
import { ProfileScreen, LoginScreen, SignupScreen } from './screens/AuthAndProfile';
import { PropertyDetailScreen } from './screens/PropertyDetail';
import { Header, BottomNav } from './components/Navigation';
import { SplashScreen } from './components/Splash';

// Layout wrapper for screens with Nav
const MainLayout = () => (
  <div className="flex flex-col min-h-screen pb-20">
    <Header />
    <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 w-full pt-4">
      <Outlet />
    </main>
    <BottomNav />
  </div>
);

import ManagementScreen from './screens/Management';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>
      {!showSplash && (
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/property/:id" element={<PropertyDetailScreen />} />
            <Route path="/create" element={<PostListingScreen />} />
            <Route path="/edit/:id" element={<PostListingScreen />} />
            <Route path="/management" element={<ManagementScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Route>
        </Routes>
      )}
    </>
  );
}
