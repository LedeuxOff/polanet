import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHeader } from "./ui/order-header";
import { NewOrderDetails } from "./ui/order-details";
import { NewOrderClient } from "./ui/order-client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MenuIcon } from "lucide-react";
import { useNewOrderPage } from "./hooks";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

export const NewOrderDetailPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { form, onSubmit, isSubmitting, error } = useNewOrderPage();

  return (
    <div className="flex flex-col gap-4 pb-32">
      {/* Шапка заявки */}
      <Card>
        <CardHeader>
          <OrderHeader />
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-6`}>
          <div className="flex flex-col gap-6 flex-1">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <NewOrderDetails form={form} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>

            {/* Информация о клиента */}
            <Card>
              <CardHeader>
                <CardTitle>Информация о клиенте</CardTitle>
              </CardHeader>
              <CardContent>
                <NewOrderClient form={form} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
        >
          <Button
            type="button"
            disabled={isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/orders" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {isMobile && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={() => setOpen(true)}
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
};
