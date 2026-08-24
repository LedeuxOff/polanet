import * as React from "react";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
  onLimitChange,
  pageOptions = [1, 5, 10, 25, 50],
}: PaginationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handleFirstPage = () => {
    if (!isFirstPage) onPageChange(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleLastPage = () => {
    if (!isLastPage && totalPages > 0) onPageChange(totalPages);
  };

  const handleLimitChange = (value: string) => {
    if (onLimitChange) {
      onLimitChange(Number(value));
    }
  };

  return (
    <div className="flex flex-col gap-3 py-4">
      {/* Верхняя панель: количество записей на странице и информация */}
      {onLimitChange && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Показать:</span>
            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Выбрать" />
              </SelectTrigger>
              <SelectContent>
                {pageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-2">записей из {totalRecords}</span>
          </div>
        </div>
      )}

      {/* Нижняя панель: навигация по страницам */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">
          Страница {currentPage} из {totalPages || 1}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirstPage}
            disabled={isFirstPage}
            aria-label="Первая страница"
            title="Первая страница"
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={isFirstPage}
            aria-label="Предыдущая страница"
            title="Предыдущая страница"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={isLastPage}
            aria-label="Следующая страница"
            title="Следующая страница"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLastPage}
            disabled={isLastPage}
            aria-label="Последняя страница"
            title="Последняя страница"
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
