import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Deck, Flashcard } from '../types';

function calculateSM2(quality: number, easeFactor: number, interval: number) {
  let newEase = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEase = Math.max(1.3, newEase);
  let newInterval: number;
  if (quality < 3) {
    newInterval = 0;
  } else if (interval === 0) {
    newInterval = 1;
  } else if (interval === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEase);
  }
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  return { ease_factor: newEase, interval: newInterval, next_review: nextReview.toISOString() };
}

type FlashcardsState = {
  decks: Deck[];
  cards: Map<string, Flashcard[]>;
  isLoading: boolean;
  fetchDecks: (userId: string) => Promise<void>;
  fetchCards: (deckId: string) => Promise<void>;
  addDeck: (deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  addCard: (card: Omit<Flashcard, 'id' | 'created_at' | 'updated_at' | 'ease_factor' | 'interval' | 'next_review'>) => Promise<void>;
  deleteCard: (id: string, deckId: string) => Promise<void>;
  reviewCard: (id: string, quality: number) => Promise<void>;
};

export const useFlashcardsStore = create<FlashcardsState>((set, get) => ({
  decks: [],
  cards: new Map(),
  isLoading: false,
  fetchDecks: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) set({ decks: data });
    set({ isLoading: false });
  },
  fetchCards: async (deckId) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      const newCards = new Map(get().cards);
      newCards.set(deckId, data);
      set({ cards: newCards });
    }
  },
  addDeck: async (deck) => {
    const { data, error } = await supabase.from('decks').insert(deck).select().single();
    if (!error && data) set({ decks: [data, ...get().decks] });
  },
  deleteDeck: async (id) => {
    const { error } = await supabase.from('decks').delete().eq('id', id);
    if (!error) {
      const newCards = new Map(get().cards);
      newCards.delete(id);
      set({ decks: get().decks.filter((d) => d.id !== id), cards: newCards });
    }
  },
  addCard: async (card) => {
    const { data, error } = await supabase
      .from('flashcards')
      .insert({ ...card, ease_factor: 2.5, interval: 0, next_review: null })
      .select()
      .single();
    if (!error && data) {
      const newCards = new Map(get().cards);
      const existing = newCards.get(card.deck_id) ?? [];
      newCards.set(card.deck_id, [...existing, data]);
      set({ cards: newCards });
    }
  },
  deleteCard: async (id, deckId) => {
    const { error } = await supabase.from('flashcards').delete().eq('id', id);
    if (!error) {
      const newCards = new Map(get().cards);
      const existing = newCards.get(deckId) ?? [];
      newCards.set(deckId, existing.filter((c) => c.id !== id));
      set({ cards: newCards });
    }
  },
  reviewCard: async (id, quality) => {
    // Find the card across all decks
    let card: Flashcard | undefined;
    let deckId = '';
    for (const [dId, cards] of get().cards) {
      card = cards.find((c) => c.id === id);
      if (card) { deckId = dId; break; }
    }
    if (!card) return;

    const result = calculateSM2(quality, card.ease_factor, card.interval);
    const { data, error } = await supabase
      .from('flashcards')
      .update({ ...result, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      const newCards = new Map(get().cards);
      const existing = newCards.get(deckId) ?? [];
      newCards.set(deckId, existing.map((c) => (c.id === id ? data : c)));
      set({ cards: newCards });
    }
  },
}));
