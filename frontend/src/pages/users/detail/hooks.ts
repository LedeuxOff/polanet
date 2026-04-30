import { usersApi } from "@/lib/api";
import { rolesApi } from "@/lib/api/roles-api";
import { User, UserForm, userSchema } from "@/lib/types";
import { Role } from "@/lib/types/role-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useUserDetailPage = () => {
  const { userId } = useParams({ from: "/users/$userId" });

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingPassword, setIsSendingPassword] = useState(false);

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    Promise.all([
      usersApi.get(Number(userId)).then(setUser).catch(console.error),
      rolesApi.list().then(setRoles).catch(console.error),
    ]).finally(() => setIsLoading(false));
  }, [userId]);

  useEffect(() => {
    if (user) {
      form.setValue("lastName", user.lastName);
      form.setValue("firstName", user.firstName);
      form.setValue("middleName", user.middleName || "");
      form.setValue("birthDate", user.birthDate || "");
      form.setValue("email", user.email);
      form.setValue("phone", user.phone || "");
      form.setValue("roleId", user.roleId);
    }
  }, [user, form.setValue]);

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
      if (data.phone !== undefined) updateData.phone = data.phone;
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
      alert("Новый пароль был отправлен на указанный номер телефона");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отправке пароля");
    } finally {
      setIsSendingPassword(false);
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
  };
};
