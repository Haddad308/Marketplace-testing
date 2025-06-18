import ProductsSection from '@/sections/ProductsSection';
import PromotionalBanners from '@/sections/PromotionalBannersSection';
import TrendingSection from '@/sections/TrendingSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Merchify - Discover & Shop Services',
	description:
		'Browse, wishlist, and shop the best service deals from top sellers. Affiliate links, no direct purchases. Sellers can add and promote their services easily.',
};

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Trending Section */}
			<TrendingSection />

			{/* Promotional Banners */}
			<PromotionalBanners />

			{/* All Products Section */}
			<ProductsSection />
		</div>
	);
}
