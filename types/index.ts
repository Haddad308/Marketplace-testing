import { User as FirebaseAuthUser } from 'firebase/auth';

export type Product = {
	id: string;
	merchantId: string;
	isArchived?: boolean;
	views: number;
	title: string;
	business: string;
	category: string;
	image: string;
	originalPrice: number;
	discountedPrice: number;
	discountPercentage: number;
	rating: number;
	reviewCount: number;
	location: string;
	distance: string;
	isPopular: boolean;
	redirectLink: string;
	badge?: string;
	createdAt: any;
	updatedAt: any;
};

export interface User extends FirebaseAuthUser {
	id?: string;
	wishlist?: string[];
	role: 'admin' | 'merchant' | 'user';
	permissions?: permission[];
	createdAt?: any;
}

export type permission = 'add' | 'edit' | 'delete';

export interface PaginatedUsers {
	users: User[];
	hasMore: boolean;
	lastDoc: any;
}

export type UserData = {
	wishlist: string[];
	role: string;
	permissions: Array<'add' | 'edit' | 'delete'>;
};

export interface CategoryInfo {
	name?: string;
	icon: string;
	description: string;
	color: string;
}

export interface ProductFormData {
	title: string;
	business: string;
	category: string;
	image: File | string | null;
	originalPrice: number;
	discountedPrice: number;
	discountPercentage: number;
	location: string;
	distance: string;
	redirectLink: string;
	badge?: string;
}

export interface ViewedProductsState {
	viewedProductIds: string[];
	markAsViewed: (productId: string) => void;
	hasViewed: (productId: string) => boolean;
}
