import { usersApi } from "@/lib/api";
import { rolesApi } from "@/lib/api/roles-api";
import { UserForm, userSchema } from "@/lib/types";
import { Role } from "@/lib/types/role-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useNewUserPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    rolesApi.list().then(setRoles).catch(console.error);
  }, []);

  const onSubmit = async (data: UserForm): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsSubmitting(true);
    try {
      await usersApi.create(data);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка при создании";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    error,
    isSubmitting,
    roles,
  };
};
