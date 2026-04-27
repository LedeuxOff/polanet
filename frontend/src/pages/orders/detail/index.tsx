import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHeader } from "./ui/order-header";
import { OrderDetails } from "./ui/order-details";
import { OrderClient } from "./ui/order-client";
import { OrderPayments } from "./ui/order-payments";
import { OrderDeliveries } from "./ui/order-deliveries";
import { OrderHistory } from "./ui/order-history";
import { Button } from "@/components/ui/button";
import { ChevronLeft, TrashIcon } from "lucide-react";
import { useOrderDetailPage } from "./hooks";

export const OrderDetailPage = () => {
  const navigate = useNavigate();
  const {
    form,
    handleDelete,
    onSubmit,
    isNewOrder,
    order,
    isSubmitting,
    isLoading,
    error,
    isDeleting,
    orderId,
    setOrder,
  } = useOrderDetailPage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Шапка заявки */}
      <Card>
        <CardHeader>
          <OrderHeader isNewOrder={isNewOrder} orderId={orderId} order={order} />
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-6">
          <div className="flex flex-col gap-6 flex-1">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderDetails form={form} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>

            {/* Информация о клиента */}
            <Card>
              <CardHeader>
                <CardTitle>Информация о клиенте</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderClient form={form} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            {!isNewOrder && order && (
              <>
                {/* Финансы */}
                <Card>
                  <CardHeader>
                    <CardTitle>Финансы</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderPayments orderId={orderId} order={order} setOrder={setOrder} />
                  </CardContent>
                </Card>

                {/* Доставки */}
                <Card>
                  <CardHeader>
                    <CardTitle>Информация о доставках</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderDeliveries orderId={orderId} setOrder={setOrder} />
                  </CardContent>
                </Card>

                {/* История изменений */}
                {order.history && (
                  <Card>
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

        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Button
            type="button"
            disabled={isDeleting || isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/orders" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {!isNewOrder && order && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="submit"
            disabled={isDeleting || isSubmitting}
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
};
