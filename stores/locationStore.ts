import { LocationState } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
	persist<LocationState>(
		(set) => ({
			location: '',
			setLocation: (location: string) => set({ location }),
		}),
		{
			name: 'location-store',
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
