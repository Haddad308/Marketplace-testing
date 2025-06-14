import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EmptyWishlist() {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
			<div className="mb-4 rounded-full bg-purple-100 p-4">
				<svg className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
			</div>
			<h3 className="mb-2 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
			<p className="mb-6 text-gray-500">
				Sorry, you haven't saved any deals yet. Start exploring and save your favorite deals to view them later.
			</p>
			<Link href="/">
				<Button className="bg-purple-600 text-white hover:bg-purple-700">Browse Deals</Button>
			</Link>
		</div>
	);
}
