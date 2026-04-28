import { rolesApi } from "@/lib/api/roles-api";
import { Role, RoleForm, roleSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useRoleDetailPage = () => {
  const { roleId } = useParams({ from: "/roles/$roleId" });
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    rolesApi
      .get(Number(roleId))
      .then((data) => {
        setRole(data);
        form.setValue("code", data.code);
        form.setValue("name", data.name);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [roleId, form.setValue]);

  const onSubmit = async (data: RoleForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (data.code) updateData.code = data.code;
      if (data.name) updateData.name = data.name;

      await rolesApi.update(Number(roleId), updateData);
      navigate({ to: "/roles" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при обновлении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту роль?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await rolesApi.delete(Number(roleId));
      navigate({ to: "/roles" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  return { isLoading, role, handleDelete, isDeleting, form, onSubmit, error, isSubmitting };
};
