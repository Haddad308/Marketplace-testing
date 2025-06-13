import { Skeleton } from '../ui/Skeleton';

export default function ProductDetailsSkeleton() {
	return (
		<div className="mx-auto my-4 max-w-6xl">
			<div className="mb-6">
				<Skeleton className="h-6 w-24" />
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				{/* Product Image Skeleton */}
				<Skeleton className="aspect-square w-full rounded-lg" />

				{/* Product Info Skeleton */}
				<div>
					<div className="mb-6">
						<div className="mb-1 flex items-center gap-2">
							<Skeleton className="h-6 w-24 rounded-full" />
							<Skeleton className="h-5 w-32" />
						</div>

						<Skeleton className="mb-2 h-10 w-full" />
						<Skeleton className="mb-2 h-5 w-48" />

						<div className="mb-4 flex items-center gap-2">
							<Skeleton className="h-5 w-32" />
						</div>

						<div className="mb-6">
							<div className="mb-2 flex items-baseline gap-2">
								<Skeleton className="h-8 w-24" />
								<Skeleton className="h-6 w-16" />
								<Skeleton className="h-6 w-16 rounded-md" />
							</div>
						</div>

						<div className="my-6 h-px w-full bg-gray-200" />

						<Skeleton className="mb-6 h-16 w-full rounded-md" />

						<div className="mt-8 flex flex-col gap-4 sm:flex-row">
							<Skeleton className="h-12 w-full sm:w-1/2" />
							<Skeleton className="h-12 w-full sm:w-1/2" />
						</div>
					</div>
				</div>
			</div>

			{/* Additional Information Skeleton */}
			<div className="mt-12">
				<Skeleton className="h-64 w-full rounded-lg" />
			</div>
		</div>
	);
}
