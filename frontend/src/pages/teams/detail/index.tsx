import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { PageError } from "@/components/screens/error";
import { teamsApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import type { TeamDetail } from "@/lib/types";
import { FormBuilder } from "@/widgets/form-builder";
import { TeamForm, getTeamSections, teamFormSchema } from "../shared";
import { TeamPageHead } from "./ui/team-page-head";
import { TeamMembersPicker } from "./ui/team-members-picker";

export const TeamDetailPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams({ from: "/teams/$teamId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<TeamForm>({ resolver: zodResolver(teamFormSchema) });

  useEffect(() => {
    setIsLoading(true);
    teamsApi
      .get(Number(teamId))
      .then((data) => {
        setTeam(data);
        setMemberIds(data.members.map((m) => m.id));
        form.reset({ name: data.name, status: data.isActive ? "active" : "inactive" });
      })
      .catch(() => setTeam(null))
      .finally(() => setIsLoading(false));
  }, [teamId, form]);

  if (isLoading || isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("teams:detail")) return <NoAccessScreen />;
  if (!team) return <PageError />;

  const canManage = hasPermission("teams:manage");

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!canManage) {
      showToast("У вас нет прав на редактирование бригады", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await teamsApi.update(team.id, {
        name: data.name.trim(),
        isActive: data.status === "active",
        memberIds,
      });
      showToast("Бригада сохранена", "success");
      navigate({ to: "/teams" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при сохранении", "error");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleDelete = async () => {
    if (!canManage) {
      showToast("У вас нет прав на удаление бригады", "error");
      return;
    }
    if (
      !confirm(
        `Удалить бригаду «${team.name}»? Её работы в календаре останутся без бригады, рабочие — тоже.`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await teamsApi.delete(team.id);
      showToast("Бригада удалена", "success");
      navigate({ to: "/teams" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при удалении", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TeamPageHead title={team.name} isActive={team.isActive} memberCount={memberIds.length} />
      <FormBuilder
        form={form}
        sections={getTeamSections(isSubmitting || !canManage, {
          count: memberIds.length,
          render: () => (
            <TeamMembersPicker
              key="members"
              teamId={team.id}
              value={memberIds}
              onChange={setMemberIds}
              disabled={isSubmitting || !canManage}
            />
          ),
        })}
        actions={{
          submit: { onSubmit: handleSubmit, isSubmitting, disabled: isSubmitting },
          back: () => navigate({ to: "/teams" }),
          delete: { onDelete: handleDelete, isDeleting, disabled: isDeleting, isHide: !canManage },
        }}
      />
    </div>
  );
};
