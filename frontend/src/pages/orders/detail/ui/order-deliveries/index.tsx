import { Button } from "@/components/ui/button";
import { DeliveryWithIncome, Order } from "@/lib/types";
import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useOrderDeliveries } from "./hooks";
import { useIsMobile } from "@/hooks";
import { cn, getFormattedAmount } from "@/lib/utils";
import { TruckIcon } from "lucide-react";
import { AddDeliveryMobileModal } from "./ui/add-delivery-mobile-modal";
import { AddDeliveryDesktopModal } from "./ui/add-delivery-desktop-modal";
import { DeliveryDesktopItem } from "./ui/delivery-desktop-item";
import { DeliveryMobileItem } from "./ui/delivery-mobile-item";
import { CompleteDeliveryModal } from "./ui/complete-delivery-modal";
import { ListPagination } from "../shared/list-pagination";
import { getDeliveryAmount } from "./utils";

interface Props {
  orderId: string;
  setOrder: Dispatch<SetStateAction<Order | null>>;
  order: Order;
  disabledByStatus: boolean;
}

const ITEMS_PER_PAGE = 5;

const formatVolume = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);

export interface OrderDeliveriesHandle {
  openAddDialog: () => void;
}

export const OrderDeliveries = forwardRef<OrderDeliveriesHandle, Props>(
  ({ orderId, setOrder, order, disabledByStatus }, ref) => {
    const isMobile = useIsMobile();
    const {
      deliveries,
      error,
      handleCompleteDelivery,
      handleCancelDelivery,
      handleEditDelivery,
      handleDeleteDelivery,
      showDeliveryDialog,
      setShowDeliveryDialog,
      editingDelivery,
      handleSaveDelivery,
      form,
      drivers,
      cars,
      setEditingDelivery,
      users,
      completingDelivery,
      handleCloseCompleteDelivery,
      handleConfirmCompleteDelivery,
      handleChangeRecipient,
      recipientModalMode,
    } = useOrderDeliveries({ orderId, setOrder });

    const [currentPage, setCurrentPage] = useState(1);

    const openAddDialog = () => {
      setShowDeliveryDialog(true);
      setEditingDelivery(null);
      form.reset();
      form.setValue("orderId", Number(orderId));
    };

    useImperativeHandle(ref, () => ({ openAddDialog }));

    const stats = useMemo(() => {
      const list = deliveries as DeliveryWithIncome[];
      const completed = list.filter((d) => d.status === "completed");
      const deliveredVolume = completed.reduce((sum, d) => sum + (Number(d.volume) || 0), 0);
      const plannedVolume = list.reduce((sum, d) => sum + (Number(d.volume) || 0), 0);
      const targetVolume = Number(order?.volume) || plannedVolume;
      const totalAmount = list.reduce((sum, d) => sum + (Number(getDeliveryAmount(d)) || 0), 0);
      const progress = targetVolume > 0 ? Math.min(100, (deliveredVolume / targetVolume) * 100) : 0;

      return {
        total: list.length,
        completed: completed.length,
        inProgress: list.length - completed.length,
        deliveredVolume,
        targetVolume,
        totalAmount,
        progress,
      };
    }, [deliveries, order?.volume]);

    const totalPages = useMemo(() => {
      return Math.max(1, Math.ceil(deliveries.length / ITEMS_PER_PAGE));
    }, [deliveries.length]);

    useEffect(() => {
      if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const paginatedDeliveries = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return deliveries.slice(start, start + ITEMS_PER_PAGE);
    }, [deliveries, currentPage]);

    return (
      <>
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-10 text-center dark:border-white/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground dark:bg-white/10">
              <TruckIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">Доставок пока нет</p>
              <p className="text-sm text-muted-foreground">Нажмите «Добавить» в нижней панели</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
              <div className="rounded-2xl border p-3 dark:border-white/20">
                <p className="text-xs text-muted-foreground">Доставки</p>
                <p className="text-xl font-bold">
                  {stats.completed}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / {stats.total}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.inProgress > 0 ? `в процессе: ${stats.inProgress}` : "все завершены"}
                </p>
              </div>

              <div className="rounded-2xl border p-3 dark:border-white/20">
                <p className="text-xs text-muted-foreground">Сумма доставок</p>
                <p className="text-xl font-bold">{getFormattedAmount(stats.totalAmount)} ₽</p>
              </div>

              <div
                className={cn(
                  "flex flex-col gap-1.5 rounded-2xl border p-3 dark:border-white/20",
                  isMobile && "col-span-2",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Доставлено</p>
                  <p className="text-xs text-muted-foreground">{Math.round(stats.progress)}%</p>
                </div>
                <p className="text-xl font-bold">
                  {formatVolume(stats.deliveredVolume)}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / {formatVolume(stats.targetVolume)} м³
                  </span>
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-sm font-medium">Список доставок</p>

            <div className="flex flex-col gap-3">
              {paginatedDeliveries.map((delivery) => {
                const itemProps = {
                  delivery: delivery as DeliveryWithIncome,
                  drivers,
                  cars,
                  handleCompleteDelivery: () => handleCompleteDelivery(delivery),
                  handleChangeRecipient: () => handleChangeRecipient(delivery),
                  handleEditDelivery,
                  disabledByStatus,
                  handleDeleteDelivery,
                };

                return isMobile ? (
                  <DeliveryMobileItem key={delivery.id} {...itemProps} />
                ) : (
                  <DeliveryDesktopItem key={delivery.id} {...itemProps} />
                );
              })}
            </div>

            {totalPages > 1 && (
              <ListPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                totalItems={deliveries.length}
                itemsPerPage={ITEMS_PER_PAGE}
                compact={isMobile}
              />
            )}
          </div>
        )}

        {isMobile && (
          <AddDeliveryMobileModal
            showDeliveryDialog={showDeliveryDialog}
            setShowDeliveryDialog={setShowDeliveryDialog}
            editingDelivery={editingDelivery}
            form={form}
            error={error}
            handleSaveDelivery={handleSaveDelivery}
            drivers={drivers}
            cars={cars}
            handleCancelDelivery={handleCancelDelivery}
            users={users}
          />
        )}

        {!isMobile && (
          <AddDeliveryDesktopModal
            showDeliveryDialog={showDeliveryDialog}
            setShowDeliveryDialog={setShowDeliveryDialog}
            editingDelivery={editingDelivery}
            form={form}
            error={error}
            handleSaveDelivery={handleSaveDelivery}
            drivers={drivers}
            cars={cars}
            handleCancelDelivery={handleCancelDelivery}
            users={users}
          />
        )}

        <CompleteDeliveryModal
          isMobile={isMobile}
          mode={recipientModalMode}
          delivery={completingDelivery as DeliveryWithIncome | null}
          onClose={handleCloseCompleteDelivery}
          onConfirm={handleConfirmCompleteDelivery}
          drivers={drivers}
          cars={cars}
          users={users}
          error={error}
        />
      </>
    );
  },
);

OrderDeliveries.displayName = "OrderDeliveries";
