import { usersApi, transportCardsApi } from "@/lib/api";
import { rolesApi } from "@/lib/api/roles-api";
import { User, UserForm, userSchema } from "@/lib/types";
import { Role } from "@/lib/types/role-types";
import { TransportCard } from "@/lib/types/transport-card-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
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

export const useUserDetailPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams({ from: "/users/$userId" });

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingPassword, setIsSendingPassword] = useState(false);
  const [isUnbindingTelegram, setIsUnbindingTelegram] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Transport card state
  const [availableCards, setAvailableCards] = useState<TransportCard[]>([]);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const [isAttachingCard, setIsAttachingCard] = useState(false);
  const [isDetachingCard, setIsDetachingCard] = useState(false);

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    Promise.all([
      usersApi.get(Number(userId)).then(setUser).catch(console.error),
      rolesApi.listAll().then(setRoles).catch(console.error),
    ]).finally(() => setIsLoading(false));
  }, [userId]);

  useEffect(() => {
    if (user) {
      form.setValue("lastName", user.lastName);
      form.setValue("firstName", user.firstName);
      form.setValue("middleName", user.middleName || "");
      form.setValue("birthDate", user.birthDate || "");
      form.setValue("email", user.email);
      form.setValue("phone", convertPhoneToMask(user.phone));
      form.setValue("roleId", user.roleId);
    }
  }, [user, form.setValue]);

  // Load available cards (not attached to any user)
  const loadAvailableCards = useCallback(async () => {
    try {
      const [cardsResponse, usersResponse] = await Promise.all([
        transportCardsApi.list({ limit: 1000 }),
        usersApi.list({ limit: 10000 }),
      ]);

      // Get all card IDs that are attached to any user
      const attachedCardIds = new Set(
        usersResponse.data
          .filter((u) => u.transportCardId !== null && u.transportCardId !== undefined)
          .map((u) => u.transportCardId as number),
      );

      // Filter out cards that are already attached to users
      const available = cardsResponse.data.filter((card) => !attachedCardIds.has(card.id));

      setAvailableCards(available);
    } catch (err) {
      console.error("Failed to load available cards:", err);
    }
  }, []);

  // Refresh current user data from the server
  const refreshUser = useCallback(async () => {
    try {
      const response = await usersApi.get(Number(userId));
      setUser(response);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, [userId]);

  // Load available cards on mount
  useEffect(() => {
    loadAvailableCards();
  }, [loadAvailableCards]);

  const onSubmit = async (data: UserForm): Promise<{ success: boolean; error?: string }> => {
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
      if (data.roleId) updateData.roleId = data.roleId;

      await usersApi.update(Number(userId), updateData);
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
      await usersApi.sendPassword(Number(userId));
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
      await usersApi.unbindTelegram(Number(userId));
      setUser((prev) => (prev ? { ...prev, telegramChatId: null } : prev));
      alert("Telegram успешно отвязан");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отвязке Telegram");
    } finally {
      setIsUnbindingTelegram(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите безвозвратно удалить этого пользователя?")) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await usersApi.delete(Number(userId));
      navigate({ to: "/users" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении пользователя");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAttachCard = async (cardId: number) => {
    if (!user) return;
    setIsAttachingCard(true);
    setError(null);
    try {
      // Update user with transportCardId
      await usersApi.update(user.id, { transportCardId: cardId });
      // Refresh user data from server
      await refreshUser();
      // Reload available cards to update the list
      await loadAvailableCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при привязке карты");
    } finally {
      setIsAttachingCard(false);
    }
  };

  const handleDetachCard = async () => {
    if (!user) return;
    setIsDetachingCard(true);
    setError(null);
    try {
      // Update user to remove transportCardId
      await usersApi.update(user.id, { transportCardId: null });
      // Refresh user data from server
      await refreshUser();
      // Reload available cards to update the list
      await loadAvailableCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отвязке карты");
    } finally {
      setIsDetachingCard(false);
    }
  };

  return {
    isLoading,
    user,
    form,
    onSubmit,
    error,
    isSubmitting,
    roles,
    isSendingPassword,
    handleSendPassword,
    isUnbindingTelegram,
    handleUnbindTelegram,
    isDeleting,
    handleDelete,
    // Transport card
    availableCards,
    isFetchingCards,
    isAttachingCard,
    isDetachingCard,
    handleAttachCard,
    handleDetachCard,
  };
};
