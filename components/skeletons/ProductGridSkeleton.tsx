import ProductCardSkeleton from './ProductCardSkeleton';

export function ProductGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{[...Array(6)].map((_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</div>
	);
}

export default ProductGridSkeleton;
