import { Skeleton } from '../ui/Skeleton';

export function ProductCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			{/* Image skeleton */}
			<div className="relative aspect-[4/3] w-full">
				<Skeleton className="h-full w-full" />
				{/* Badge skeleton */}
				<Skeleton className="absolute top-2 left-2 h-6 w-16 rounded-full" />
				{/* Heart icon skeleton */}
				<Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full" />
			</div>

			{/* Content skeleton */}
			<div className="p-4">
				{/* Category and rating row */}
				<div className="mb-1 flex items-center justify-between">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-12" />
				</div>

				{/* Title skeleton - 2 lines */}
				<div className="mb-1 space-y-1">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>

				{/* Business name skeleton */}
				<Skeleton className="mb-1 h-3 w-24" />

				{/* Location skeleton */}
				<Skeleton className="mb-2 h-3 w-32" />

				{/* Price row skeleton */}
				<div className="mb-3 flex items-baseline gap-2">
					<Skeleton className="h-6 w-16" />
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-4 w-10" />
				</div>

				{/* Button skeleton */}
				<Skeleton className="h-9 w-full rounded-md" />
			</div>
		</div>
	);
}

// Export as default as well for convenience
export default ProductCardSkeleton;
