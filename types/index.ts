import { User as FirebaseAuthUser } from 'firebase/auth';

export type Product = {
	id: string;
	title: string;
	business: string;
	category: string;
	image: string;
	originalPrice: number;
	discountedPrice?: number;
	discountPercentage?: number;
	location: string;
	phone: string;
	description: string;
	affiliateLink: string;
	badge?: string;
	merchantId: string;
	createdAt: any;
	updatedAt: any;
	isArchived?: boolean;
	views?: number;
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
	image: File | null;
	originalPrice: number;
	discountedPrice?: number;
	discountPercentage?: number;
	location: string;
	phone: string;
	description: string;
	affiliateLink: string;
	badge?: string;
}

export interface FormErrors {
	title?: string;
	business?: string;
	category?: string;
	image?: string;
	originalPrice?: string;
	discountedPrice?: string;
	location?: string;
	phone?: string;
	description?: string;
	affiliateLink?: string;
	submit?: string;
}

export interface TouchedFields {
	title: boolean;
	business: boolean;
	category: boolean;
	image: boolean;
	originalPrice: boolean;
	discountedPrice: boolean;
	location: boolean;
	phone: boolean;
	description: boolean;
	affiliateLink: boolean;
}

export interface ViewedProductsState {
	viewedProductIds: string[];
	markAsViewed: (productId: string) => void;
	hasViewed: (productId: string) => boolean;
}
