import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { teamsApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { FormBuilder } from "@/widgets/form-builder";
import { TeamForm, getTeamSections, teamFormSchema } from "../shared";
import { TeamPageHead } from "../detail/ui/team-page-head";
import { TeamMembersPicker } from "../detail/ui/team-members-picker";

export const NewTeamPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TeamForm>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: { name: "", status: "active" },
  });

  if (isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("teams:manage")) return <NoAccessScreen />;

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await teamsApi.create({
        name: data.name.trim(),
        isActive: data.status === "active",
        memberIds,
      });
      showToast("Бригада создана", "success");
      navigate({ to: "/teams" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при создании", "error");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex flex-col gap-4 pb-28">
      <TeamPageHead title="Создание" />
      <FormBuilder
        form={form}
        sections={getTeamSections(isSubmitting)}
        actions={{
          submit: { onSubmit: handleSubmit, isSubmitting, disabled: isSubmitting },
          back: () => navigate({ to: "/teams" }),
        }}
      />
      <TeamMembersPicker
        teamId={null}
        value={memberIds}
        onChange={setMemberIds}
        disabled={isSubmitting}
      />
    </div>
  );
};
