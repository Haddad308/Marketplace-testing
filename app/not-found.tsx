'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md text-center">
				{/* 404 Illustration */}
				<div className="mb-8">
					<div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-purple-100">
						<span className="text-6xl font-bold text-purple-600">404</span>
					</div>
					<div className="relative">
						<div className="absolute top-4 -left-8 h-16 w-16 rounded-full bg-purple-200 opacity-20"></div>
						<div className="absolute top-8 -right-6 h-12 w-12 rounded-full bg-purple-300 opacity-30"></div>
						<div className="absolute -bottom-4 left-4 h-8 w-8 rounded-full bg-purple-400 opacity-25"></div>
					</div>
				</div>

				{/* Error Message */}
				<div className="mb-8">
					<h1 className="mb-2 text-3xl font-bold text-gray-900">Page Not Found</h1>
					<p className="text-gray-600">
						Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
					</p>
				</div>

				{/* Action Buttons */}
				<div className="space-y-4">
					<Link href="/" className="block">
						<Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
							<Home className="mr-2 h-4 w-4" />
							Go to Homepage
						</Button>
					</Link>

					<Link href="/search" className="block">
						<Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
							<Search className="mr-2 h-4 w-4" />
							Search Deals
						</Button>
					</Link>

					<Button
						variant="ghost"
						onClick={() => window.history.back()}
						className="w-full text-gray-600 hover:text-purple-600"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Go Back
					</Button>
				</div>
			</div>
		</div>
	);
}
