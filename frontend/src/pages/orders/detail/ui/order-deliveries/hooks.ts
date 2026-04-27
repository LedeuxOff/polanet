import { carsApi, deliveriesApi, driversApi, ordersApi } from "@/lib/api";
import {
  Car,
  CreateDeliveryInput,
  Delivery,
  DeliveryForm,
  deliverySchema,
  Driver,
  Order,
  UpdateDeliveryInput,
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
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    Promise.all([
      deliveriesApi.list(Number(orderId)).then(setDeliveries).catch(console.error),
      driversApi.list().then(setDrivers).catch(console.error),
      carsApi.list().then(setCars).catch(console.error),
    ]).catch(console.error);
  }, []);

  const form = useForm<DeliveryForm>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "cash",
      isPaid: false,
      isPaymentBeforeUnloading: false,
    },
  });

  const handleEditDelivery = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setShowDeliveryDialog(true);
    // Получаем связанный доход для извлечения суммы и статуса оплаты
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
    });
  };

  const handleCancelDelivery = () => {
    setShowDeliveryDialog(false);
    setEditingDelivery(null);
    form.reset();
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
  };
};
