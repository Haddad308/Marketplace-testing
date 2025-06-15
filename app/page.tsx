import ProductsSection from '@/sections/ProductsSection';
import PromotionalBanners from '@/sections/PromotionalBannersSection';
import TrendingSection from '@/sections/TrendingSection';

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
