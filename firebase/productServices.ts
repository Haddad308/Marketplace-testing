import { PAGE_SIZE } from '@/lib/constants';
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

export async function getPaginatedProducts(pageSize = PAGE_SIZE, startAfterDoc?: QueryDocumentSnapshot<DocumentData>) {
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

export async function getPopularProducts(limit: number = 3) {
	try {
		const productsRef = collection(db, 'products');
		const snapshot = await getDocs(productsRef);
		const products = snapshot.docs
			.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }))
			.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
			.slice(0, limit);
		return products;
	} catch (error) {
		throw new Error(`Error fetching popular products: ${error}`);
	}
}

export async function searchProducts(query: string, limit = 9) {
	try {
		if (!query.trim()) {
			return getPopularProducts(limit);
		}

		const productsRef = collection(db, 'products');
		const snapshot = await getDocs(productsRef);
		const lowerQuery = query.toLowerCase();
		const products = snapshot.docs
			.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }))
			.filter(
				(product) =>
					product.title?.toLowerCase().includes(lowerQuery) || product.business?.toLowerCase().includes(lowerQuery)
			);
		return products;
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
