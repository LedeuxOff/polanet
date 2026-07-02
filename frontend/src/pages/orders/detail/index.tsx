import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHeader } from "./ui/order-header";
import { OrderDetails } from "./ui/order-details";
import { OrderClient } from "./ui/order-client";
import { OrderPayments } from "./ui/order-payments";
import { OrderDeliveries } from "./ui/order-deliveries";
import { OrderHistory } from "./ui/order-history";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronUp, FileText, MenuIcon, TrashIcon } from "lucide-react";
import { useOrderDetailPage } from "./hooks";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";

export const OrderDetailPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

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

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Шапка заявки */}
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <OrderHeader isNewOrder={isNewOrder} orderId={orderId} order={order} />
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className={`flex flex-col gap-6`}>
          <div className="flex flex-col gap-6 flex-1">
            {/* Основная информация */}
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

            {/* Информация о клиента */}
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

          <div className="flex flex-col gap-6 flex-1">
            {!isNewOrder && order && (
              <>
                {/* Финансы */}
                <Card className="rounded-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Финансы</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderPayments orderId={orderId} order={order} setOrder={setOrder} />
                  </CardContent>
                </Card>

                {/* Доставки */}
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

                {/* История изменений */}
                {order.history && (
                  <Card className="rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle>Информация об изменениях</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OrderHistory order={order} />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        <div
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[112px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[112px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
        >
          <div
            onClick={() => setHideBottomTabbar(false)}
            className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronUp className="text-white w-5" />
          </div>

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

              <Button
                type="submit"
                disabled={isDeleting || isSubmitting}
                className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600 flex-1"
              >
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>

              {!isNewOrder && order && (
                <Button
                  type="button"
                  className="rounded-2xl px-3 py-4 bg-red-400 hover:bg-red-500"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}

              <Button
                onClick={() => setHideBottomTabbar(true)}
                type="button"
                className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            {!isNewOrder && order && (
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
        </div>
      </form>
    </div>
  );
};
