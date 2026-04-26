import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Moon, Sun, Compass, Sparkles, Layout, Calendar, Loader2, Quote, History as HistoryIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { destinyService } from '../services/geminiService';
import { memoryService } from '../lib/memory';

interface Card {
  id: string;
  name: string;
  meaning: string;
  image: string;
}

const DECKS = [
  { id: 'tarot', name: 'Tarot de Marseille', icon: '🔮' },
  { id: 'lenormand', name: 'Petit Lenormand', icon: '🃏' },
  { id: 'triade', name: 'Oracle Triade', icon: '📐' },
  { id: 'animals', name: 'Oracle des Animaux', icon: '🐾' },
];

const TAROT_CARDS_MOCK: Card[] = [
  { id: '1', name: 'Le Bateleur', meaning: 'Nouveaux départs, potentiel, action.', image: 'https://picsum.photos/seed/magician/600/800' },
  { id: '2', name: 'La Papesse', meaning: 'Intuition, mystère, sagesse intérieure.', image: 'https://picsum.photos/seed/priestess/600/800' },
  { id: '3', name: "L'Impératrice", meaning: 'Féminité, créativité, abondance.', image: 'https://picsum.photos/seed/empress/600/800' },
  { id: '4', name: "L'Empereur", meaning: 'Structure, autorité, stabilité.', image: 'https://picsum.photos/seed/emperor/600/800' },
  { id: '5', name: 'Le Pape', meaning: 'Tradition, conseil, spiritualité.', image: 'https://picsum.photos/seed/hierophant/600/800' },
  { id: '6', name: "L'Amoureux", meaning: 'Choix, relations, harmonie.', image: 'https://picsum.photos/seed/lovers/600/800' },
  { id: '7', name: 'Le Chariot', meaning: 'Détermination, victoire, voyage.', image: 'https://picsum.photos/seed/chariot/600/800' },
  { id: '8', name: 'La Justice', meaning: 'Équilibre, vérité, loi.', image: 'https://picsum.photos/seed/justice/600/800' },
  { id: '9', name: "L'Ermite", meaning: 'Introspection, solitude, guidage.', image: 'https://picsum.photos/seed/hermit/600/800' },
  { id: '10', name: 'La Roue de Fortune', meaning: 'Cycles, changement, destin.', image: 'https://picsum.photos/seed/wheel/600/800' },
];

const MOCK_CARDS: Record<string, Card[]> = {
  tarot: TAROT_CARDS_MOCK,
  lenormand: [
    { id: 'l1', name: 'Le Cavalier', meaning: 'Nouvelles, arrivées, mouvement.', image: 'https://picsum.photos/seed/rider/300/500' },
    { id: 'l2', name: 'Le Trèfle', meaning: 'Chance éphémère, opportunité.', image: 'https://picsum.photos/seed/clover/300/500' },
    { id: 'l3', name: 'Le Vaisseau', meaning: 'Voyage, commerce, distance.', image: 'https://picsum.photos/seed/ship/300/500' },
  ],
  triade: [
    { id: 't1', name: 'Alpha', meaning: 'Commencement, renouveau.', image: 'https://picsum.photos/seed/alpha/300/500' },
    { id: 't2', name: 'Isolement', meaning: 'Retrait, solitude nécessaire.', image: 'https://picsum.photos/seed/isolation/300/500' },
  ],
  animals: [
    { id: 'a1', name: 'Le Loup', meaning: 'Loyauté, instinct, enseignant.', image: 'https://picsum.photos/seed/wolf/300/500' },
    { id: 'a2', name: "L'Aigle", meaning: 'Vision, liberté, connexion divine.', image: 'https://picsum.photos/seed/eagle/300/500' },
  ]
};

