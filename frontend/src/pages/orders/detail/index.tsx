import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHeader } from "./ui/order-header";
import { OrderDetails } from "./ui/order-details";
import { OrderClient } from "./ui/order-client";
import { OrderPayments, OrderPaymentsHandle } from "./ui/order-payments";
import { OrderDeliveries, OrderDeliveriesHandle } from "./ui/order-deliveries";
import { OrderHistory } from "./ui/order-history";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  FileText,
  MenuIcon,
  TrashIcon,
  Truck,
  History,
  Wallet,
} from "lucide-react";
import { useOrderDetailPage } from "./hooks";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useRef, useState } from "react";

export const OrderDetailPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const deliveriesRef = useRef<OrderDeliveriesHandle>(null);
  const paymentsRef = useRef<OrderPaymentsHandle>(null);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const {
    form,
    handleDelete,
    handleSaveTemplate,
    onSubmit,
    isNewOrder,
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
      <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  const renderBottomButtons = () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button
          type="button"
          disabled={isDeleting || isSubmitting}
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/20"
          onClick={() => navigate({ to: "/orders" })}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {isMobile && (
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/20"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        )}

        {activeTab === "details" && (
          <Button
            type="submit"
            disabled={isDeleting || isSubmitting}
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600 flex-1 dark:bg-blue-600/40 dark:border dark:border-white/20 dark:text-white dark:hover:bg-blue-600/60"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        )}

        <Button
          type="button"
          className="rounded-2xl px-3 py-4 bg-red-400 hover:bg-red-500 dark:bg-red-600/40 dark:border dark:border-white/20 dark:text-white dark:hover:bg-red-600/60"
          onClick={handleDelete}
          disabled={isDeleting || isSubmitting}
        >
          <TrashIcon className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => setHideBottomTabbar(true)}
          type="button"
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/20"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
      {activeTab === "deliveries" && (
        <Button
          type="button"
          disabled={disabledByStatus || isDeleting || isSubmitting}
          onClick={() => deliveriesRef.current?.openAddDialog()}
          className="px-3 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600 dark:bg-blue-600/40 dark:border dark:border-white/20 dark:text-white dark:hover:bg-blue-600/60"
        >
          Добавить
        </Button>
      )}
      {activeTab === "finances" && (
        <Button
          type="button"
          disabled={disabledByStatus || isDeleting || isSubmitting}
          onClick={() => paymentsRef.current?.openIncomeDialog()}
          className="px-3 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600 dark:bg-blue-600/40 dark:border dark:border-white/20 dark:text-white dark:hover:bg-blue-600/60"
        >
          Добавить
        </Button>
      )}
      {activeTab === "details" && (
        <Button
          type="button"
          className="flex items-center gap-2 px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/20"
          onClick={handleSaveTemplate}
          disabled={isDeleting || isSubmitting}
        >
          <FileText className="w-4 h-4" />
          Сохранить шаблон
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Шапка заявки */}
      <OrderHeader orderId={orderId} order={order} />

      <div className="flex gap-1 p-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
            activeTab === "details"
              ? "bg-blue-500 text-white shadow-md dark:bg-white/10"
              : "text-zinc-600 dark:text-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-white/10"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className={!isMobile ? "" : "hidden"}>Детали</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("finances")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
            activeTab === "finances"
              ? "bg-blue-500 text-white shadow-md dark:bg-white/10"
              : "text-zinc-600 dark:text-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-white/10"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span className={!isMobile ? "" : "hidden"}>Финансы</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("deliveries")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
            activeTab === "deliveries"
              ? "bg-blue-500 text-white shadow-md dark:bg-white/10"
              : "text-zinc-600 dark:text-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-white/10"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span className={!isMobile ? "" : "hidden"}>Доставки</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
            activeTab === "history"
              ? "bg-blue-500 text-white shadow-md dark:bg-white/10"
              : "text-zinc-600 dark:text-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-white/10"
          }`}
        >
          <History className="w-4 h-4" />
          <span className={!isMobile ? "" : "hidden"}>История</span>
        </button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Детали и клиент */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-6">
              <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderDetails
                    form={form}
                    isSubmitting={isSubmitting}
                    originalStatus={originalStatus}
                    disabledByStatus={disabledByStatus}
                  />
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                <CardHeader>
                  <CardTitle>Информация о клиенте</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderClient
                    form={form}
                    isSubmitting={isSubmitting}
                    disabledByStatus={disabledByStatus}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Финансы */}
        {activeTab === "finances" && (
          <div className="mt-4 space-y-4 pb-24">
            <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
              <CardHeader>
                <CardTitle>Финансы</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderPayments
                  ref={paymentsRef}
                  orderId={orderId}
                  order={order}
                  setOrder={setOrder}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Доставки */}
        {activeTab === "deliveries" && (
          <div className="mt-4 space-y-4 pb-24">
            <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
              <CardHeader>
                <CardTitle>Информация о доставках</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderDeliveries
                  ref={deliveriesRef}
                  orderId={orderId}
                  setOrder={setOrder}
                  order={order}
                  disabledByStatus={disabledByStatus}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* История изменений */}
        {activeTab === "history" && (
          <div className="mt-4 space-y-4 pb-24">
            <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
              <CardHeader>
                <CardTitle>История изменений</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderHistory order={order} />
              </CardContent>
            </Card>
          </div>
        )}

        <div
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? `-bottom-[${activeTab === "history" ? "56" : "112"}px]` : "bottom-2") : hideBottomTabbar ? `-bottom-[${activeTab === "history" ? "56" : "112"}px]` : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl dark:bg-white/10 dark:border dark:border-white/20`}
        >
          <div
            onClick={() => setHideBottomTabbar(false)}
            className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all dark:bg-zinc-500 dark:backdrop-blur-xl ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronUp className="text-white w-5" />
          </div>
          {renderBottomButtons()}
        </div>
      </form>
    </div>
  );
};
