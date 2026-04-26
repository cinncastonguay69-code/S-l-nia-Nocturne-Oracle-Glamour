import { GoogleGenAI, Type } from "@google/genai";
import { memoryService } from "../lib/memory";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const checkApiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing. Please set it in the AI Studio Secrets panel.");
    return false;
  }
  return true;
};

const SYSTEM_INSTRUCTION = `
Tu es "La Maîtresse des Destins", une conseillère spirituelle sophistiquée et empathique. 
Ton rôle est d'allier le Glamour Français à la profondeur ancestrale du Tarot, de l'Astrologie et de la Numérologie.
Tu t'exprimes avec une élégance poétique, une empathie profonde et une précision technique irréprochable.

Identité :
- Nom : Sélénia Nocturne.
- Ton : Bienveillant, poétique, profond, sophistiqué, "Glam Nocturne".
- Langue : Français impeccable et littéraire.

Missions :
1. Interpréter le "Triangle d'Or" (Astrologie, Tarot, Numérologie) de manière croisée.
2. Analyser les émotions de l'utilisatrice avec finesse.
3. Proposer des rituels "Glamour" et des actions concrètes.
4. Se souvenir des interactions passées pour une guidance évolutive.

Structure des réponses :
- Introduction : Accueil chaleureux et mystique (ex: "Sous la douce lueur de cette lune croissante...").
- Analyse Profonde : Développer les sentiments, les non-dits, les courants énergétiques.
- Synthèse Harmonique : Ponts entre Tarot, Numérologie et Astrologie.
- Conclusion : Conseil final "Glamour" (action concrète et élégante).
- Rappel Lunaire : Un mot sur la phase de la lune actuelle.

Jeux de cartes à ta disposition :
- Tarot de Marseille (Symbolisme, Archétypes).
- Rider-Waite-Smith (Narratif, Émotions).
- Petit Lenormand (Pragmatique, Relations).
- Oracle des Animaux (Chamanique, Instinct).
- Oracle Triade (Corps, Âme, Esprit).
- Oracle de la Lumière (Éveil, Guérison).

Tu dois toujours souligner les répétitions de cartes ou de thèmes sur les 30 derniers jours si l'historique te le permet.
`;

export interface Message {
  role: "user" | "model";
  content: string;
  timestamp: number;
}

export interface EmotionalAnalysis {
  vibe: string;
  tags: string[];
  weather: string;
  prescriptions: {
    title: string;
    duration: string;
    icon: string;
  }[];
}

const WITH_RETRY_AND_TIMEOUT = async <T>(operation: () => Promise<T>, retries: number = 2, timeoutMs: number = 30000): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Les courants cosmiques sont trop denses. (Délai d'attente dépassé)")), timeoutMs);
      });
      return await Promise.race([operation(), timeoutPromise]) as T;
    } catch (error) {
      lastError = error;
      console.warn(`Retry ${i + 1}/${retries} failed:`, error);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
};

export const destinyService = {
  async chat(messages: Message[], history: any[] = []) {
    if (!checkApiKey()) throw new Error("API Key missing");
    
    const now = new Date();
    const contextStr = `\n[CONTEXTE ACTUEL] Date: ${now.toLocaleDateString('fr-FR')} | Heure: ${now.toLocaleTimeString('fr-FR')} | Lieu: Paris (Vibe Nocturne) | Cartes Marquantes de l'utilisatrice: ${memoryService.getFrequentCards() || "Aucune encore"}\n`;

    return WITH_RETRY_AND_TIMEOUT(async () => {
      const chat = ai.chats.create({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + contextStr,
        },
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
        }))
      });

      const result = await chat.sendMessage({
        message: messages[messages.length - 1].content
      });

      return result.text;
    });
  },

  async interpretCard(deck: string, cardName: string, context: string = "") {
    if (!checkApiKey()) throw new Error("API Key missing");

    const now = new Date();
    const contextStr = `\n[MÉMOIRE] Date: ${now.toLocaleDateString('fr-FR')} | Heure: ${now.toLocaleTimeString('fr-FR')} | Cartes récurrentes: ${memoryService.getFrequentCards()}\n`;

    return WITH_RETRY_AND_TIMEOUT(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `${contextStr}Interprète le tirage suivant : Jeu "${deck}", Carte "${cardName}". Contexte : ${context}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + "\nDonne une interprétation poétique et profonde (3-4 phrases). Mentionne si cette carte est récurrente pour elle si c'est le cas.",
        }
      });

      return response.text;
    }).catch(error => {
      console.error("Interpret Card Error:", error);
      return "Les astres sont voilés ce soir, mais leur message de bienveillance demeure.";
    });
  },

  async calculateSilkNumber(birthDate: string) {
    if (!checkApiKey()) throw new Error("API Key missing");

    return WITH_RETRY_AND_TIMEOUT(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Calcule le "Chiffre de Soie" (opportunité numérologique flash) pour une personne née le ${birthDate}.`,
        config: {
          systemInstruction: "Tu es l'expert en numérologie de Sélénia. Retourne un JSON avec 'number' (le chiffre calculé), 'meaning' (une phrase poétique) et 'opportunity' (une action concrète).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              number: { type: Type.NUMBER },
              meaning: { type: Type.STRING },
              opportunity: { type: Type.STRING }
            },
            required: ["number", "meaning", "opportunity"]
          }
        }
      });

      return JSON.parse(response.text);
    });
  },

  async analyzeEmotion(input: string): Promise<EmotionalAnalysis> {
    return WITH_RETRY_AND_TIMEOUT(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Analyse l'état émotionnel suivant et retourne un JSON structuré : "${input}"`,
        config: {
          systemInstruction: "Tu es le moteur d'analyse émotionnelle de Sélénia. Analyse l'état d'esprit et retourne un JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vibe: { type: Type.STRING, description: "Vibe énergétique (ex: Énergie Équilibrée)" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 mots-clés dynamiques" },
              weather: { type: Type.STRING, description: "La météo des émotions (court texte narratif)" },
              prescriptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    icon: { type: Type.STRING, description: "Nom d'icône Lucide (ex: Heart, Moon, Wind)" }
                  },
                  required: ["title", "duration", "icon"]
                }
              }
            },
            required: ["vibe", "tags", "weather", "prescriptions"]
          }
        }
      });

      return JSON.parse(response.text);
    }, 1, 15000).catch(error => {
      console.error("Emotion Analysis Error:", error);
      return {
        vibe: "Énergie Mystérieuse",
        tags: ["Introspection", "Silence", "Astre", "Nuit"],
        weather: "Le ciel est nébuleux, invitant à une écoute attentive de votre propre voix intérieure.",
        prescriptions: [
          { title: "Contemplation Nocturne", duration: "10 min", icon: "Moon" },
          { title: "Respiration Cristalline", duration: "5 min", icon: "Wind" }
        ]
      };
    });
  }
};
