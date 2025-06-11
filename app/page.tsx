import SectionWrapper from '@/components/SectionWrapper';
import ProductsSection from '@/sections/ProductsSection';
import Navbar from '../sections/Navbar';

export default function Page() {
	return (
		<main className="container mx-auto">
			<Navbar />
			<SectionWrapper>
				<ProductsSection />
			</SectionWrapper>
		</main>
	);
}
