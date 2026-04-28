import { rolesApi } from "@/lib/api/roles-api";
import { NewRoleForm, newRoleSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useNewRolePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewRoleForm>({
    resolver: zodResolver(newRoleSchema),
  });

  const onSubmit = async (data: NewRoleForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await rolesApi.create(data);
      navigate({ to: "/roles" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    error,
    onSubmit,
  };
};
