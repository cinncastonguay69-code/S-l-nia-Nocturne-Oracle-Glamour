/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Sparkles, Layout, Moon, Heart, Star } from 'lucide-react';
import { StarryBackground, CelestialBackground } from './components/StarryBackground';
import { ChatInterface } from './components/ChatInterface';
import { OracleSection } from './components/OracleSection';
import { cn } from './lib/utils';
import { Settings, Palette, Cloud, Sun, Moon as MoonIcon, X } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<'oracle' | 'chat'>('oracle');
  const [showExitProtocol, setShowExitProtocol] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState({
    background: 'deep' as CelestialBackground,
    accent: '#C9A84C', // Gold
  });

  const ACCENTS = [
    { name: 'Or Stellaire', color: '#C9A84C' },
    { name: 'Argent Lunaire', color: '#C0C0C0' },
    { name: 'Rose Nocturne', color: '#DB2777' },
    { name: 'Bleu Cosmique', color: '#4F46E5' },
  ];

  const BACKGROUNDS: { id: CelestialBackground; name: string, icon: any }[] = [
    { id: 'deep', name: 'Nuit Profonde', icon: MoonIcon },
    { id: 'nebula', name: 'Nébuleuse Perdue', icon: Cloud },
    { id: 'aurora', name: 'Aurore Boréale', icon: Sun },
  ];

  return (
    <StarryBackground theme={theme}>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass px-6 py-3 rounded-full border-gold/30 gold-glow flex items-center gap-8">
          <button 
            onClick={() => setActiveSection('oracle')}
            className={cn(
              "flex items-center gap-2 transition-all",
              activeSection === 'oracle' ? "text-gold scale-110" : "text-muted-foreground hover:text-gold"
            )}
          >
            <Layout size={20} />
            <span className="text-xs font-sans font-bold uppercase tracking-widest hidden sm:inline">Oracle</span>
          </button>
          
          <div className="w-px h-6 bg-gold/20" />
          
          <button 
            onClick={() => setActiveSection('chat')}
            className={cn(
              "flex items-center gap-2 transition-all",
              activeSection === 'chat' ? "text-gold scale-110" : "text-muted-foreground hover:text-gold"
            )}
          >
            <MessageSquare size={20} />
            <span className="text-xs font-sans font-bold uppercase tracking-widest hidden sm:inline">Nacre</span>
          </button>

          <div className="w-px h-6 bg-gold/20" />

          <button 
            onClick={() => setShowThemeSettings(true)}
            className="text-muted-foreground hover:text-gold transition-all"
            title="Personnaliser le Sanctuaire"
          >
            <Palette size={20} />
          </button>

          <div className="w-px h-6 bg-gold/20" />

          <button 
            onClick={() => setShowExitProtocol(true)}
            className="text-muted-foreground hover:text-rose transition-all"
          >
            <MoonIcon size={20} />
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 pt-24 pb-32 px-4">
          <AnimatePresence mode="wait">
            {activeSection === 'oracle' ? (
              <motion.div
                key="oracle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <OracleSection />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <ChatInterface />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Theme Settings Modal */}
        <AnimatePresence>
          {showThemeSettings && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass max-w-md w-full p-8 rounded-[3rem] border-gold/30 gold-glow space-y-8 relative"
              >
                <button 
                  onClick={() => setShowThemeSettings(false)}
                  className="absolute top-6 right-6 text-muted-foreground hover:text-gold transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl text-rose">Personnalisation</h2>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">L'Esthétique de votre Âme</p>
                </div>

                <div className="space-y-6">
                  {/* Background Selection */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gold">Ambiance Céleste</p>
                    <div className="grid grid-cols-3 gap-3">
                      {BACKGROUNDS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => setTheme(prev => ({ ...prev, background: bg.id }))}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                            theme.background === bg.id ? "bg-gold/20 border-gold text-gold" : "bg-muted/50 border-gold/10 text-muted-foreground hover:border-gold/30"
                          )}
                        >
                          <bg.icon size={20} />
                          <span className="text-[10px] font-bold text-center leading-tight">{bg.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color Selection */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gold">Couleur de l'Aura</p>
                    <div className="grid grid-cols-4 gap-3">
                      {ACCENTS.map((accent) => (
                        <button
                          key={accent.color}
                          onClick={() => setTheme(prev => ({ ...prev, accent: accent.color }))}
                          className={cn(
                            "group flex flex-col items-center gap-2 transition-transform active:scale-95",
                            theme.accent === accent.color ? "scale-110" : ""
                          )}
                        >
                          <div 
                            className="w-10 h-10 rounded-full border-2 transition-all shadow-lg"
                            style={{ 
                              backgroundColor: accent.color,
                              borderColor: theme.accent === accent.color ? '#fff' : 'transparent',
                              boxShadow: `0 0 15px ${accent.color}44`
                            }}
                          />
                          <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground group-hover:text-gold transition-colors">{accent.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowThemeSettings(false)}
                  className="w-full py-4 bg-gold text-background rounded-full font-sans font-bold uppercase tracking-widest hover:bg-gold/80 transition-all gold-glow"
                >
                  Appliquer les Énergies
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exit Protocol Modal */}
        <AnimatePresence>
          {showExitProtocol && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass max-w-lg w-full p-10 rounded-[3rem] border-gold/30 gold-glow text-center space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-4xl text-rose">L'Ancrage de Sélénia</h2>
                  <p className="text-xs text-muted-foreground font-sans uppercase tracking-[0.4em]">Protocole de Sortie</p>
                </div>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-gold">Synthèse</p>
                    <p className="text-lg italic">"La clarté que vous cherchez se trouve dans le silence de votre intuition."</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-gold">Action Glamour</p>
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <Heart size={16} className="text-rose" />
                      <span>Allumez une bougie parfumée au jasmin ce soir.</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-gold">Rappel Lunaire</p>
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <Moon size={16} className="text-silver" />
                      <span>La Lune est en Cancer. Votre sensibilité est votre force.</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowExitProtocol(false)}
                  className="w-full py-4 bg-gold text-background rounded-full font-sans font-bold uppercase tracking-widest hover:bg-gold/80 transition-all"
                >
                  Retourner au Sanctuaire
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Branding */}
        <footer className="p-8 text-center opacity-30 pointer-events-none">
          <p className="text-[10px] uppercase tracking-[1em] font-sans">Sélénia Nocturne • Vision 2026</p>
        </footer>
      </div>
    </StarryBackground>
  );
}
