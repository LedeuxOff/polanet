import { Driver, DriverForm, driverSchema, TransportCard } from "@/lib/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { driversApi, transportCardsApi } from "@/lib/api/index";
import { useNavigate, useParams } from "@tanstack/react-router";
import { cleanPhone } from "@/lib/utils/phone";

/**
 * Конвертирует телефон из формата базы (79999999999) в формат маски (+7 (999) 999-99-99)
 */
function convertPhoneToMask(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }
  return phone;
}

export const useDriverDetailPage = () => {
  const { driverId } = useParams({ from: "/drivers/$driverId" });
  const navigate = useNavigate();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [transportCards, setTransportCards] = useState<TransportCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUnbindDialog, setShowUnbindDialog] = useState(false);
  const [isUnbinding, setIsUnbinding] = useState(false);

  const form = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
  });

  useEffect(() => {
    Promise.all([
      driversApi
        .get(Number(driverId))
        .then((data) => {
          setDriver(data);
          form.setValue("lastName", data.lastName);
          form.setValue("firstName", data.firstName);
          form.setValue("middleName", data.middleName || "");
          form.setValue("phone", convertPhoneToMask(data.phone));
          // Устанавливаем выбранную карту
          if (data.transportCard) {
            setSelectedCardId(String(data.transportCard.id));
          }
        })
        .catch(console.error),
      transportCardsApi
        .list()
        .then((cards) => {
          // Фильтруем карты которые не привязаны к водителю или привязаны к текущему
          const availableCards = cards.filter(
            (c) => !c.driverId || c.driverId === Number(driverId),
          );
          setTransportCards(availableCards);
        })
        .catch(console.error),
    ]).finally(() => setIsLoading(false));
  }, [driverId, form.setValue]);

  const onSubmit = async (data: DriverForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Сначала обновляем данные водителя
      const updateData: Record<string, unknown> = {};
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.middleName !== undefined) updateData.middleName = data.middleName;
      if (data.phone !== undefined)
        updateData.phone = data.phone ? cleanPhone(data.phone) : undefined;

      await driversApi.update(Number(driverId), updateData);

      // Затем обновляем привязку карты
      const newCardId = selectedCardId ? Number(selectedCardId) : null;

      // Если была карта и выбрали другую - отвязываем старую
      if (driver?.transportCard && newCardId && newCardId !== driver.transportCard.id) {
        await transportCardsApi.update(driver.transportCard.id, { driverId: null });
      }

      // Если выбрали новую карту - привязываем
      if (newCardId && (!driver?.transportCard || driver.transportCard.id !== newCardId)) {
        await transportCardsApi.update(newCardId, { driverId: Number(driverId) });
      }

      // Если отвязали карту (была, стало null)
      if (!newCardId && driver?.transportCard) {
        await transportCardsApi.update(driver.transportCard.id, { driverId: null });
      }

      navigate({ to: "/drivers" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnbindCard = async () => {
    if (!driver?.transportCard) return;

    setIsUnbinding(true);
    setError(null);
    try {
      await transportCardsApi.update(driver.transportCard.id, { driverId: null });
      setShowUnbindDialog(false);
      // Обновляем данные
      const updated = await driversApi.get(Number(driverId));
      setDriver(updated);
      setSelectedCardId("");

      // Обновляем список карт
      const cards = await transportCardsApi.list();
      const availableCards = cards.filter((c) => !c.driverId || c.driverId === Number(driverId));
      setTransportCards(availableCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отвязке карты");
    } finally {
      setIsUnbinding(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этого водителя?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await driversApi.delete(Number(driverId));
      navigate({ to: "/drivers" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    form,
    isLoading,
    driver,
    handleDelete,
    isDeleting,
    onSubmit,
    error,
    isSubmitting,
    showUnbindDialog,
    setShowUnbindDialog,
    isUnbinding,
    handleUnbindCard,
    transportCards,
    selectedCardId,
    setSelectedCardId,
  };
};
