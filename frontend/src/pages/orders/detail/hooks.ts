import { Order, OrderForm, orderSchema, getAvailableStatusTransitions } from "@/lib/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ordersApi } from "@/lib/api";

export const useOrderDetailPage = () => {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const navigate = useNavigate();
  const isNewOrder = orderId === "new";

  const [order, setOrder] = useState<Order | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
  });

  useEffect(() => {
    if (!isNewOrder) {
      ordersApi
        .get(Number(orderId))
        .then((data) => {
          setOrder(data);
          setOriginalStatus(data.status);
          form.setValue("type", data.type);
          form.setValue("address", data.address);
          form.setValue("payerLastName", data.payerLastName);
          form.setValue("payerFirstName", data.payerFirstName);
          form.setValue("payerMiddleName", data.payerMiddleName || "");
          form.setValue("payerPhone", data.payerPhone || "");
          form.setValue("receiverLastName", data.receiverLastName);
          form.setValue("receiverFirstName", data.receiverFirstName);
          form.setValue("receiverMiddleName", data.receiverMiddleName || "");
          form.setValue("receiverPhone", data.receiverPhone || "");
          form.setValue("dateTime", data.dateTime);
          form.setValue("hasPass", data.hasPass);
          form.setValue("addressComment", data.addressComment || "");
          form.setValue("status", data.status);
          form.setValue("clientId", data.clientId);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      form.setValue("status", "draft");
      form.setValue("hasPass", false);
      setOriginalStatus("draft");
    }
  }, [orderId, isNewOrder, form.setValue]);

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

  return {
    form,
    handleDelete,
    onSubmit,
    isNewOrder,
    order,
    originalStatus,
    isSubmitting,
    isLoading,
    error,
    isDeleting,
    orderId,
    setOrder,
  };
};
