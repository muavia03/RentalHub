import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home } from 'lucide-react';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary/30 relative">
          <Home size={48} strokeWidth={2.5} />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 bg-primary/20 rounded-[32px]"
          />
        </div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl font-display font-bold tracking-tight text-on-surface"
        >
          Rental<span className="text-primary italic">Hub</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant"
        >
          Premium Estates
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
