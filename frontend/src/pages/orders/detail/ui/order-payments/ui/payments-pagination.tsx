import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

export const PaymentsPagination = ({ currentPage, setCurrentPage, totalPages }: Props) => {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className="h-10 w-10 bg-zinc-800 text-white hover:bg-zinc-900 hover:text-white"
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 px-4 py-2 border rounded-md">
        <span className="text-sm font-medium">{currentPage}</span>
        <span className="text-sm text-muted-foreground">/ {totalPages}</span>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="h-10 w-10 bg-zinc-800 text-white hover:bg-zinc-900 hover:text-white"
        type="button"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
