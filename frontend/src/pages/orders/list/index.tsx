import { useNavigate } from "@tanstack/react-router";
import { ClipboardListIcon } from "lucide-react";
import { BottomBar } from "@/components/bottom-bar";
import { ListPageHead, ListPagination } from "@/components/data-list";
import { PAGE_OPTIONS, useOrdersListPage } from "./hooks";
import { OrdersListFilters } from "./ui/filters";
import { OrdersTable } from "./ui/orders-table";

export const OrdersPage = () => {
  const navigate = useNavigate();
  const {
    orders,
    isLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = useOrdersListPage();

  return (
    <div className="flex flex-col gap-4">
      <ListPageHead
        icon={<ClipboardListIcon />}
        iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300"
        title="Заявки"
        description="Доставки, оплаты и статусы"
      />

      <OrdersListFilters
        filters={filters}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        updateFilter={updateFilter}
      />

      <OrdersTable
        orders={orders}
        isLoading={isLoading}
        skeletonCount={Math.min(limit, 8)}
        onOpen={(order) =>
          navigate({ to: "/orders/$orderId", params: { orderId: String(order.id) } })
        }
      />

      <ListPagination
        pageOptions={PAGE_OPTIONS}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <BottomBar onCreate={() => navigate({ to: "/orders/new" })} quickCreate />
    </div>
  );
};
