import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Order,
  Client,
  Payment,
  OrderHistory,
  Delivery,
  CreateDeliveryInput,
  CreatePaymentInput,
  Driver,
  Car,
  UpdateDeliveryInput,
  Income,
} from "@/lib/types";
import { carsApi, clientsApi, deliveriesApi, driversApi, incomesApi, ordersApi } from "@/lib/api";

const orderSchema = z.object({
  type: z.enum(["delivery", "pickup"]),
  address: z.string().min(1, "Адрес обязателен"),
  cost: z.coerce.number().int().positive("Стоимость должна быть положительной"),
  payerLastName: z.string().min(1, "Фамилия плательщика обязательна"),
  payerFirstName: z.string().min(1, "Имя плательщика обязательно"),
  payerMiddleName: z.string().optional(),
  receiverLastName: z.string().min(1, "Фамилия приемщика обязательна"),
  receiverFirstName: z.string().min(1, "Имя приемщика обязательно"),
  receiverMiddleName: z.string().optional(),
  dateTime: z.string().min(1, "Дата и время обязательны"),
  hasPass: z.boolean().default(false),
  addressComment: z.string().optional(),
  status: z.enum(["new", "in_progress", "completed", "cancelled", "archived", "draft"]),
  paymentType: z.enum(["cash", "bank_transfer"]),
  clientId: z.coerce.number().optional().nullable(),
});

type OrderForm = z.infer<typeof orderSchema>;

const deliverySchema = z.object({
  driverId: z.coerce.number().positive("Водитель обязателен"),
  carId: z.coerce.number().positive("Автомобиль обязателен"),
  dateTime: z.string().min(1, "Дата и время обязательны"),
  amount: z.coerce.number().int().positive("Стоимость должна быть положительной"),
  volume: z.coerce.number().optional().nullable(),
  comment: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank_transfer"]).default("cash"),
  isPaid: z.boolean().default(false),
  isPaymentBeforeUnloading: z.boolean().default(false),
});

type DeliveryForm = z.infer<typeof deliverySchema>;

