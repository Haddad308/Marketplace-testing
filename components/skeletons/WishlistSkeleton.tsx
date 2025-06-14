import { Skeleton } from '../ui/Skeleton';

export default function WishlistSkeleton() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{[...Array(8)].map((_, i) => (
				<WishlistProductCardSkeleton key={i} />
			))}
		</div>
	);
}

function WishlistProductCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<Skeleton className="aspect-[4/3] w-full" />
			<div className="p-4">
				<div className="mb-1 flex items-center justify-between">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-8" />
				</div>
				<Skeleton className="mb-1 h-10 w-full" />
				<Skeleton className="mb-1 h-4 w-20" />
				<Skeleton className="mb-2 h-4 w-24" />
				<div className="mb-3 flex items-baseline gap-2">
					<Skeleton className="h-6 w-16" />
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-4 w-8" />
				</div>
				<Skeleton className="h-9 w-full" />
			</div>
		</div>
	);
}
