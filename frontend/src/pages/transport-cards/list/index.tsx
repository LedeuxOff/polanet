import { useNavigate } from "@tanstack/react-router";
import { useTransportCardsListPage } from "./hooks";
import { CreditCardIcon } from "lucide-react";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { BottomBar } from "@/components/bottom-bar";
import { listFilterControlClass, ListPageHead, ListPagination } from "@/components/data-list";
import { CardsTable } from "./ui/cards-table";

export const TransportCardsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  const {
    cards,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useTransportCardsListPage();

  return (
    <PermissionGuard permission="transport-cards:list">
      <div className="flex flex-col gap-4">
        <ListPageHead
          icon={<CreditCardIcon />}
          iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
          title="Топливные карты"
          description="Карты водителей и расходы по ним"
        />

        {/* Search */}
        <DataTableSearchFilter
          search={search}
          handleSearchChange={handleSearchChange}
          placeholder="Поиск по номеру карты"
          inputClassName={listFilterControlClass}
        />

        <CardsTable
          cards={cards}
          isLoading={isLoading}
          skeletonCount={Math.min(limit, 8)}
          onOpen={(card) =>
            navigate({ to: "/transport-cards/$cardId", params: { cardId: card.id.toString() } })
          }
        />

        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />

        <BottomBar
          onCreate={() => {
            if (!hasPermission("transport-cards:create")) {
              showToast("У вас нет прав на создание карты", "error");
              return;
            }
            navigate({ to: "/transport-cards/new" });
          }}
        />
      </div>
    </PermissionGuard>
  );
};
