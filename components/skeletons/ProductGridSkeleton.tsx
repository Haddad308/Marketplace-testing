import ProductCardSkeleton from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
	count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{[...Array(count)].map((_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</div>
	);
}

export default ProductGridSkeleton;
