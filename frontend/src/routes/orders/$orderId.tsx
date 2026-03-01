import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
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
import { api } from "@/lib/api";
import type {
  Order,
  Client,
  Driver,
  Car,
  Payment,
  OrderHistory,
} from "@/lib/types";

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
  status: z.enum([
    "new",
    "in_progress",
    "completed",
    "cancelled",
    "archived",
    "draft",
  ]),
  paymentType: z.enum(["cash", "bank_transfer"]),
  clientId: z.coerce.number().optional().nullable(),
  driverId: z.coerce.number().optional().nullable(),
  carId: z.coerce.number().optional().nullable(),
});

type OrderForm = z.infer<typeof orderSchema>;

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

function OrderDetailPage() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const navigate = useNavigate();

  const [order, setOrder] = React.useState<Order | null>(null);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [cars, setCars] = React.useState<Car[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Выплаты
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [isAddingPayment, setIsAddingPayment] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
  });

  React.useEffect(() => {
    Promise.all([
      api.clients.list().then(setClients).catch(console.error),
      api.drivers.list().then(setDrivers).catch(console.error),
      api.cars.list().then(setCars).catch(console.error),
    ]).catch(console.error);

    api.orders
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
        setValue("driverId", data.driverId);
        setValue("carId", data.carId);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderId, setValue]);

  const onSubmit = async (data: OrderForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await api.orders.update(Number(orderId), data);
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
      await api.orders.delete(Number(orderId));
      navigate({ to: "/orders" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || !paymentDate) {
      setError("Укажите сумму и дату выплаты");
      return;
    }

    setIsAddingPayment(true);
    try {
      await api.orders.addPayment(Number(orderId), {
        orderId: Number(orderId),
        amount: Number(paymentAmount),
        paymentDate,
      });
      setPaymentAmount("");
      // Обновляем данные заявки
      const updated = await api.orders.get(Number(orderId));
      setOrder(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при добавлении выплаты",
      );
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleRemovePayment = async (paymentId: number) => {
    if (!confirm("Удалить эту выплату?")) {
      return;
    }

    try {
      await api.orders.removePayment(Number(orderId), paymentId);
      // Обновляем данные заявки
      const updated = await api.orders.get(Number(orderId));
      setOrder(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при удалении выплаты",
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка...
        </CardContent>
      </Card>
    );
  }

  const totalPaid = order?.totalPaid || 0;
  const debt = order?.debt || (order?.cost || 0) - totalPaid;

  return (
    <div className="space-y-6">
      {/* Основная форма */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Заявка #{orderId}</CardTitle>
              {order && (
                <p className="text-sm text-muted-foreground mt-1">
                  {typeLabels[order.type]} • {order.address}
                </p>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </Button>
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
                  onValueChange={(value) => setValue("type", value)}
                >
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Доставка</SelectItem>
                    <SelectItem value="pickup">Вывоз</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус *</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) => setValue("status", value)}
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
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            {/* Адрес и стоимость */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Адрес *</Label>
                <Textarea
                  id="address"
                  disabled={isSubmitting}
                  {...register("address")}
                  rows={2}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Стоимость (₽) *</Label>
                <Input
                  id="cost"
                  type="number"
                  disabled={isSubmitting}
                  {...register("cost")}
                />
                {errors.cost && (
                  <p className="text-sm text-destructive">
                    {errors.cost.message}
                  </p>
                )}
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
                    <p className="text-sm text-destructive">
                      {errors.payerLastName.message}
                    </p>
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
                    <p className="text-sm text-destructive">
                      {errors.payerFirstName.message}
                    </p>
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
                    <p className="text-sm text-destructive">
                      {errors.receiverLastName.message}
                    </p>
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
                    <p className="text-sm text-destructive">
                      {errors.receiverFirstName.message}
                    </p>
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
                  <p className="text-sm text-destructive">
                    {errors.dateTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">Тип оплаты *</Label>
                <Select
                  value={watch("paymentType")}
                  onValueChange={(value) => setValue("paymentType", value)}
                >
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Выберите тип оплаты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Наличные</SelectItem>
                    <SelectItem value="bank_transfer">
                      Безналичный расчет
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentType && (
                  <p className="text-sm text-destructive">
                    {errors.paymentType.message}
                  </p>
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

            {/* Связи */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Исполнители</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Клиент</Label>
                  <Select
                    value={String(watch("clientId") || "")}
                    onValueChange={(value) =>
                      setValue("clientId", value ? Number(value) : null)
                    }
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

                <div className="space-y-2">
                  <Label htmlFor="driverId">Водитель</Label>
                  <Select
                    value={String(watch("driverId") || "")}
                    onValueChange={(value) =>
                      setValue("driverId", value ? Number(value) : null)
                    }
                  >
                    <SelectTrigger disabled={isSubmitting}>
                      <SelectValue placeholder="Не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={String(driver.id)}>
                          {driver.lastName} {driver.firstName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carId">Автомобиль</Label>
                  <Select
                    value={String(watch("carId") || "")}
                    onValueChange={(value) =>
                      setValue("carId", value ? Number(value) : null)
                    }
                  >
                    <SelectTrigger disabled={isSubmitting}>
                      <SelectValue placeholder="Не выбран" />
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
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/orders" })}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Блок выплат и истории */}
      {order && (
        <>
          {/* Финансы */}
          <Card>
            <CardHeader>
              <CardTitle>Финансы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Стоимость</p>
                  <p className="text-2xl font-bold">{order.cost} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Выплачено</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalPaid} ₽
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Долг</p>
                  <p
                    className={`text-2xl font-bold ${debt > 0 ? "text-destructive" : "text-green-600"}`}
                  >
                    {debt > 0 ? `${debt} ₽` : "Нет"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Добавление выплаты */}
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="paymentAmount">Сумма выплаты</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="paymentDate">Дата выплаты</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddPayment}
                  disabled={isAddingPayment || !paymentAmount}
                >
                  {isAddingPayment ? "Добавление..." : "Добавить выплату"}
                </Button>
              </div>

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
                          <p className="font-medium">{payment.amount} ₽</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "ru-RU",
                            )}
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
            </CardContent>
          </Card>

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
                      item.userMiddleName &&
                        item.userMiddleName.charAt(0) + ".",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <div
                        key={item.id}
                        className="p-3 border rounded-md bg-muted/50"
                      >
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
                              {item.action === "status_changed" &&
                                "Статус изменён"}
                              {item.action === "payment_added" &&
                                "Выплата добавлена"}
                              {item.action === "payment_removed" &&
                                "Выплата удалена"}
                              {item.action === "deleted" && "Удалена"}
                            </Badge>
                            {userName && (
                              <span className="text-sm font-medium">
                                {userName}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        {item.fieldName && (
                          <p className="text-sm">
                            <span className="font-medium">
                              {item.fieldName}:
                            </span>{" "}
                            {item.oldValue && (
                              <span className="text-muted-foreground line-through">
                                {item.oldValue}
                              </span>
                            )}
                            {item.oldValue && item.newValue && " → "}
                            {item.newValue && (
                              <span className="font-medium">
                                {item.newValue}
                              </span>
                            )}
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
