import { useNavigate } from "@tanstack/react-router";
import { OrderHeader } from "./ui/order-header";
import { OrderDetails } from "./ui/order-details";
import { OrderClient } from "./ui/order-client";
import { OrderPayments, OrderPaymentsHandle } from "./ui/order-payments";
import { OrderDeliveries, OrderDeliveriesHandle } from "./ui/order-deliveries";
import { OrderHistory } from "./ui/order-history";
import {
  FileText,
  History,
  Loader2Icon,
  SaveIcon,
  Truck,
  UserRoundIcon,
  Wallet,
} from "lucide-react";
import { useOrderDetailPage } from "./hooks";
import { useRef, useState } from "react";
import { BottomBar } from "@/components/bottom-bar";
import { barButton } from "@/components/bottom-bar/styles";
import { listCardClass, SectionCard, Shimmer } from "@/components/data-list";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { cn } from "@/lib/utils";

type OrderTab = "details" | "finances" | "deliveries" | "history";

const TABS = [
  { id: "details", label: "Детали", Icon: FileText },
  { id: "finances", label: "Финансы", Icon: Wallet },
  { id: "deliveries", label: "Доставки", Icon: Truck },
  { id: "history", label: "История", Icon: History },
] as const;

export const OrderDetailPage = () => {
  const [activeTab, setActiveTab] = useState<OrderTab>("details");
  const deliveriesRef = useRef<OrderDeliveriesHandle>(null);
  const paymentsRef = useRef<OrderPaymentsHandle>(null);

  const navigate = useNavigate();
  const {
    form,
    handleDelete,
    handleSaveTemplate,
    onSubmit,
    order,
    originalStatus,
    isSubmitting,
    isLoading,
    isDeleting,
    orderId,
    setOrder,
    error,
  } = useOrderDetailPage();

  const disabledByStatus =
    order?.status === "completed" || order?.status === "cancelled" || order?.status === "archived";

  if (isLoading || !order || error) {
    return (
      <div className="flex flex-col gap-4">
        <div className={cn(listCardClass, "flex items-center gap-4 p-6")}>
          <Shimmer className="h-14 w-14 rounded-[20px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Shimmer className="h-6 w-48" />
            <Shimmer className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Shimmer className="h-12 w-full rounded-2xl sm:w-[480px]" />
        <Shimmer className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const isBusy = isDeleting || isSubmitting;

  // Основная кнопка таббара зависит от вкладки
  const addAction =
    activeTab === "deliveries"
      ? () => deliveriesRef.current?.openAddDialog()
      : activeTab === "finances"
        ? () => paymentsRef.current?.openIncomeDialog()
        : undefined;

  return (
    <div className="flex flex-col gap-4">
      <OrderHeader orderId={orderId} order={order} />

      <SegmentedTabs
        tabs={TABS}
        value={activeTab}
        onChange={setActiveTab}
        className="sm:min-w-[520px]"
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {activeTab === "details" && (
          <div className="flex flex-col gap-4">
            <SectionCard
              icon={<FileText />}
              iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300"
              title="Основная информация"
              description="Тип, статус, дата и адрес"
            >
              <OrderDetails
                form={form}
                isSubmitting={isSubmitting}
                originalStatus={originalStatus}
                disabledByStatus={disabledByStatus}
              />
            </SectionCard>

            <SectionCard
              icon={<UserRoundIcon />}
              iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300"
              title="Клиент"
              description="Плательщик и приёмщик"
            >
              <OrderClient
                form={form}
                isSubmitting={isSubmitting}
                disabledByStatus={disabledByStatus}
              />
            </SectionCard>
          </div>
        )}

        {activeTab === "finances" && (
          <SectionCard
            icon={<Wallet />}
            iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
            title="Финансы"
            description="Оплаты, ожидания и долги по заявке"
          >
            <OrderPayments ref={paymentsRef} orderId={orderId} order={order} setOrder={setOrder} />
          </SectionCard>
        )}

        {activeTab === "deliveries" && (
          <SectionCard
            icon={<Truck />}
            iconClassName="bg-cyan-100 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-300"
            title="Доставки"
            description="Рейсы по заявке и их статус"
          >
            <OrderDeliveries
              ref={deliveriesRef}
              orderId={orderId}
              setOrder={setOrder}
              order={order}
              disabledByStatus={disabledByStatus}
            />
          </SectionCard>
        )}

        {activeTab === "history" && (
          <SectionCard
            icon={<History />}
            title="История изменений"
            description="Кто и что менял в заявке"
          >
            <OrderHistory order={order} />
          </SectionCard>
        )}

        <BottomBar
          isSumitting={isBusy}
          saveLabel={isSubmitting ? "Сохранение..." : "Сохранить"}
          onBack={() => navigate({ to: "/orders" })}
          hideSaveButton={activeTab === "history"}
          onCreate={addAction}
          createLabel="Добавить"
          createDisabled={disabledByStatus || isBusy}
          showDeleteButton
          handleDelete={handleDelete}
          isDeleting={isBusy}
          extraRow={
            activeTab === "details" ? (
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={isBusy}
                className={cn(barButton.secondary, "w-full")}
              >
                {isBusy ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
                Сохранить шаблон
              </button>
            ) : undefined
          }
        />
      </form>
    </div>
  );
};
