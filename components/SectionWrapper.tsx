import { ReactNode } from 'react';

interface SectionWrapperProps {
	children: ReactNode;
}

const SectionWrapper = ({ children }: SectionWrapperProps) => {
	return <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</section>;
};

export default SectionWrapper;
