import { Button } from "@/components/ui/button";

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
    <div className="flex justify-center items-center gap-2 my-3 flex-wrap">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          className={`h-8 w-8 p-0 text-sm cursor-pointer ${
            page === currentPage
              ? "bg-purple-600 text-white border-slate-700"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
    </div>
  );
}