const paymentSchema = z.object({
  amount: z.coerce.number().int().positive("Сумма должна быть положительной"),
  paymentDate: z.string().min(1, "Дата обязательна"),
  type: z.enum(["prepayment", "transfer", "delivery"]),
  deliveryId: z.coerce.number().optional().nullable(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export const Route = createFileRoute("/orders/$orderId")({
  component: OrderDetailPage,
});

const statusLabels: Record<string, string> = {
  new: "Новая",
  in_progress: "Выполняется",
  completed: "Завершено",
  cancelled: "Отменено",
  archived: "Архив",
  draft: "Черновик",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "Не оплачено",
  paid: "Оплачено",
  partial: "Частично оплачено",
};

const typeLabels: Record<string, string> = {
  delivery: "Доставка",
  pickup: "Вывоз",
};

const paymentTypeLabels: Record<string, string> = {
  prepayment: "Предоплата",
  transfer: "Перевод средств",
  delivery: "Доставка",
};

const deliveryStatusLabels: Record<string, string> = {
  in_progress: "В процессе",
  completed: "Завершена",
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Наличные",
  bank_transfer: "Безналичный расчет",
};

const incomeTypeLabels: Record<string, string> = {
  prepayment: "Предоплата",
  delivery_payment: "Оплата доставки",
};

function OrderDetailPage() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const navigate = useNavigate();
  const isNewOrder = orderId === "new";

  const [order, setOrder] = React.useState<Order | null>(null);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [cars, setCars] = React.useState<Car[]>([]);
  const [deliveries, setDeliveries] = React.useState<Delivery[]>([]);
  const [incomes, setIncomes] = React.useState<Income[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Выплаты
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentType, setPaymentType] = React.useState<"prepayment" | "transfer" | "delivery">(
    "transfer",
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = React.useState<string>("");
  const [isAddingPayment, setIsAddingPayment] = React.useState(false);

  // Доставка
  const [showDeliveryDialog, setShowDeliveryDialog] = React.useState(false);
  const [editingDelivery, setEditingDelivery] = React.useState<Delivery | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
  });

  const {
    register: registerDelivery,
    handleSubmit: handleDeliverySubmit,
    formState: { errors: deliveryErrors },
    reset: resetDelivery,
    watch: watchDelivery,
    setValue: setDeliveryValue,
  } = useForm<DeliveryForm>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "cash",
      isPaid: false,
      isPaymentBeforeUnloading: false,
    },
  });

  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
    reset: resetPayment,
    watch: watchPayment,
    setValue: setPaymentValue,
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: "transfer",
    },
  });

  React.useEffect(() => {
    Promise.all([
      clientsApi.list().then(setClients).catch(console.error),
      driversApi.list().then(setDrivers).catch(console.error),
      carsApi.list().then(setCars).catch(console.error),
    ]).catch(console.error);

    if (!isNewOrder) {
      ordersApi
        .get(Number(orderId))
        .then((data) => {
          setOrder(data);
          setValue("type", data.type);
          setValue("address", data.address);
          setValue("cost", data.cost);
          setValue("payerLastName", data.payerLastName);
          setValue("payerFirstName", data.payerFirstName);
          setValue("payerMiddleName", data.payerMiddleName || "");
          setValue("receiverLastName", data.receiverLastName);
          setValue("receiverFirstName", data.receiverFirstName);
          setValue("receiverMiddleName", data.receiverMiddleName || "");
          setValue("dateTime", data.dateTime);
          setValue("hasPass", data.hasPass);
          setValue("addressComment", data.addressComment || "");
          setValue("status", data.status);
          setValue("paymentType", data.paymentType);
          setValue("clientId", data.clientId);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));

      // Загружаем доставки
      deliveriesApi.list(Number(orderId)).then(setDeliveries).catch(console.error);
      // Загружаем доходы
      incomesApi.list(Number(orderId)).then(setIncomes).catch(console.error);
    } else {
      setIsLoading(false);
      setValue("status", "draft");
      setValue("hasPass", false);
    }
  }, [orderId, isNewOrder, setValue]);

  const onSubmit = async (data: OrderForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      if (isNewOrder) {
        await ordersApi.create(data);
      } else {
        await ordersApi.update(Number(orderId), data);
      }
      navigate({ to: "/orders" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту заявку?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await ordersApi.delete(Number(orderId));
      navigate({ to: "/orders" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddPayment = async (data: PaymentForm) => {
    setError(null);
    setIsAddingPayment(true);
    try {
      const paymentData: CreatePaymentInput = {
        orderId: Number(orderId),
        amount: data.amount,
        paymentDate: data.paymentDate,
        type: data.type,
        deliveryId: data.type === "delivery" ? data.deliveryId : null,
      };
      await ordersApi.addPayment(Number(orderId), paymentData);
      setShowPaymentDialog(false);
      resetPayment();
      setPaymentAmount("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentType("transfer");
      setSelectedDeliveryId("");
      // Обновляем данные заявки
      const updated = await ordersApi.get(Number(orderId));
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при добавлении выплаты");
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleRemovePayment = async (paymentId: number) => {
    if (!confirm("Удалить эту выплату?")) {
      return;
    }

    try {
      await ordersApi.removePayment(Number(orderId), paymentId);
      const updated = await ordersApi.get(Number(orderId));
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении выплаты");
    }
  };

  const openPaymentDialog = () => {
    setShowPaymentDialog(true);
    resetPayment();
  };

  // Доставки
  const handleSaveDelivery = async (data: DeliveryForm) => {
    setError(null);
    try {
      if (editingDelivery) {
        const updateData: UpdateDeliveryInput = {
          driverId: data.driverId,
          carId: data.carId,
          dateTime: data.dateTime,
          amount: data.amount,
          volume: data.volume,
          comment: data.comment,
          paymentMethod: data.paymentMethod,
          isPaid: data.isPaid,
          isPaymentBeforeUnloading: data.isPaymentBeforeUnloading,
        };
        await deliveriesApi.update(editingDelivery.id, updateData);
      } else {
        const createData: CreateDeliveryInput = {
          orderId: Number(orderId),
          driverId: data.driverId,
          carId: data.carId,
          dateTime: data.dateTime,
          amount: data.amount,
          volume: data.volume,
          comment: data.comment,
          paymentMethod: data.paymentMethod,
          isPaid: data.isPaid,
          isPaymentBeforeUnloading: data.isPaymentBeforeUnloading,
        };
        await deliveriesApi.create(createData);
      }
      setShowDeliveryDialog(false);
      setEditingDelivery(null);
      resetDelivery();
      // Обновляем список доставок
      const updatedDeliveries = await deliveriesApi.list(Number(orderId));
      setDeliveries(updatedDeliveries);
      // Обновляем заявку для пересчета долгов
      const updated = await ordersApi.get(Number(orderId));
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении доставки");
    }
  };

  const handleEditDelivery = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setShowDeliveryDialog(true);
    // Получаем связанный доход для извлечения суммы и статуса оплаты
    const income = (delivery as any).income;
    resetDelivery({
      driverId: delivery.driverId,
      carId: delivery.carId,
      dateTime: delivery.dateTime,
      amount: income?.amount || 0,
      volume: delivery.volume || undefined,
      comment: delivery.comment || undefined,
      paymentMethod: delivery.paymentMethod,
      isPaid: income?.isPaid || false,
      isPaymentBeforeUnloading: delivery.isPaymentBeforeUnloading,
    });
  };

  const handleDeleteDelivery = async (deliveryId: number) => {
    if (!confirm("Удалить эту доставку?")) {
      return;
    }

    try {
      await deliveriesApi.delete(deliveryId);
      const updatedDeliveries = await deliveriesApi.list(Number(orderId));
      setDeliveries(updatedDeliveries);
      // Обновляем заявку для пересчета долгов
      const updated = await ordersApi.get(Number(orderId));
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении доставки");
    }
  };

  const handleCompleteDelivery = async (deliveryId: number) => {
    if (!confirm("Завершить эту доставку?")) {
      return;
    }

    try {
      await deliveriesApi.complete(deliveryId);
      const updatedDeliveries = await deliveriesApi.list(Number(orderId));
      setDeliveries(updatedDeliveries);
      // Обновляем заявку
      const updated = await ordersApi.get(Number(orderId));
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при завершении доставки");
    }
  };

  const handleCancelDelivery = () => {
    setShowDeliveryDialog(false);
    setEditingDelivery(null);
    resetDelivery();
  };

  const handleCancelPayment = () => {
    setShowPaymentDialog(false);
    resetPayment();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  const received = order?.received || 0;
  const completed = order?.completed || 0;
  const customerDebt = order?.customerDebt || 0;
  const companyDebt = order?.companyDebt || 0;

  return (
    <div className="space-y-6">
      {/* Основная форма заявки */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isNewOrder ? "Новая заявка" : `Заявка #${orderId}`}</CardTitle>
              {order && !isNewOrder && (
                <p className="text-sm text-muted-foreground mt-1">
                  {typeLabels[order.type]} • {order.address}
                </p>
              )}
            </div>
            {!isNewOrder && (
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Удаление..." : "Удалить"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {/* Тип и статус */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Тип заявки *</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(value: "delivery" | "pickup") => setValue("type", value)}
                >
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Доставка</SelectItem>
                    <SelectItem value="pickup">Вывоз</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус *</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(
                    value: "new" | "in_progress" | "completed" | "cancelled" | "archived" | "draft",
                  ) => setValue("status", value)}
                >
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="new">Новая</SelectItem>
                    <SelectItem value="in_progress">Выполняется</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                    <SelectItem value="archived">Архив</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Адрес и стоимость */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Адрес *</Label>
                <Textarea id="address" disabled={isSubmitting} {...register("address")} rows={2} />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Стоимость (₽) *</Label>
                <Input id="cost" type="number" disabled={isSubmitting} {...register("cost")} />
                {errors.cost && <p className="text-sm text-destructive">{errors.cost.message}</p>}
              </div>
            </div>

            {/* Плательщик */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Плательщик</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payerLastName">Фамилия *</Label>
                  <Input
                    id="payerLastName"
                    disabled={isSubmitting}
                    {...register("payerLastName")}
                  />
                  {errors.payerLastName && (
                    <p className="text-sm text-destructive">{errors.payerLastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payerFirstName">Имя *</Label>
                  <Input
                    id="payerFirstName"
                    disabled={isSubmitting}
                    {...register("payerFirstName")}
                  />
                  {errors.payerFirstName && (
                    <p className="text-sm text-destructive">{errors.payerFirstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payerMiddleName">Отчество</Label>
                  <Input
                    id="payerMiddleName"
                    disabled={isSubmitting}
                    {...register("payerMiddleName")}
                  />
                </div>
              </div>
            </div>

            {/* Приемщик */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Приемщик</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiverLastName">Фамилия *</Label>
                  <Input
                    id="receiverLastName"
                    disabled={isSubmitting}
                    {...register("receiverLastName")}
                  />
                  {errors.receiverLastName && (
                    <p className="text-sm text-destructive">{errors.receiverLastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiverFirstName">Имя *</Label>
                  <Input
                    id="receiverFirstName"
                    disabled={isSubmitting}
                    {...register("receiverFirstName")}
                  />
                  {errors.receiverFirstName && (
                    <p className="text-sm text-destructive">{errors.receiverFirstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiverMiddleName">Отчество</Label>
                  <Input
                    id="receiverMiddleName"
                    disabled={isSubmitting}
                    {...register("receiverMiddleName")}
                  />
                </div>
              </div>
            </div>

            {/* Дата и время */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateTime">Дата и время *</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  disabled={isSubmitting}
                  {...register("dateTime")}
                />
                {errors.dateTime && (
                  <p className="text-sm text-destructive">{errors.dateTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">Тип оплаты *</Label>
                <Select
                  value={watch("paymentType")}
                  onValueChange={(value: "cash" | "bank_transfer") =>
                    setValue("paymentType", value)
                  }
                >
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Выберите тип оплаты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Наличные</SelectItem>
                    <SelectItem value="bank_transfer">Безналичный расчет</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentType && (
                  <p className="text-sm text-destructive">{errors.paymentType.message}</p>
                )}
              </div>
            </div>

            {/* Пропуск и комментарий */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    {...register("hasPass")}
                    className="h-4 w-4"
                  />
                  Наличие пропуска
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressComment">Комментарий к адресу</Label>
                <Textarea
                  id="addressComment"
                  disabled={isSubmitting}
                  {...register("addressComment")}
                  rows={2}
                />
              </div>
            </div>

            {/* Клиент */}
            <div className="space-y-2">
              <Label htmlFor="clientId">Клиент</Label>
              <Select
                value={String(watch("clientId") || "")}
                onValueChange={(value) => setValue("clientId", value ? Number(value) : null)}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue placeholder="Не выбран" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.type === "individual"
                        ? `${client.lastName} ${client.firstName}`
                        : client.organizationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/orders" })}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Блок выплат и истории (только для существующих заявок) */}
      {!isNewOrder && order && (
        <>
          {/* Финансы */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Финансы</CardTitle>
                <Button onClick={openPaymentDialog}>Добавить выплату</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Стоимость заявки</p>
                  <p className="text-2xl font-bold">{order.cost} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Получено</p>
                  <p className="text-2xl font-bold text-green-600">{received} ₽</p>
                  <p className="text-xs text-muted-foreground mt-1">Сумма выплат от клиента</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Реализовано</p>
                  <p className="text-2xl font-bold text-blue-600">{completed} ₽</p>
                  <p className="text-xs text-muted-foreground mt-1">Сумма выполненных доставок</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                {customerDebt > 0 && (
                  <div className="p-4 border rounded-md bg-destructive/10">
                    <p className="text-sm text-muted-foreground">Долг клиента</p>
                    <p className="text-2xl font-bold text-destructive">{customerDebt} ₽</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Реализовано больше получено
                    </p>
                  </div>
                )}
                {companyDebt > 0 && (
                  <div className="p-4 border rounded-md bg-green-50">
                    <p className="text-sm text-muted-foreground">Долг компании</p>
                    <p className="text-2xl font-bold text-green-600">{companyDebt} ₽</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Получено больше реализовано
                    </p>
                  </div>
                )}
                {customerDebt === 0 && companyDebt === 0 && (
                  <div className="p-4 border rounded-md bg-green-50 col-span-2">
                    <p className="text-sm text-muted-foreground">Статус расчетов</p>
                    <p className="text-2xl font-bold text-green-600">Все расчеты завершены</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* История выплат */}
              {order.payments && order.payments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">История выплат</h4>
                  <div className="space-y-2">
                    {order.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{payment.amount} ₽</p>
                            <Badge variant="outline">{paymentTypeLabels[payment.type]}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.paymentDate).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePayment(payment.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Доходы */}
              {incomes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Доходы</h4>
                  <div className="space-y-2">
                    {incomes.map((income) => (
                      <div
                        key={income.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{income.amount} ₽</p>
                            <Badge variant="outline">{incomeTypeLabels[income.incomeType]}</Badge>
                            {income.isPaid && <Badge variant="secondary">Оплачен</Badge>}
                            {income.deliveryId && (
                              <Badge variant="outline">Доставка ID: {income.deliveryId}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(income.paymentDate).toLocaleDateString("ru-RU")}</span>
                            <span>{paymentMethodLabels[income.paymentMethod]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Модальное окно добавления выплаты */}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить выплату</DialogTitle>
                <DialogDescription>Заполните данные о выплате</DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePaymentSubmit(handleAddPayment)} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Сумма выплаты *</Label>
                  <Input id="paymentAmount" type="number" {...registerPayment("amount")} />
                  {paymentErrors.amount && (
                    <p className="text-sm text-destructive">{paymentErrors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Дата выплаты *</Label>
                  <Input id="paymentDate" type="date" {...registerPayment("paymentDate")} />
                  {paymentErrors.paymentDate && (
                    <p className="text-sm text-destructive">{paymentErrors.paymentDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentType">Тип выплаты *</Label>
                  <Select
                    value={watchPayment("type")}
                    onValueChange={(value: "prepayment" | "transfer" | "delivery") => {
                      setPaymentValue("type", value);
                      if (value !== "delivery") {
                        setPaymentValue("deliveryId", null);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepayment">Предоплата</SelectItem>
                      <SelectItem value="transfer">Перевод средств</SelectItem>
                      {deliveries.filter((d) => d.status === "in_progress").length > 0 && (
                        <SelectItem value="delivery">Доставка</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {paymentErrors.type && (
                    <p className="text-sm text-destructive">{paymentErrors.type.message}</p>
                  )}
                </div>

                {watchPayment("type") === "delivery" && (
                  <div className="space-y-2">
                    <Label htmlFor="deliveryId">Доставка *</Label>
                    <Select
                      value={String(watchPayment("deliveryId") || "")}
                      onValueChange={(value) => setPaymentValue("deliveryId", Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите доставку" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveries
                          .filter((d) => d.status === "in_progress")
                          .map((delivery) => (
                            <SelectItem key={delivery.id} value={String(delivery.id)}>
                              {new Date(delivery.dateTime).toLocaleDateString("ru-RU")} -{" "}
                              {delivery.incomeId ? "Доход ID: " + delivery.incomeId : "N/A"}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {paymentErrors.deliveryId && (
                      <p className="text-sm text-destructive">{paymentErrors.deliveryId.message}</p>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancelPayment}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isAddingPayment}>
                    {isAddingPayment ? "Добавление..." : "Добавить"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Доставки */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Доставки</CardTitle>
                <Button
                  onClick={() => {
                    setShowDeliveryDialog(true);
                    setEditingDelivery(null);
                    resetDelivery();
                  }}
                >
                  Добавить доставку
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {deliveries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Нет доставок. Нажмите "Добавить доставку" чтобы создать.
                </p>
              ) : (
                <div className="space-y-4">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="border rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant={delivery.status === "completed" ? "default" : "outline"}>
                            {deliveryStatusLabels[delivery.status]}
                          </Badge>
                          <Badge variant="secondary">
                            {paymentMethodLabels[delivery.paymentMethod]}
                          </Badge>
                          <span className="font-medium">
                            {new Date(delivery.dateTime).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {delivery.status === "in_progress" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCompleteDelivery(delivery.id)}
                            >
                              Завершить
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDelivery(delivery)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDelivery(delivery.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Объем: </span>
                          {delivery.volume ? `${delivery.volume} м³` : "N/A"}
                        </div>
                        {delivery.comment && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Комментарий: </span>
                            {delivery.comment}
                          </div>
                        )}
                      </div>

                      {delivery.isPaymentBeforeUnloading && (
                        <div className="flex gap-4 text-sm">
                          <Badge variant="secondary">Оплата до выгрузки</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Модальное окно добавления/редактирования доставки */}
          <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingDelivery ? "Редактирование доставки" : "Добавление доставки"}
                </DialogTitle>
                <DialogDescription>Заполните данные о доставке</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDeliverySubmit(handleSaveDelivery)} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Водитель *</Label>
                    <Select
                      value={String(watchDelivery("driverId") || "")}
                      onValueChange={(value) => setDeliveryValue("driverId", Number(value))}
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
                      value={String(watchDelivery("carId") || "")}
                      onValueChange={(value) => setDeliveryValue("carId", Number(value))}
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
                    <Input type="datetime-local" {...registerDelivery("dateTime")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Объем груза (м³)</Label>
                    <Input type="number" step="0.1" {...registerDelivery("volume")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Стоимость *</Label>
                    <Input type="number" {...registerDelivery("amount")} />
                    {deliveryErrors.amount && (
                      <p className="text-sm text-destructive">{deliveryErrors.amount.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Комментарий</Label>
                  <Textarea {...registerDelivery("comment")} rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Тип оплаты *</Label>
                    <Select
                      value={watchDelivery("paymentMethod")}
                      onValueChange={(value: "cash" | "bank_transfer") =>
                        setDeliveryValue("paymentMethod", value)
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
                    {deliveryErrors.paymentMethod && (
                      <p className="text-sm text-destructive">
                        {deliveryErrors.paymentMethod.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Checkbox
                        checked={watchDelivery("isPaid")}
                        onCheckedChange={(checked: boolean) => setDeliveryValue("isPaid", checked)}
                      />
                      Оплата произведена
                    </Label>
                    {deliveryErrors.isPaid && (
                      <p className="text-sm text-destructive">{deliveryErrors.isPaid.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Checkbox
                      checked={watchDelivery("isPaymentBeforeUnloading")}
                      onCheckedChange={(checked: boolean) =>
                        setDeliveryValue("isPaymentBeforeUnloading", checked)
                      }
                    />
                    Оплата до выгрузки
                  </Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancelDelivery}>
                    Отмена
                  </Button>
                  <Button type="submit">{editingDelivery ? "Сохранить" : "Добавить"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* История изменений */}
          {order.history && order.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История изменений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.history.map((item) => {
                    const userName = [
                      item.userLastName,
                      item.userFirstName && item.userFirstName.charAt(0) + ".",
                      item.userMiddleName && item.userMiddleName.charAt(0) + ".",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <div key={item.id} className="p-3 border rounded-md bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                item.action === "created"
                                  ? "default"
                                  : item.action === "status_changed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {item.action === "created" && "Создана"}
                              {item.action === "updated" && "Изменена"}
                              {item.action === "status_changed" && "Статус изменён"}
                              {item.action === "payment_added" && "Выплата добавлена"}
                              {item.action === "payment_removed" && "Выплата удалена"}
                              {item.action === "deleted" && "Удалена"}
                            </Badge>
                            {userName && <span className="text-sm font-medium">{userName}</span>}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        {item.fieldName && (
                          <p className="text-sm">
                            <span className="font-medium">{item.fieldName}:</span>{" "}
                            {item.oldValue && (
                              <span className="text-muted-foreground line-through">
                                {item.oldValue}
                              </span>
                            )}
                            {item.oldValue && item.newValue && " → "}
                            {item.newValue && <span className="font-medium">{item.newValue}</span>}
                          </p>
                        )}
                        {item.newValue && !item.fieldName && (
                          <p className="text-sm">{item.newValue}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default OrderDetailPage;
