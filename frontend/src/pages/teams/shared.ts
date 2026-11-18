import z from "zod";
import { createElement } from "react";
import { HardHatIcon, UsersIcon } from "lucide-react";
import { listCardClass } from "@/components/data-list";
import type { FormBuilderSectionType } from "@/widgets/form-builder/types";
import { membersLabel } from "./ui/team-identity";

export const teamFormSchema = z.object({
  name: z.string().trim().min(1, "Название бригады обязательно"),
  // "active" | "inactive" — неактивные бригады скрыты в календаре работ
  status: z.enum(["active", "inactive"]),
});

export type TeamForm = z.infer<typeof teamFormSchema>;

export const getTeamSections = (
  disabled: boolean,
  members?: { count: number; render: () => JSX.Element },
): FormBuilderSectionType<TeamForm>[] => [
  {
    id: "main-info",
    label: "Основная информация",
    description: "Название и отображение в календаре работ",
    icon: createElement(HardHatIcon),
    cardClassName: listCardClass,
    fields: [
      { id: "name", label: "Название", type: "text", disabled, className: "md:col-span-2" },
      {
        id: "status",
        label: "В календаре работ",
        type: "select",
        disabled,
        select: {
          options: [
            { id: "active", name: "Показывать" },
            { id: "inactive", name: "Скрыть (неактивна)" },
          ],
        },
      },
    ],
  },
  {
    id: "members",
    label: "Участники",
    description: members ? membersLabel(members.count) : undefined,
    icon: createElement(UsersIcon),
    cardClassName: listCardClass,
    hide: !members,
    fields: [
      {
        id: "name",
        label: "Участники",
        type: "controller",
        Controller: () => members?.render() ?? createElement("span"),
      },
    ],
  },
];
