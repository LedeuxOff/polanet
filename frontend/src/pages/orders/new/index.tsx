import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHeader } from "./ui/order-header";
import { NewOrderDetails } from "./ui/order-details";
import { NewOrderClient } from "./ui/order-client";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronUp, MenuIcon } from "lucide-react";
import { useNewOrderPage } from "./hooks";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";

export const NewOrderDetailPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { form, onSubmit, isSubmitting } = useNewOrderPage();

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Шапка заявки */}
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <OrderHeader />
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-6`}>
          <div className="flex flex-col gap-6 flex-1">
            {/* Основная информация */}
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <NewOrderDetails form={form} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>

            {/* Информация о клиента */}
            <Card className="rounded-2xl shadow-xl">
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
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[58px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[58px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
        >
          <div
            onClick={() => setHideBottomTabbar(false)}
            className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronUp className="text-white w-5" />
          </div>

          <Button
            type="button"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600 flex-1"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>

          <Button
            onClick={() => setHideBottomTabbar(true)}
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
