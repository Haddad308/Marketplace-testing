import { create } from "zustand";

interface TrendingTopicsState {
  categories: { name: string; topics: string[] }[];
  featured: string[];
  setTrendingTopics: (data: {
    categories: { name: string; topics: string[] }[];
    featured: string[];
  }) => void;
  resetTrendingTopics: () => void;
}

export const useTrendingTopics = create<TrendingTopicsState>((set) => ({
  categories: [],
  featured: [],
  setTrendingTopics: (data) => set(data),
  resetTrendingTopics: () =>
    set({
      categories: [],
      featured: [],
    }),
}));
