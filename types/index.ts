export type Product = {
	id: string;
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
};
