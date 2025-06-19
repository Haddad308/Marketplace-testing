// stores/viewedProductsStore.ts
import { ViewedProductsState } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useViewedProductsStore = create(
	persist<ViewedProductsState>(
		(set, get) => ({
			viewedProductIds: [],
			markAsViewed: (productId) =>
				set((state) => ({
					viewedProductIds: [...state.viewedProductIds, productId],
				})),
			hasViewed: (productId) => get().viewedProductIds.includes(productId),
		}),
		{
			name: 'viewed-products',
			storage: {
				getItem: (name) => {
					if (typeof window === 'undefined') return null;
					const item = sessionStorage.getItem(name);
					return item ? JSON.parse(item) : null;
				},
				setItem: (name, value) => {
					if (typeof window === 'undefined') return;
					sessionStorage.setItem(name, JSON.stringify(value));
				},
				removeItem: (name) => {
					if (typeof window === 'undefined') return;
					sessionStorage.removeItem(name);
				},
			},
		}
	)
);
