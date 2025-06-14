import { Product } from '@/types';
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firabase';

export async function getProducts() {
	try {
		const snapshot = await getDocs(collection(db, 'products'));
		return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) }));
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
			// .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
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

export async function uploadProduct(product: Product) {
	try {
		await addDoc(collection(db, 'products'), product);
	} catch (error) {
		throw new Error(`Error uploading product: ${error}`);
	}
}
