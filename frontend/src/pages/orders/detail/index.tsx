import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHeader } from "./ui/order-header";
import { OrderDetails } from "./ui/order-details";
import { OrderClient } from "./ui/order-client";
import { OrderPayments } from "./ui/order-payments";
import { OrderDeliveries } from "./ui/order-deliveries";
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
import { useState } from "react";

export const OrderDetailPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

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
      <Card className="rounded-2xl shadow-xl">
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
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
          onClick={() => navigate({ to: "/orders" })}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {isMobile && (
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        )}

        {activeTab === "details" && (
          <Button
            type="submit"
            disabled={isDeleting || isSubmitting}
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600 flex-1"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        )}

        <Button
          type="button"
          className="rounded-2xl px-3 py-4 bg-red-400 hover:bg-red-500"
          onClick={handleDelete}
          disabled={isDeleting || isSubmitting}
        >
          <TrashIcon className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => setHideBottomTabbar(true)}
          type="button"
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
      {activeTab === "details" && (
        <Button
          type="button"
          className="flex items-center gap-2 px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
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
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <OrderHeader isNewOrder={isNewOrder} orderId={orderId} order={order} />
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-1 p-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
              activeTab === "details"
                ? "bg-blue-500 text-white shadow-md"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
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
                ? "bg-blue-500 text-white shadow-md"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
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
                ? "bg-blue-500 text-white shadow-md"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
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
                ? "bg-blue-500 text-white shadow-md"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <History className="w-4 h-4" />
            <span className={!isMobile ? "" : "hidden"}>История</span>
          </button>
        </div>

        {/* Детали и клиент */}
        {activeTab === "details" && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-6">
              <Card className="rounded-2xl shadow-xl">
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

              <Card className="rounded-2xl shadow-xl">
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
          <div className="mt-4 space-y-4">
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Финансы</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderPayments orderId={orderId} order={order} setOrder={setOrder} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Доставки */}
        {activeTab === "deliveries" && (
          <div className="mt-4 space-y-4">
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Информация о доставках</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderDeliveries
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
          <div className="mt-4 space-y-4">
            <Card className="rounded-2xl shadow-xl">
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
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? `-bottom-[${activeTab === "details" ? "112" : "56"}px]` : "bottom-2") : hideBottomTabbar ? `-bottom-[${activeTab === "details" ? "112" : "56"}px]` : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
        >
          <div
            onClick={() => setHideBottomTabbar(false)}
            className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronUp className="text-white w-5" />
          </div>
          {renderBottomButtons()}
        </div>
      </form>
    </div>
  );
};