export const OracleSection: React.FC = () => {
  const [selectedDeck, setSelectedDeck] = useState('tarot');
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);

  // Card of the Day
  const [cardOfDay, setCardOfDay] = useState<Card | null>(null);
  const [cardOfDayInterpretation, setCardOfDayInterpretation] = useState<string | null>(null);
  const [isLoadingCardOfDay, setIsLoadingCardOfDay] = useState(true);

  // Numerology state
  const [birthDate, setBirthDate] = useState('');
  const [silkNumber, setSilkNumber] = useState<{ number: number; meaning: string; opportunity: string } | null>(null);
  const [isCalculatingSilk, setIsCalculatingSilk] = useState(false);

  useEffect(() => {
    const initCardOfDay = async () => {
      // Deterministic selection based on date
      const today = new Date().toISOString().split('T')[0];
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % TAROT_CARDS_MOCK.length;
      const card = TAROT_CARDS_MOCK[index];
      setCardOfDay(card);
      memoryService.recordDraw('Tarot de Marseille (Quotidien)', card.name);

      try {
        const interpretation = await destinyService.interpretCard('Tarot de Marseille', card.name, "Carte du jour pour une guidance quotidienne.");
        setCardOfDayInterpretation(interpretation);
      } catch (error) {
        console.error("Failed to fetch card of the day interpretation:", error);
      } finally {
        setIsLoadingCardOfDay(false);
      }
    };

    initCardOfDay();
  }, []);

  const drawCard = async () => {
    setIsDrawing(true);
    setDrawnCard(null);
    setAiInterpretation(null);
    
    setTimeout(async () => {
      try {
        const deckCards = MOCK_CARDS[selectedDeck] || MOCK_CARDS.tarot;
        if (!deckCards || deckCards.length === 0) {
          throw new Error("Jeu de cartes indisponible");
        }
        const randomIndex = Math.floor(Math.random() * deckCards.length);
        const card = deckCards[randomIndex];
        setDrawnCard(card);
        setIsDrawing(false);
        memoryService.recordDraw(selectedDeck, card.name);

        // Get AI interpretation
        setIsInterpreting(true);
        const interpretation = await destinyService.interpretCard(selectedDeck, card.name);
        setAiInterpretation(interpretation);
      } catch (error) {
        console.error("Erreur lors du tirage ou de l'interprétation:", error);
        setIsDrawing(false);
      } finally {
        setIsInterpreting(false);
      }
    }, 1500);
  };

  const handleSilkCalculation = async () => {
    if (!birthDate) return;
    setIsCalculatingSilk(true);
    try {
      const result = await destinyService.calculateSilkNumber(birthDate);
      setSilkNumber(result);
    } catch (error) {
      console.error("Silk calculation error:", error);
    } finally {
      setIsCalculatingSilk(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-12 pb-24">
      {/* Card of the Day Hero */}
      <section className="relative overflow-hidden rounded-[3rem] border border-gold/30 gold-glow bg-card/40">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-rose/10 pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} />
              La Carte du Jour
            </div>
            
            <AnimatePresence mode='wait'>
              {isLoadingCardOfDay ? (
                <div key="loading" className="space-y-4 animate-pulse">
                  <div className="h-12 bg-gold/10 rounded-lg w-3/4" />
                  <div className="h-6 bg-gold/5 rounded-lg w-1/2" />
                  <div className="space-y-2 pt-4">
                    <div className="h-4 bg-white/5 rounded-lg w-full" />
                    <div className="h-4 bg-white/5 rounded-lg w-full" />
                    <div className="h-4 bg-white/5 rounded-lg w-2/3" />
                  </div>
                </div>
              ) : cardOfDay && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h1 className="text-5xl sm:text-7xl m-0 text-rose font-display">{cardOfDay.name}</h1>
                  <p className="text-xl sm:text-2xl text-gold italic font-body">"{cardOfDay.meaning}"</p>
                  
                  <div className="relative group">
                    <Quote className="absolute -top-4 -left-4 text-gold/20" size={48} />
                    <div className="pl-6 border-l-2 border-gold/30">
                      <p className="text-lg leading-relaxed text-foreground/90 italic">
                        {cardOfDayInterpretation || "Les astres murmurent une guidance secrète pour vous aujourd'hui..."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-center">
            {cardOfDay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="w-64 h-[28rem] rounded-3xl overflow-hidden border-2 border-gold/50 gold-glow relative group cursor-help"
              >
                <img 
                  src={cardOfDay.image} 
                  alt={cardOfDay.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <p className="text-xs text-gold uppercase tracking-widest font-bold">Tarot de Marseille</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Triangle d'Or Header */}
      <div className="text-center space-y-4 pt-12">
        <h2 className="text-5xl">Le Sanctuaire des Oracles</h2>
        <p className="text-muted-foreground font-sans uppercase tracking-[0.3em] text-xs">Explorez les profondeurs de votre destin</p>
      </div>

      {/* Deck Selection */}
      <div className="flex justify-center gap-4 overflow-x-auto pb-4 scrollbar-hide px-4">
        {DECKS.map((deck) => (
          <button
            key={deck.id}
            onClick={() => setSelectedDeck(deck.id)}
            className={cn(
              "px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap",
              selectedDeck === deck.id 
                ? "bg-gold/20 border-gold text-gold gold-glow" 
                : "bg-muted/50 border-gold/10 text-muted-foreground hover:border-gold/30"
            )}
          >
            <span>{deck.icon}</span>
            <span className="text-xs font-sans font-bold uppercase tracking-widest">{deck.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        {/* Astrology Card */}
        <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-3xl border-gold/20 gold-glow space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gold/10 text-gold">
              <Compass size={24} />
            </div>
            <h3 className="text-2xl m-0">Astrologie</h3>
          </div>
          <div className="space-y-4 font-sans">
            <div className="p-4 rounded-xl bg-background/40 border border-gold/10">
              <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Transit Actuel</p>
              <p className="text-sm font-medium">Mars en Bélier ♈</p>
              <p className="text-xs text-muted-foreground mt-2">Votre énergie physique est au sommet. Préparez-vous à l'action.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/40 border border-gold/10">
              <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Phase Lunaire</p>
              <p className="text-sm font-medium">Lune Croissante 🌙</p>
              <p className="text-xs text-muted-foreground mt-2">Moment idéal pour manifester vos intentions.</p>
            </div>
          </div>
        </motion.div>

        {/* Tarot Card (Interactive) */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-8">
          <div className="relative w-64 h-96">
            <AnimatePresence mode="wait">
              {isDrawing ? (
                <motion.div
                  key="drawing"
                  animate={{ rotateY: [0, 360, 720] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="w-full h-full bg-gold/10 border-2 border-gold/50 rounded-2xl flex items-center justify-center p-6 text-center"
                >
                  <div className="space-y-4">
                    <Sparkles className="text-gold animate-pulse mx-auto" size={48} />
                    <p className="text-[10px] uppercase tracking-widest text-gold animate-pulse">Consultation des Astres...</p>
                  </div>
                </motion.div>
              ) : drawnCard ? (
                <motion.div
                  key="card"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  className="w-full h-full glass rounded-2xl overflow-hidden border-2 border-gold/50 gold-glow relative group"
                >
                  <img 
                    src={drawnCard.image} 
                    alt={drawnCard.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent p-6 flex flex-col justify-end">
                    <h4 className="text-2xl text-gold m-0">{drawnCard.name}</h4>
                    <p className="text-xs text-foreground/90 mt-2 font-sans">{drawnCard.meaning}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="w-full h-full bg-muted border-2 border-dashed border-gold/30 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-4"
                >
                  <Layout className="text-gold/30" size={48} />
                  <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest">Tirez une carte pour éclairer votre chemin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={drawCard}
            disabled={isDrawing}
            className="px-8 py-3 bg-gold text-background rounded-full font-sans font-bold uppercase tracking-widest hover:bg-gold/80 transition-all gold-glow disabled:opacity-50"
          >
            {drawnCard ? "Nouveau Tirage" : "Tirer une Carte"}
          </button>
        </div>

        {/* Numerology Card */}
        <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-3xl border-gold/20 gold-glow space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-rose/10 text-rose">
              <Star size={24} />
            </div>
            <h3 className="text-2xl m-0">Numérologie</h3>
          </div>
          <div className="space-y-4 font-sans">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Date de Naissance</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="flex-1 bg-background/40 border border-rose/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose transition-colors"
                />
                <button 
                  onClick={handleSilkCalculation}
                  disabled={!birthDate || isCalculatingSilk}
                  className="p-2 bg-rose text-white rounded-xl hover:bg-rose/80 transition-colors disabled:opacity-50"
                >
                  {isCalculatingSilk ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                </button>
              </div>
            </div>

            {silkNumber ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-rose/10 border border-rose/30 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <p className="text-[10px] uppercase tracking-widest text-rose">Le Chiffre de Soie</p>
                  <span className="text-2xl font-display text-rose">{silkNumber.number}</span>
                </div>
                <p className="text-xs italic text-foreground/80">{silkNumber.meaning}</p>
                <div className="pt-2 border-t border-rose/10">
                  <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">Opportunité :</p>
                  <p className="text-[11px] font-medium">{silkNumber.opportunity}</p>
                </div>
              </motion.div>
            ) : (
              <div className="p-4 rounded-xl bg-background/40 border border-rose/10">
                <p className="text-xs text-muted-foreground italic">Entrez votre date de naissance pour débloquer votre Chiffre de Soie.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Synergie Extraordinaire & AI Interpretation */}
      <AnimatePresence>
        {drawnCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-3xl border-gold/30 gold-glow bg-gradient-to-r from-gold/5 to-rose/5 space-y-6 mx-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="text-gold" />
                <h3 className="text-3xl m-0">L'Écho des Étoiles</h3>
              </div>
              {isInterpreting && <Loader2 className="animate-spin text-gold" size={24} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Interprétation de Sélénia</h4>
                {aiInterpretation ? (
                  <p className="text-lg italic leading-relaxed">
                    {aiInterpretation}
                  </p>
                ) : (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gold/10 rounded w-full" />
                    <div className="h-4 bg-gold/10 rounded w-5/6" />
                    <div className="h-4 bg-gold/10 rounded w-4/6" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Validation Cosmique</h4>
                <p className="text-sm leading-relaxed text-foreground/80">
                  Votre tirage du jour, combiné à la <span className="text-gold">Lune Croissante</span> et à l'influence de <span className="text-gold">Mars</span>, 
                  indique une période de transformation profonde. {silkNumber && `Votre Chiffre de Soie ${silkNumber.number} renforce cette vibration de renouveau.`}
                </p>
                {memoryService.getDraws().length > 2 && (
                  <div className="pt-4 border-t border-gold/10">
                    <p className="text-[10px] uppercase tracking-widest text-gold/60 mb-2 flex items-center gap-2">
                       <HistoryIcon size={10} /> Mémoire du Sanctuaire
                    </p>
                    <p className="text-[11px] italic text-muted-foreground">
                      Sélénia a remarqué que vos énergies sont souvent capturées par : {memoryService.getFrequentCards()}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
