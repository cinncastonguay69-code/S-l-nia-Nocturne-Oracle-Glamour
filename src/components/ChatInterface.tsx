import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Brain, Moon, Wind, Heart, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { destinyService, Message, EmotionalAnalysis } from '../services/geminiService';
import { memoryService } from '../lib/memory';
import { cn } from '../lib/utils';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Load messages on mount
  useEffect(() => {
    const saved = memoryService.loadMessages();
    if (saved && saved.length > 0) {
      setMessages(saved);
    }
  }, []);

  // Save messages on update
  useEffect(() => {
    if (messages.length > 0) {
      memoryService.saveMessages(messages);
    }
  }, [messages]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Proactive check-in: analyze emotion in the background if it's a new session or every few messages
      if (messages.length % 5 === 0) {
        destinyService.analyzeEmotion(input)
          .then(emotionalResult => {
            setAnalysis(emotionalResult);
            // We don't force open the sidebar here to avoid jumping UI while user is reading
          })
          .catch(e => console.warn("Emotion analysis failed in background"));
      }

      const response = await destinyService.chat([...messages, userMessage], messages);
      
      const modelMessage: Message = {
        role: 'model',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || "Une erreur est survenue lors de la connexion aux astres.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Voulez-vous vraiment effacer votre mémoire partagée avec Sélénia ?")) {
      setMessages([]);
      localStorage.removeItem('selenia_messages');
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-4xl mx-auto glass rounded-3xl overflow-hidden gold-glow">
      {/* Header */}
      <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-background/50">
        <div>
          <h2 className="text-2xl m-0">Parler à Nacre</h2>
          <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest">La Maîtresse des Destins</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={cn(
              "p-2 rounded-full transition-colors",
              showAnalysis ? "bg-gold text-background" : "hover:bg-gold/10 text-gold"
            )}
          >
            <Brain size={20} />
          </button>
          <button 
            onClick={clearHistory}
            className="p-2 rounded-full hover:bg-gold/10 text-gold transition-colors"
            title="Effacer l'historique"
          >
            <History size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 space-y-4"
                >
                  <Sparkles className="mx-auto text-gold animate-pulse" size={48} />
                  <h3 className="text-3xl font-display text-rose">Bienvenue, chère âme</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Je suis Sélénia. Posez votre question, et laissons les astres et les cartes murmurer votre destin.
                  </p>
                </motion.div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-secondary text-secondary-foreground rounded-tr-none rose-glow" 
                      : "bg-muted text-foreground rounded-tl-none border border-gold/20"
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-muted p-4 rounded-2xl rounded-tl-none border border-gold/20">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                  <div className="bg-rose/10 text-rose border border-rose/30 p-4 rounded-2xl text-xs text-center max-w-md">
                    <p className="font-bold mb-1">Interruption Cosmique</p>
                    <p>{error}</p>
                    {error.includes("API Key") && (
                      <p className="mt-2 text-[10px] opacity-70">Veuillez configurer votre clé API Gemini dans le panneau Secrets.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-background/50 border-t border-gold/20">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Interrogez votre destin..."
                className="w-full bg-muted border border-gold/30 rounded-full py-3 px-6 pr-14 focus:outline-none focus:border-gold transition-colors text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 p-2 bg-gold text-background rounded-full hover:bg-gold/80 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Emotional Analysis Sidebar */}
        <AnimatePresence>
          {showAnalysis && analysis && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gold/20 bg-card/30 overflow-hidden flex flex-col"
            >
              <div className="p-6 space-y-8 overflow-y-auto">
                <div className="space-y-2">
                  <h3 className="text-xl m-0 text-gold">Analyse de l'Âme</h3>
                  <div className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
                    {analysis.vibe}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {analysis.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] uppercase tracking-tighter px-2 py-1 bg-muted rounded border border-silver/20 text-silver">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sparkles size={12} className="text-gold" />
                    Météo des Émotions
                  </h4>
                  <p className="text-xs italic leading-relaxed text-foreground/80">
                    {analysis.weather}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Prescriptions de Bien-être</h4>
                  <div className="space-y-3">
                    {analysis.prescriptions.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-gold/10 hover:border-gold/30 transition-colors group">
                        <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:bg-gold group-hover:text-background transition-colors">
                          {p.icon === 'Heart' && <Heart size={16} />}
                          {p.icon === 'Moon' && <Moon size={16} />}
                          {p.icon === 'Wind' && <Wind size={16} />}
                          {p.icon === 'Brain' && <Brain size={16} />}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground">{p.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
