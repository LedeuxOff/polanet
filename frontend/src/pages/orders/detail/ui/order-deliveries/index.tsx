import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { useOrderDeliveries } from "./hooks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks";
import { AddDeliveryMobileModal } from "./ui/add-delivery-mobile-modal";
import { AddDeliveryDesktopModal } from "./ui/add-delivery-desktop-modal";
import { DeliveryDesktopItem } from "./ui/delivery-desktop-item";
import { DeliveryMobileItem } from "./ui/delivery-mobile-item";
import { DeliveriesPagination } from "./ui/deliveries-pagination";

interface Props {
  orderId: string;
  setOrder: Dispatch<SetStateAction<Order | null>>;
  order: Order;
  disabledByStatus: boolean;
}

const ITEMS_PER_PAGE = 3;

export const OrderDeliveries = ({ orderId, setOrder, order, disabledByStatus }: Props) => {
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
  } = useOrderDeliveries({ orderId, setOrder });

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(deliveries.length / ITEMS_PER_PAGE));
  }, [deliveries.length]);

  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return deliveries.slice(start, start + ITEMS_PER_PAGE);
  }, [deliveries, currentPage]);

  return (
    <>
      {deliveries.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="text-center text-muted-foreground py-8">
            Нет доставок. Нажмите "Добавить доставку" чтобы создать.
          </p>

          <Button
            type="button"
            onClick={() => {
              setShowDeliveryDialog(true);
              setEditingDelivery(null);
              form.reset();
            }}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={disabledByStatus}
          >
            Добавить доставку
          </Button>
        </div>
      ) : (
        <div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="deliveries">
              <AccordionTrigger className="text-base">
                Доставки ({deliveries.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  {paginatedDeliveries.map((delivery) => {
                    if (isMobile)
                      return (
                        <DeliveryMobileItem
                          key={delivery.id}
                          delivery={delivery}
                          handleCompleteDelivery={handleCompleteDelivery}
                          handleEditDelivery={handleEditDelivery}
                          disabledByStatus={disabledByStatus}
                          handleDeleteDelivery={handleDeleteDelivery}
                        />
                      );

                    return (
                      <DeliveryDesktopItem
                        key={delivery.id}
                        delivery={delivery}
                        handleCompleteDelivery={handleCompleteDelivery}
                        handleEditDelivery={handleEditDelivery}
                        disabledByStatus={disabledByStatus}
                        handleDeleteDelivery={handleDeleteDelivery}
                      />
                    );
                  })}

                  {totalPages > 1 && (
                    <DeliveriesPagination
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="w-full flex justify-end mt-4">
            <Button
              type="button"
              onClick={() => {
                setShowDeliveryDialog(true);
                setEditingDelivery(null);
                form.reset();
              }}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                order?.status === "completed" ||
                order?.status === "cancelled" ||
                order?.status === "archived"
              }
            >
              Добавить доставку
            </Button>
          </div>
        </div>
      )}

      {/* Модальное мобильное окно добавления/редактирования доставки */}
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
        />
      )}

      {/* Модальное десктоп окно добавления/редактирования доставки */}
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
        />
      )}
    </>
  );
};
