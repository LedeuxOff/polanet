import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Delivery, DeliveryWithIncome, Order } from "@/lib/types";
import { deliveryStatusLabels, incomeTypeLabels, paymentMethodLabels } from "../../consts";
import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrderDeliveries } from "./hooks";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useMemo } from "react";
import {
  BadgeRussianRuble,
  BadgeRussianRubleIcon,
  BanknoteIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  PencilIcon,
  RussianRubleIcon,
  TrashIcon,
  WeightIcon,
} from "lucide-react";

interface Props {
  orderId: string;
  setOrder: Dispatch<SetStateAction<Order | null>>;
}

const ITEMS_PER_PAGE = 3;

const getFormattedAmount = (amount: number | undefined) =>
  new Intl.NumberFormat("ru-RU").format(amount || 0);

export const OrderDeliveries = ({ orderId, setOrder }: Props) => {
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderDeliveryCard = (delivery: DeliveryWithIncome) => (
    <div key={delivery.id} className="flex flex-col gap-4 border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Badge
            className={
              delivery.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }
          >
            {deliveryStatusLabels[delivery.status]}
          </Badge>
          <Badge variant="outline">Номер доставки: {delivery.id}</Badge>
        </div>

        <div className="flex items-center gap-2">
          {delivery.status === "in_progress" && (
            <Button
              variant="default"
              size="sm"
              type="button"
              onClick={() => handleCompleteDelivery(delivery.id)}
              className="bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 flex items-center gap-2"
            >
              <BanknoteIcon /> Завершить
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleEditDelivery(delivery)}
            disabled={delivery.status === "completed"}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            type="button"
            size="sm"
            onClick={() => handleDeleteDelivery(delivery.id)}
            disabled={delivery.status === "completed"}
            className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <BadgeRussianRubleIcon className="w-4 h-4" />
            <span>{getFormattedAmount(delivery.income?.amount)} ₽</span>
            <span>{paymentMethodLabels[delivery.paymentMethod]}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <WeightIcon className="w-4 h-4" />
            <span>{delivery.volume ? `${delivery.volume} м³` : "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{new Date(delivery.dateTime).toLocaleString("ru-RU")}</span>
        </div>

        {delivery.isPaymentBeforeUnloading && (
          <div className="flex items-center gap-2 text-gray-600">
            <CheckIcon className="w-4 h-4" />
            <span>Оплата до выгрузки</span>
          </div>
        )}
      </div>

      {delivery.comment && (
        <div className="flex flex-col gap-2">
          <span>Комментарий</span>
          <span className="text-muted-foreground">{delivery.comment}</span>
        </div>
      )}
    </div>
  );

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
                  {paginatedDeliveries.map(renderDeliveryCard)}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="h-10 w-10 bg-zinc-800 text-white hover:bg-zinc-900 hover:text-white"
                        type="button"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md">
                        <span className="text-sm font-medium">{currentPage}</span>
                        <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 bg-zinc-800 text-white hover:bg-zinc-900 hover:text-white"
                        type="button"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
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
            >
              Добавить доставку
            </Button>
          </div>
        </div>
      )}

      {/* Модальное окно добавления/редактирования доставки */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDelivery ? "Редактирование доставки" : "Добавление доставки"}
            </DialogTitle>
            <DialogDescription>Заполните данные о доставке</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSaveDelivery)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Водитель *</Label>
                <Select
                  value={String(form.watch("driverId") || "")}
                  onValueChange={(value) => form.setValue("driverId", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите водителя" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={String(driver.id)}>
                        {driver.lastName} {driver.firstName} {driver.middleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Автомобиль *</Label>
                <Select
                  value={String(form.watch("carId") || "")}
                  onValueChange={(value) => form.setValue("carId", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите автомобиль" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={String(car.id)}>
                        {car.brand} ({car.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Дата и время *</Label>
                <Input type="datetime-local" {...form.register("dateTime")} />
              </div>

              <div className="space-y-2">
                <Label>Объем груза (м³)</Label>
                <Input type="number" step="0.1" {...form.register("volume")} />
              </div>

              <div className="space-y-2">
                <Label>Стоимость *</Label>
                <Input type="number" {...form.register("amount")} />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea {...form.register("comment")} rows={2} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Тип оплаты *</Label>
                <Select
                  value={form.watch("paymentMethod")}
                  onValueChange={(value: "cash" | "bank_transfer") =>
                    form.setValue("paymentMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип оплаты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Наличные</SelectItem>
                    <SelectItem value="bank_transfer">Безналичный расчет</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethod && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch("isPaid")}
                    onCheckedChange={(checked: boolean) => form.setValue("isPaid", checked)}
                  />
                  Оплата произведена
                </Label>
                {form.formState.errors.isPaid && (
                  <p className="text-sm text-destructive">{form.formState.errors.isPaid.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={form.watch("isPaymentBeforeUnloading")}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue("isPaymentBeforeUnloading", checked)
                  }
                />
                Оплата до выгрузки
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancelDelivery}>
                Отмена
              </Button>
              <Button type="button" onClick={form.handleSubmit(handleSaveDelivery)}>
                {editingDelivery ? "Сохранить" : "Добавить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
