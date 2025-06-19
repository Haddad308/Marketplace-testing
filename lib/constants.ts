import { CategoryInfo } from '@/types';

export const PAGE_SIZE = 3;

export const categoryMetadata: Record<string, CategoryInfo> = {
	'beauty-and-spas': {
		name: 'Beauty & Spas',
		icon: '💄',
		description: 'Pamper yourself with spa treatments, massages, and beauty services',
		color: 'from-pink-500 to-rose-500',
	},
	'things-to-do': {
		name: 'Things To Do',
		icon: '🎯',
		description: 'Exciting activities, entertainment, and experiences',
		color: 'from-blue-500 to-cyan-500',
	},
	'health-and-fitness': {
		name: 'Health & Fitness',
		icon: '🎯',
		description: 'Exciting activities, entertainment, and experiences',
		color: 'from-blue-500 to-cyan-500',
	},
	'auto-and-home': {
		name: 'Auto & Home',
		icon: '🏠',
		description: 'Home improvement, automotive services, and maintenance',
		color: 'from-green-500 to-emerald-500',
	},
	'food-and-drink': {
		name: 'Food & Drink',
		icon: '🍕',
		description: 'Restaurants, cafes, bars, and culinary experiences',
		color: 'from-orange-500 to-red-500',
	},
	gifts: {
		name: 'Gifts',
		icon: '🎁',
		description: 'Perfect gifts for every occasion and special someone',
		color: 'from-purple-500 to-pink-500',
	},
	local: {
		name: 'Local',
		icon: '📍',
		description: 'Discover local businesses and community services',
		color: 'from-indigo-500 to-purple-500',
	},
	travel: {
		name: 'Travel',
		icon: '✈️',
		description: 'Hotels, flights, tours, and travel experiences',
		color: 'from-teal-500 to-blue-500',
	},
	goods: {
		name: 'Goods',
		icon: '🛍️',
		description: 'Shopping deals on products and merchandise',
		color: 'from-yellow-500 to-orange-500',
	},
	coupons: {
		name: 'Coupons',
		icon: '🎫',
		description: 'Digital coupons and promotional codes',
		color: 'from-red-500 to-pink-500',
	},
};

export const categories = [
	{ name: 'Beauty & Spas', icon: '💄' },
	{ name: 'Things To Do', icon: '🎯' },
	{ name: 'Auto & Home', icon: '🏠' },
	{ name: 'Food & Drink', icon: '🍽️' },
	{ name: 'Gifts', icon: '🎁' },
	{ name: 'Local', icon: '📍' },
	{ name: 'Travel', icon: '✈️' },
	{ name: 'Goods', icon: '🛍️' },
	{ name: 'Coupons', icon: '🎫' },
];
