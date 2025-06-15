import ProductCardSkeleton from './ProductCardSkeleton';

export default function WishlistSkeleton() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{[...Array(8)].map((_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</div>
	);
}
