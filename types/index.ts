import { User as FirebaseAuthUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

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
	createdAt: Timestamp | any;
	updatedAt: Timestamp | any;
	isArchived?: boolean;
	views?: number;
	actionButtons?: ActionButton[];
};

export type ActionButton = {
	id: string;
	label: string;
	url: string;
	style: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
	icon?: string;
	isActive: boolean;
	order: number;
};

export type MerchantDetails = {
	id: string;
	name: string;
	description: string;
	address: string;
	phone: string;
	email: string;
	website?: string;
	logo?: string;
	createdAt: Timestamp | any;
	updatedAt: Timestamp | any;
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

export interface DateRange {
	from?: Date;
	to?: Date;
}

export interface Ad {
	id: string;
	title: string;
	description: string;
	image: string;
	affiliateLink: string;
	position: 1 | 2;
	isActive: boolean;
	createdAt: any;
	updatedAt: any;
}

export interface AdFormData {
	title: string;
	description: string;
	image: File | string | null;
	affiliateLink: string;
	position: 1 | 2;
	isActive: boolean;
}

export interface AdFormErrors {
	title?: string;
	image?: string;
	description?: string;
	affiliateLink?: string;
	submit?: string;
}

export interface AdTouchedFields {
	title: boolean;
	image: boolean;
	description: boolean;
	affiliateLink: boolean;
}

export interface LocationData {
	city: string;
	state: string;
	zipCodes: string[];
	neighborhoods: string[];
	displayName: string;
}

export interface LocationState {
	location: string;
	setLocation: (location: string) => void;
}
