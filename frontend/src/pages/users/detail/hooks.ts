import { usersApi } from "@/lib/api";
import { rolesApi } from "@/lib/api/roles-api";
import { useAuth } from "@/lib/contexts/auth-context";
import { User, UserForm, userSchema } from "@/lib/types";
import { Role } from "@/lib/types/role-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useUserDetailPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams({ from: "/users/$userId" });
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const onSubmit = async (data: UserForm) => {
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
      if (data.password) updateData.password = data.password;
      if (data.roleId) updateData.roleId = data.roleId;

      await usersApi.update(Number(userId), updateData);
      navigate({ to: "/users" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при обновлении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await usersApi.delete(Number(userId));
      navigate({ to: "/users" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isLoading,
    user,
    handleDelete,
    isDeleting,
    currentUser,
    form,
    onSubmit,
    error,
    isSubmitting,
    roles,
  };
};
