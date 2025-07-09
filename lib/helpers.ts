import { LocationData, Product, User } from '@/types';
import { USA_LOCATIONS_DATA } from './constants';

export const getInitials = (user: User) => {
	if (user.displayName) {
		return user.displayName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.substring(0, 2);
	}
	return user.email ? user.email[0].toUpperCase() : 'U';
};

// Helper functions for searching USA locations
export const searchLocationsByQuery = (query: string): LocationData[] => {
	const lowerQuery = query.toLowerCase();
	return USA_LOCATIONS_DATA.filter(
		(location) =>
			location.city.toLowerCase().includes(lowerQuery) ||
			location.state.toLowerCase().includes(lowerQuery) ||
			location.displayName.toLowerCase().includes(lowerQuery) ||
			location.zipCodes.some((zip) => zip.includes(query)) ||
			location.neighborhoods.some((neighborhood) => neighborhood.toLowerCase().includes(lowerQuery))
	);
};

export const getAllZipCodes = (): string[] => {
	return USA_LOCATIONS_DATA.flatMap((location) => location.zipCodes);
};

export const getAllNeighborhoods = (): string[] => {
	return USA_LOCATIONS_DATA.flatMap((location) => location.neighborhoods);
};

export const getFilteredProductsByLocation = (products: Product[], location: string | null, minProducts = 3) => {
	if (!location) return products;

	const filteredProducts = products.filter((product) => product?.location === location);

	// If the filtered products are less than min required Products, return all products without filtering
	return filteredProducts.length >= minProducts ? filteredProducts : products;
};

export const sortProductsBasedOnLocation = (products: Product[], location: string | null): Product[] => {
	if (!location) return products;

	return products.sort((a, b) => {
		const aLocation = a.location;
		const bLocation = b.location;

		if (aLocation === location && bLocation !== location) return -1;
		if (bLocation === location && aLocation !== location) return 1;
		return 0;
	});
};
