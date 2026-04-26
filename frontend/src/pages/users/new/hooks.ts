import { usersApi } from "@/lib/api";
import { rolesApi } from "@/lib/api/roles-api";
import { UserForm, userSchema } from "@/lib/types";
import { Role } from "@/lib/types/role-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useNewUserPage = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    rolesApi.list().then(setRoles).catch(console.error);
  }, []);

  const onSubmit = async (data: UserForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await usersApi.create(data);
      navigate({ to: "/users" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании");
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
