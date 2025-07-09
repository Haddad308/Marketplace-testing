import { PAGE_SIZE, SEARCH_PRODUCTS_PAGE_SIZE } from '@/lib/constants';
import { getFilteredProductsByLocation, sortProductsBasedOnLocation } from '@/lib/helpers';
import { Product } from '@/types';
import {
	collection,
	doc,
	DocumentData,
	getDoc,
	getDocs,
	increment,
	limit,
	orderBy,
	query,
	QueryDocumentSnapshot,
	startAfter,
	updateDoc,
	where,
} from 'firebase/firestore';
import { db } from './firabase';

export async function getProducts() {
	try {
		const snapshot = await getDocs(collection(db, 'products'));
		return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }));
	} catch (error) {
		throw new Error(`Error fetching products: ${error}`);
	}
}

export async function getPaginatedProducts(
	pageSize = PAGE_SIZE,
	startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null
) {
	try {
		let q;

		// Fetch one extra doc to check if more data exists
		const realPageSize = pageSize + 1;

		if (startAfterDoc) {
			q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(realPageSize));
		} else {
			q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(realPageSize));
		}

		const snapshot = await getDocs(q);
		const docs = snapshot.docs;

		// Check if we got more than we need
		const hasMore = docs.length === realPageSize;

		// Return only the pageSize number of docs
		const visibleDocs = hasMore ? docs.slice(0, pageSize) : docs;

		const products = visibleDocs.map((doc) => ({
			id: doc.id,
			...(doc.data() as Omit<Product, 'id'>),
		}));

		return {
			products,
			lastVisible: visibleDocs[visibleDocs.length - 1] ?? null,
			hasMore,
		};
	} catch (error) {
		throw new Error(`Error fetching products: ${error}`);
	}
}

export async function getPaginatedProductsBasedOnLocation({
	pageSize,
	location,
	locationStartAfter,
	fallbackStartAfter,
	hasMoreLocation,
	hasMoreFallback = false,
}: {
	pageSize: number;
	location: string;
	locationStartAfter: QueryDocumentSnapshot<DocumentData> | null;
	fallbackStartAfter: QueryDocumentSnapshot<DocumentData> | null;
	hasMoreLocation: boolean;
	hasMoreFallback?: boolean;
}) {
	try {
		let finalDocs: QueryDocumentSnapshot<DocumentData>[] = [];

		// 1. Try to get location-matched products if we still have any
		if (hasMoreLocation) {
			const locationQuery = query(
				collection(db, 'products'),
				where('location', '==', location),
				orderBy('createdAt', 'desc'),
				...(locationStartAfter ? [startAfter(locationStartAfter)] : []),
				limit(pageSize + 1)
			);

			const locationSnap = await getDocs(locationQuery);
			const locationDocs = locationSnap.docs;

			hasMoreLocation = locationDocs.length >= pageSize + 1;
			finalDocs = locationDocs.slice(0, pageSize);
			locationStartAfter = finalDocs.length > 0 ? finalDocs[finalDocs.length - 1] : null;

			if (finalDocs.length === pageSize) {
				return {
					products: finalDocs.map((doc) => ({
						id: doc.id,
						...(doc.data() as Omit<Product, 'id'>),
					})),
					locationLastVisible: locationStartAfter,
					fallbackLastVisible: fallbackStartAfter,
					hasMoreLocation,
					hasMoreFallback,
				};
			}
		}

		// 2. Fallback to non-location products
		const fallbackLimit = pageSize - finalDocs.length;
		const nonLocationQuery = query(
			collection(db, 'products'),
			orderBy('createdAt', 'desc'),
			...(fallbackStartAfter ? [startAfter(fallbackStartAfter)] : []),
			limit(fallbackLimit + 10 * pageSize) // Fetch more than needed to ensure we have enough fallback products
		);

		const nonLocationSnap = await getDocs(nonLocationQuery);

		const filtered = nonLocationSnap.docs.filter((doc) => doc.data().location !== location);

		hasMoreFallback = filtered.length >= fallbackLimit + 1;

		const fallbackDocs = filtered.slice(0, fallbackLimit);
		fallbackStartAfter = fallbackDocs.length > 0 ? fallbackDocs[fallbackDocs.length - 1] : fallbackStartAfter;

		finalDocs = [...finalDocs, ...fallbackDocs];

		return {
			products: finalDocs.map((doc) => ({
				id: doc.id,
				...(doc.data() as Omit<Product, 'id'>),
			})),
			locationLastVisible: locationStartAfter,
			fallbackLastVisible: fallbackStartAfter,
			hasMoreLocation,
			hasMoreFallback,
		};
	} catch (error) {
		throw new Error(`Error fetching location-based products: ${error}`);
	}
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
	try {
		const products = await Promise.all(
			ids.map(async (id) => {
				const docRef = doc(db, 'products', id);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					return { id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) } as Product;
				}
				return null;
			})
		);
		return products.filter((product): product is Product => product !== null);
	} catch (error) {
		throw new Error(`Error fetching products by IDs: ${error}`);
	}
}

export async function getProductById(id: string) {
	try {
		const productRef = doc(db, 'products', id);
		const productSnap = await getDoc(productRef);

		if (!productSnap.exists()) {
			return null;
		}

		return {
			id: productSnap.id,
			...productSnap.data(),
		} as Product;
	} catch (error) {
		throw new Error(`Error fetching product: ${error}`);
	}
}

export async function getPopularProducts(limit: number = 3, location: string | null) {
	try {
		const productsRef = collection(db, 'products');
		const snapshot = await getDocs(productsRef);
		const products = snapshot.docs
			.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }))
			.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));

		// Filter products based on location
		const filteredProducts = getFilteredProductsByLocation(products, location).slice(0, limit);
		return filteredProducts;
	} catch (error) {
		throw new Error(`Error fetching popular products: ${error}`);
	}
}

export async function searchProducts(query: string, limit = SEARCH_PRODUCTS_PAGE_SIZE, location: string | null = null) {
	try {
		const productsRef = collection(db, 'products');
		const snapshot = await getDocs(productsRef);
		const lowerQuery = query.toLowerCase();
		const products = lowerQuery
			? snapshot.docs
					.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }))
					.filter(
						(product) =>
							product.title?.toLowerCase().includes(lowerQuery) || product.business?.toLowerCase().includes(lowerQuery)
					)
			: snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }));

		const sortedProducts = sortProductsBasedOnLocation(products, location);

		return sortedProducts.slice(0, limit);
	} catch (error) {
		throw new Error(`Error searching products: ${error}`);
	}
}

export async function incrementProductView(productId: string) {
	try {
		const productRef = doc(db, 'products', productId);
		await updateDoc(productRef, {
			views: increment(1),
		});
	} catch (error) {
		throw new Error(`Error incrementing product views: ${error}`);
	}
}
