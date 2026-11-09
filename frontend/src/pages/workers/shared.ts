import { useEffect, useState } from "react";
import { teamsApi } from "@/lib/api";
import type { Team, WorkerForm, WorkerInput } from "@/lib/types";
import { preparePhoneForApi } from "@/lib/utils/phone";
import type { FormBuilderSectionType } from "@/widgets/form-builder/types";

export const NO_TEAM = "none";

/** Все бригады (включая неактивные) — для выбора бригады рабочего */
export const useTeamOptions = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    teamsApi
      .list(true)
      .then(setTeams)
      .catch(() => setTeams([]));
  }, []);
  return teams;
};

/** Секции формы рабочего: ФИО, телефон, бригада */
export const getWorkerSections = (
  teams: Team[],
  disabled: boolean,
): FormBuilderSectionType<WorkerForm>[] => [
  {
    id: "main-info",
    label: "Основная информация",
    fields: [
      { id: "lastName", label: "Фамилия", type: "text", disabled },
      { id: "firstName", label: "Имя", type: "text", disabled },
      { id: "middleName", label: "Отчество", type: "text", disabled },
      { id: "phone", label: "Телефон", type: "phone", disabled },
      {
        id: "teamId",
        label: "Бригада",
        type: "select",
        disabled,
        select: {
          options: [
            { id: NO_TEAM, name: "Без бригады" },
            ...teams.map((t) => ({
              id: String(t.id),
              name: t.isActive ? t.name : `${t.name} (неактивна)`,
            })),
          ],
        },
      },
    ],
  },
];

export const toWorkerInput = (data: WorkerForm): WorkerInput => ({
  lastName: data.lastName.trim(),
  firstName: data.firstName.trim(),
  middleName: data.middleName?.trim() || null,
  phone: preparePhoneForApi(data.phone) ?? null,
  teamId: data.teamId && data.teamId !== NO_TEAM ? Number(data.teamId) : null,
});
