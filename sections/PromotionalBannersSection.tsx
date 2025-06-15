'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function PromotionalBanners() {
	return (
		<section className="bg-gray-50 py-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-6 md:grid-cols-2">
					{/* Father's Day Banner */}
					<div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-400 to-blue-600">
						<div className="absolute inset-0">
							<Image src="./father-son.webp" alt="Father and child" fill className="object-cover opacity-80" />
						</div>
						<div className="relative p-8 text-white">
							<h3 className="mb-2 text-3xl font-bold">Thank You, Dad</h3>
							<p className="mb-4 text-lg opacity-90">The perfect way to say it.</p>
							<Button variant="secondary" className="rounded-full bg-white px-6 py-2 text-blue-600 hover:bg-gray-100">
								See More
							</Button>
						</div>
					</div>

					{/* Groupon Days Banner */}
					<div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-green-500">
						<div className="relative p-8 text-white">
							<div className="mb-4">
								<span className="text-sm font-medium opacity-90">DO MORE, PAY LESS</span>
								<div className="text-2xl font-bold">
									<span className="text-green-400">DEALSPOT</span> Days
								</div>
							</div>
							<h3 className="mb-2 text-3xl font-bold">Save up to 30%</h3>
							<p className="mb-4 text-lg opacity-90">Everything you want to do—on sale</p>
							<Button variant="secondary" className="rounded-full bg-white px-6 py-2 text-purple-600 hover:bg-gray-100">
								See More
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
