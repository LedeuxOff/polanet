import { usersApi } from "@/lib/api";
import { UserForm, userSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { cleanPhone } from "@/lib/utils/phone";

export const useNewDeveloperPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      roleId: 1, // DEVELOPER role ID
    },
  });

  const onSubmit = async (data: UserForm): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        roleId: 1, // DEVELOPER role ID
        phone: data.phone ? cleanPhone(data.phone) : undefined,
      };
      await usersApi.create(payload);
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
  };
};
