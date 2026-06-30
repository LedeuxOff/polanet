import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Card, CardContent } from "./card";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

export interface ServerPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  // Серверная пагинация (опциональная)
  pagination?: ServerPaginationInfo;
  pageOptions?: number[];
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  pagination,
  pageOptions = [1, 5, 10, 25, 50],
  onPageChange,
  onLimitChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const hasServerPagination = !!pagination && !!onPageChange;
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalRecords = pagination?.totalRecords ?? data.length;
  const limit = pagination?.limit ?? data.length;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="w-full">
      <Card className="p-0 rounded-2xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="rounded-md w-full">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="h-10 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap min-w-[100px] text-sm border-r last:border-r-0"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => onRowClick?.(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="p-3 align-middle whitespace-nowrap text-sm border-r last:border-r-0"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="h-24 text-center text-sm">
                        Нет данных.
                      </td>
                    </tr>
                  )}
                  {hasServerPagination && (
                    <tr className="transition-colors hover:bg-muted/50 cursor-pointer">
                      <td className="p-3 align-middle whitespace-nowrap text-sm border-r last:border-r-0 font-medium">
                        Общее кол-во записей:
                      </td>
                      <td className="p-3 align-middle whitespace-nowrap text-sm border-r last:border-r-0 font-medium">
                        {totalRecords}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Пагинация */}
      {hasServerPagination && (
        <Card className="rounded-2xl shadow-xl my-4">
          <CardContent className="py-2 px-4">
            <div className="flex gap-3 justify-between">
              {onLimitChange && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Кол-во записей:</span>
                    <Select
                      value={String(limit)}
                      onValueChange={(value) => onLimitChange(Number(value))}
                    >
                      <SelectTrigger className="w-auto pl-4 gap-2">
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
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Страница {currentPage} из {totalPages || 1}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange!(1)}
                    disabled={isFirstPage}
                    aria-label="Первая страница"
                    title="Первая страница"
                    className="rounded-full"
                  >
                    <ChevronsLeftIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange!(currentPage - 1)}
                    disabled={isFirstPage}
                    aria-label="Предыдущая страница"
                    title="Предыдущая страница"
                    className="rounded-full"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange!(currentPage + 1)}
                    disabled={isLastPage}
                    aria-label="Следующая страница"
                    title="Следующая страница"
                    className="rounded-full"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange!(totalPages)}
                    disabled={isLastPage}
                    aria-label="Последняя страница"
                    title="Последняя страница"
                    className="rounded-full"
                  >
                    <ChevronsRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
