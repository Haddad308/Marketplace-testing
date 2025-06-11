'use client';

import Navbar from '../sections/Navbar';

export default function Page() {
	return (
		<div>
			<Navbar />
			<main className="container mx-auto py-8">
				<h1 className="mb-4 text-2xl font-bold">Welcome to DealSpot</h1>
				<p className="text-gray-700">Find the best deals and discounts near you.</p>
			</main>
		</div>
	);
}
