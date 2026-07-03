import { carsApi, deliveriesApi, ordersApi, usersApi } from "@/lib/api";
import {
  Car,
  CreateDeliveryInput,
  Delivery,
  DeliveryForm,
  deliverySchema,
  Order,
  UpdateDeliveryInput,
  User,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  orderId: string;
  setOrder: Dispatch<SetStateAction<Order | null>>;
}

export const useOrderDeliveries = ({ orderId, setOrder }: Props) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [completingDelivery, setCompletingDelivery] = useState(false);

  useEffect(() => {
    Promise.all([
      deliveriesApi.list(Number(orderId)).then(setDeliveries).catch(console.error),
      usersApi
        .list({ roleCode: "DRIVER", limit: 1000 })
        .then((res) => setDrivers(res.data || []))
        .catch(console.error),
      carsApi
        .list()
        .then((res) => setCars(res.data || []))
        .catch(console.error),
      usersApi
        .list({ limit: 100 })
        .then((res) => setUsers(res.data || []))
        .catch(console.error),
    ]).catch(console.error);
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
      recipientId: undefined,
    },
  });

  const handleEditDelivery = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setShowDeliveryDialog(true);
    // Получаем связанный доход для извлечения суммы и статуса оплаты
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const income = (delivery as any).income;
    form.reset({
      driverId: delivery.driverId,
      carId: delivery.carId,
      dateTime: delivery.dateTime,
      amount: income?.amount || 0,
      volume: delivery.volume || undefined,
      comment: delivery.comment || undefined,
      paymentMethod: delivery.paymentMethod,
      isPaid: income?.isPaid || false,
      isPaymentBeforeUnloading: delivery.isPaymentBeforeUnloading,
      notifyClient: delivery.notifyClient,
      notifyDriver: delivery.notifyDriver,
      recipientId: delivery.recipientId || undefined,
    });
  };

  const handleCancelDelivery = () => {
    setShowDeliveryDialog(false);
    setEditingDelivery(null);
    form.reset();
  };

  const handleCompleteDelivery = async (delivery: Delivery) => {
    // Всегда открываем модальное окно для выбора получателя при завершении доставки
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const income = (delivery as any).income;
    const isPaid = income?.isPaid || false;

    setEditingDelivery(delivery);
    setCompletingDelivery(true);
    setShowDeliveryDialog(true);
    // Устанавливаем значения формы для редактирования
    form.reset({
      driverId: delivery.driverId,
      carId: delivery.carId,
      dateTime: delivery.dateTime,
      amount: income?.amount || delivery.amount || 0,
      volume: delivery.volume || undefined,
      comment: delivery.comment || undefined,
      paymentMethod: delivery.paymentMethod,
      isPaid: isPaid,
      isPaymentBeforeUnloading: delivery.isPaymentBeforeUnloading,
      notifyClient: delivery.notifyClient,
      notifyDriver: delivery.notifyDriver,
      recipientId: delivery.recipientId || undefined,
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
          notifyClient: data.notifyClient,
          notifyDriver: data.notifyDriver,
          recipientId: data.recipientId,
        };
        await deliveriesApi.update(editingDelivery.id, updateData);

        // Если режим завершения доставки, автоматически завершаем её
        if (completingDelivery) {
          await deliveriesApi.complete(editingDelivery.id);
        }
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
          notifyClient: data.notifyClient,
          notifyDriver: data.notifyDriver,
          recipientId: data.recipientId,
        };
        await deliveriesApi.create(createData);
      }
      setShowDeliveryDialog(false);
      setEditingDelivery(null);
      setCompletingDelivery(false);
      form.reset();
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

  return {
    deliveries,
    handleCompleteDelivery,
    error,
    handleCancelDelivery,
    handleEditDelivery,
    handleDeleteDelivery,
    showDeliveryDialog,
    setShowDeliveryDialog,
    editingDelivery,
    form,
    handleSaveDelivery,
    drivers,
    cars,
    setEditingDelivery,
    users,
    completingDelivery,
    setCompletingDelivery,
  };
};
