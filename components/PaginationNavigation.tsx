import { Button } from '@/components/ui/button';

interface PaginationNavigationProps {
	currentPage: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}

export function PaginationNavigation({
	currentPage,
	totalItems,
	itemsPerPage,
	onPageChange,
}: PaginationNavigationProps) {
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	if (totalPages <= 1) return null;

	return (
		<div className="my-3 flex flex-wrap items-center justify-center gap-2">
			{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
				<Button
					key={page}
					variant={page === currentPage ? 'default' : 'outline'}
					className={`h-8 w-8 cursor-pointer p-0 text-sm ${
						page === currentPage
							? 'border-slate-700 bg-purple-600 text-white'
							: 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
					}`}
					onClick={() => onPageChange(page)}
				>
					{page}
				</Button>
			))}
		</div>
	);
}
