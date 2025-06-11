import SectionWrapper from '@/components/SectionWrapper';
import ProductsSection from '@/sections/ProductsSection';
import Navbar from '../sections/Navbar';

export default function Page() {
	return (
		<main>
			<Navbar />
			<div className="container mx-auto">
				<SectionWrapper>
					<ProductsSection />
				</SectionWrapper>
			</div>
		</main>
	);
}
