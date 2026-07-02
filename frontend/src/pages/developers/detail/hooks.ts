import { usersApi } from "@/lib/api";
import { User } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { cleanPhone } from "@/lib/utils/phone";
import { z } from "zod";

export const developerSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна"),
  firstName: z.string().min(1, "Имя обязательно"),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email("Некорректный email"),
  phone: z.string().optional(),
});

export type DeveloperForm = z.infer<typeof developerSchema>;

export const useDeveloperDetailPage = () => {
  const navigate = useNavigate();
  const { developerId } = useParams({ from: "/developers/$developerId" });

  const [developer, setDeveloper] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingPassword, setIsSendingPassword] = useState(false);
  const [isUnbindingTelegram, setIsUnbindingTelegram] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<DeveloperForm>({
    resolver: zodResolver(developerSchema),
  });

  useEffect(() => {
    usersApi
      .get(Number(developerId))
      .then(setDeveloper)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [developerId]);

  useEffect(() => {
    if (developer) {
      form.setValue("lastName", developer.lastName);
      form.setValue("firstName", developer.firstName);
      form.setValue("middleName", developer.middleName || "");
      form.setValue("birthDate", developer.birthDate || "");
      form.setValue("email", developer.email);
      form.setValue("phone", convertPhoneToMask(developer.phone));
    }
  }, [developer, form.setValue]);

  const onSubmit = async (data: DeveloperForm): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.middleName !== undefined) updateData.middleName = data.middleName;
      if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
      if (data.email) updateData.email = data.email;
      if (data.phone !== undefined)
        updateData.phone = data.phone ? cleanPhone(data.phone) : undefined;

      await usersApi.update(Number(developerId), updateData);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка при обновлении";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendPassword = async () => {
    setIsSendingPassword(true);
    setError(null);
    try {
      await usersApi.sendPassword(Number(developerId));
      alert("Новый пароль был отправлен в Telegram");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отправке пароля");
    } finally {
      setIsSendingPassword(false);
    }
  };

  const handleUnbindTelegram = async () => {
    setIsUnbindingTelegram(true);
    setError(null);
    try {
      await usersApi.unbindTelegram(Number(developerId));
      setDeveloper((prev) => (prev ? { ...prev, telegramChatId: null } : prev));
      alert("Telegram успешно отвязан");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отвязке Telegram");
    } finally {
      setIsUnbindingTelegram(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите безвозвратно удалить этого разработчика?")) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await usersApi.delete(Number(developerId));
      navigate({ to: "/developers" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении разработчика");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isLoading,
    developer,
    form,
    onSubmit,
    error,
    isSubmitting,
    isSendingPassword,
    handleSendPassword,
    isUnbindingTelegram,
    handleUnbindTelegram,
    isDeleting,
    handleDelete,
  };
};

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
