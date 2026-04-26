export interface DrawRecord {
  deck: string;
  cardName: string;
  timestamp: number;
}

const MEMORY_KEYS = {
  DRAWS: 'selenia_draws',
  MESSAGES: 'selenia_messages',
};

export const memoryService = {
  // Card Draws
  recordDraw(deck: string, cardName: string) {
    const draws = this.getDraws();
    draws.push({ deck, cardName, timestamp: Date.now() });
    // Keep only last 100 draws
    const refined = draws.slice(-100);
    localStorage.setItem(MEMORY_KEYS.DRAWS, JSON.stringify(refined));
  },

  getDraws(): DrawRecord[] {
    const data = localStorage.getItem(MEMORY_KEYS.DRAWS);
    return data ? JSON.parse(data) : [];
  },

  getFrequentCards() {
    const draws = this.getDraws();
    const stats: Record<string, number> = {};
    draws.forEach(d => {
      const key = `${d.cardName} (${d.deck})`;
      stats[key] = (stats[key] || 0) + 1;
    });

    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => `${name} (apparu ${count} fois)`)
      .join(', ');
  },

  // Chat Messages
  saveMessages(messages: any[]) {
    localStorage.setItem(MEMORY_KEYS.MESSAGES, JSON.stringify(messages.slice(-50)));
  },

  loadMessages(): any[] {
    const data = localStorage.getItem(MEMORY_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  }
};
