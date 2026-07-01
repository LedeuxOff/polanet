import { carsApi, deliveriesApi, driversApi, ordersApi, usersApi } from "@/lib/api";
import {
  Car,
  CreateDeliveryInput,
  Delivery,
  DeliveryForm,
  deliverySchema,
  Driver,
  Order,
  UpdateDeliveryInput,
  User,
} from "@/lib/types";
import type { CalendarDelivery } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const completeDeliverySchema = z.object({
  recipientType: z.enum(["employee", "driver"]).optional().nullable(),
  recipientId: z.coerce.number().optional().nullable(),
  comment: z.string().optional(),
});

export type DeliveryCompleteForm = z.infer<typeof completeDeliverySchema>;

export interface AddDeliveryData {
  selectedDate: Date;
  selectedHour: number;
  draggedDelivery?: CalendarDelivery;
}

interface Props {
  initialData?: AddDeliveryData;
  onDeliveryCreated: () => void;
}

export const useAddDelivery = ({ initialData, onDeliveryCreated }: Props) => {
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<CalendarDelivery | null>(null);
  const [initialDateTime, setInitialDateTime] = useState<string | undefined>(undefined);
  const [completingDelivery, setCompletingDelivery] = useState(false);

  // Separate state and form for the complete delivery modal
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isChangingRecipient, setIsChangingRecipient] = useState(false);
  const completeForm = useForm<DeliveryCompleteForm>({
    resolver: zodResolver(completeDeliverySchema),
    defaultValues: {
      recipientType: undefined,
      recipientId: undefined,
      comment: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      // Если перетаскиваем доставку, устанавливаем её как редактируемую
      if (initialData.draggedDelivery) {
        setEditingDelivery(initialData.draggedDelivery);
        setCompletingDelivery(false);
      } else {
        // Очищаем editingDelivery при создании новой доставки
        setEditingDelivery(null);
        setCompletingDelivery(false);
      }
      setShowDeliveryDialog(true);
      const dt = new Date(initialData.selectedDate);
      dt.setHours(initialData.selectedHour, 0, 0, 0);
      // Форматируем дату локально без конвертации в UTC
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      const hours = String(dt.getHours()).padStart(2, "0");
      const minutes = String(dt.getMinutes()).padStart(2, "0");
      setInitialDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersData, draftOrders, newOrders, inProgressOrders] = await Promise.all([
          usersApi.list({ limit: 100 }),
          ordersApi.list({ status: "draft" }),
          ordersApi.list({ status: "new" }),
          ordersApi.list({ status: "in_progress" }),
        ]);

        const [driversResponse, carsResponse] = await Promise.all([
          driversApi.list({ limit: 1000 }),
          carsApi.list(),
        ]);

        setDrivers(driversResponse.data || []);
        setCars(carsResponse.data || []);
        setUsers(usersData.data || []);

        // Объединяем заказы из всех статусов и убираем дубликаты
        const allOrders = [
          ...(draftOrders?.data || []),
          ...(newOrders?.data || []),
          ...(inProgressOrders?.data || []),
        ];
        const uniqueOrders = Array.from(
          new Map(allOrders.map((order) => [order.id, order])).values(),
        );
        setAvailableOrders(uniqueOrders);
      } catch {
        // Silently handle errors - empty arrays are fine
      }
    };

    fetchInitialData();
  }, []);

  const form = useForm<DeliveryForm>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "cash",
      isPaid: false,
      isPaymentBeforeUnloading: false,
      notifyClient: false,
      notifyDriver: false,
      recipientType: undefined,
      recipientId: undefined,
    },
  });

  // Set form values when editing a delivery
  useEffect(() => {
    if (editingDelivery) {
      // Если перетаскиваем доставку, используем новую дату из initialData
      let displayDate: Date;
      if (initialData?.draggedDelivery && initialData.selectedDate) {
        // Сохраняем оригинальное время доставки, но меняем дату
        const origTime = new Date(editingDelivery.dateTime);
        displayDate = new Date(initialData.selectedDate);
        displayDate.setHours(origTime.getHours(), origTime.getMinutes(), origTime.getSeconds());
      } else {
        displayDate = new Date(editingDelivery.dateTime);
      }

      const year = displayDate.getFullYear();
      const month = String(displayDate.getMonth() + 1).padStart(2, "0");
      const day = String(displayDate.getDate()).padStart(2, "0");
      const hours = String(displayDate.getHours()).padStart(2, "0");
      const minutes = String(displayDate.getMinutes()).padStart(2, "0");

      // Get isPaid and amount from the related income if available
      const isPaid = editingDelivery.income?.isPaid ?? false;
      const amount = editingDelivery.income?.amount ?? editingDelivery.amount ?? 0;

      form.reset({
        orderId: editingDelivery.orderId,
        driverId: editingDelivery.driverId,
        carId: editingDelivery.carId,
        dateTime: `${year}-${month}-${day}T${hours}:${minutes}`,
        amount: amount,
        volume: editingDelivery.volume ?? undefined,
        comment: editingDelivery.comment ?? undefined,
        paymentMethod: editingDelivery.paymentMethod,
        isPaid: isPaid,
        isPaymentBeforeUnloading: editingDelivery.isPaymentBeforeUnloading,
        notifyClient: editingDelivery.notifyClient,
        notifyDriver: editingDelivery.notifyDriver,
        recipientType: editingDelivery.recipientType ?? undefined,
        recipientId: editingDelivery.recipientId ?? undefined,
      });
    }
  }, [editingDelivery, form, initialData]);

  useEffect(() => {
    if (initialDateTime && showDeliveryDialog && !editingDelivery) {
      form.setValue("dateTime", initialDateTime);
    }
  }, [initialDateTime, showDeliveryDialog, editingDelivery, form]);

  const handleCancelDelivery = () => {
    setShowDeliveryDialog(false);
    setEditingDelivery(null);
    form.reset();
    setInitialDateTime(undefined);
  };

  const handleEditDelivery = (delivery: CalendarDelivery) => {
    setEditingDelivery(delivery);
    setShowDeliveryDialog(true);
  };

  const handleSaveDelivery = async (data: DeliveryForm) => {
    setError(null);
    try {
      if (editingDelivery) {
        // Update existing delivery
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
          notifyClient: data.notifyClient,
          notifyDriver: data.notifyDriver,
          recipientType: data.recipientType,
          recipientId: data.recipientId,
        };
        await deliveriesApi.update(editingDelivery.id, updateData);

        // Если режим завершения доставки, автоматически завершаем её
        if (completingDelivery) {
          await deliveriesApi.complete(editingDelivery.id);
        }
      } else {
        // Create new delivery
        const createData: CreateDeliveryInput = {
          orderId: data.orderId!,
          driverId: data.driverId,
          carId: data.carId,
          dateTime: data.dateTime,
          amount: data.amount,
          volume: data.volume,
          comment: data.comment,
          paymentMethod: data.paymentMethod,
          isPaid: data.isPaid,
          isPaymentBeforeUnloading: data.isPaymentBeforeUnloading,
          notifyClient: data.notifyClient,
          notifyDriver: data.notifyDriver,
          recipientType: data.recipientType,
          recipientId: data.recipientId,
        };
        await deliveriesApi.create(createData);
      }
      setShowDeliveryDialog(false);
      setEditingDelivery(null);
      setCompletingDelivery(false);
      form.reset();
      setInitialDateTime(undefined);
      onDeliveryCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении доставки");
    }
  };

  const handleChangeRecipient = () => {
    if (!editingDelivery) return;

    // Get recipient data from income (nested object)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const income = (editingDelivery as any).income;
    const currentRecipientType = income?.recipientType || null;
    const currentRecipientId = income?.recipientId || null;

    // Устанавливаем флаг что мы меняем получателя
    setIsChangingRecipient(true);

    // Открываем модальное окно для смены получателя
    setShowCompleteDialog(true);
    completeForm.reset({
      recipientType: currentRecipientType || undefined,
      recipientId: currentRecipientId || undefined,
      comment: editingDelivery.comment || "",
    });
  };

  const handleCompleteDelivery = async () => {
    if (!editingDelivery) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const income = (editingDelivery as any).income;
    const isPaid = income?.isPaid || false;

    // Устанавливаем флаг что мы не меняем получателя (а завершаем доставку)
    setIsChangingRecipient(false);

    // Открываем отдельное модальное окно для выбора получателя при завершении доставки
    setShowCompleteDialog(true);
    // Устанавливаем значения формы для редактирования
    completeForm.reset({
      recipientType: editingDelivery.recipientType || undefined,
      recipientId: editingDelivery.recipientId || undefined,
      comment: editingDelivery.comment || "",
    });
  };

  const handleSaveComplete = async (data: DeliveryCompleteForm) => {
    if (!editingDelivery) return;

    try {
      // Обновляем доставку с данными получателя
      const updateData: UpdateDeliveryInput = {
        recipientType: data.recipientType,
        recipientId: data.recipientId,
      };
      await deliveriesApi.update(editingDelivery.id, updateData);

      // Проверяем, завершена ли доставка - если нет и мы не просто меняем получателя, завершаем её
      if (editingDelivery.status !== "completed" && !isChangingRecipient) {
        await deliveriesApi.complete(editingDelivery.id);
      }

      setShowCompleteDialog(false);

      // Если мы просто меняем получателя, закрываем все модальные окна и обновляем данные
      if (isChangingRecipient) {
        setIsChangingRecipient(false);
        setShowDeliveryDialog(false);
        setEditingDelivery(null);
        completeForm.reset();
        // Обновляем список доставок с сервера, чтобы показать новые данные получателя
        onDeliveryCreated();
        return;
      }

      setEditingDelivery(null);
      completeForm.reset();
      onDeliveryCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении доставки");
    }
  };

  const handleCancelComplete = () => {
    setShowCompleteDialog(false);
    setIsChangingRecipient(false);
    completeForm.reset();
  };

  return {
    showDeliveryDialog,
    setShowDeliveryDialog,
    form,
    error,
    editingDelivery,
    handleCancelDelivery,
    handleEditDelivery,
    handleSaveDelivery,
    handleCompleteDelivery,
    handleChangeRecipient,
    drivers,
    cars,
    availableOrders,
    users,
    setEditingDelivery,
    completingDelivery,
    setCompletingDelivery,
    // Complete delivery modal
    showCompleteDialog,
    setShowCompleteDialog,
    isChangingRecipient,
    completeForm,
    handleSaveComplete,
    handleCancelComplete,
  };
};
