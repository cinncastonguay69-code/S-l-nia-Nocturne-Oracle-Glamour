import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import { cn } from '../lib/utils';

export type CelestialBackground = 'deep' | 'nebula' | 'aurora';

interface Theme {
  background: CelestialBackground;
  accent: string;
}

export const StarryBackground: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    // Apply theme colors to root
    const root = document.documentElement;
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--secondary-color', theme.accent === '#C9A84C' ? '#DB2777' : theme.accent === '#C0C0C0' ? '#4F46E5' : '#C9A84C');
  }, [theme.accent]);

  return (
    <div className={cn("min-h-screen relative text-foreground font-body selection:bg-gold/30 overflow-hidden", theme.background === 'deep' ? 'bg-[#050508]' : theme.background === 'nebula' ? 'bg-[#0A0A1F]' : 'bg-[#0A1A2F]')}>
      {/* Background Layer */}
      {theme.background === 'nebula' && (
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/40 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        </div>
      )}
      
      {theme.background === 'aurora' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent animate-pulse" />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              '--duration': star.duration,
            } as any}
          />
        ))}
      </div>
      
      {/* Decorative Elements */}
      <div className="fixed top-8 left-8 flex items-start gap-4 z-50 pointer-events-none">
        <motion.div 
          initial={{ rotate: -15, scale: 0 }}
          animate={{ rotate: -15, scale: 1 }}
          transition={{ duration: 1, type: 'spring' }}
          className="text-6xl drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]"
        >
          💛
        </motion.div>
        <motion.div 
          initial={{ rotate: 15, scale: 0 }}
          animate={{ rotate: 15, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring' }}
          className="text-5xl drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]"
        >
          🌙
        </motion.div>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
