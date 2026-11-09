import z from "zod";
import type { FormBuilderSectionType } from "@/widgets/form-builder/types";

export const teamFormSchema = z.object({
  name: z.string().trim().min(1, "Название бригады обязательно"),
  // "active" | "inactive" — неактивные бригады скрыты в календаре работ
  status: z.enum(["active", "inactive"]),
});

export type TeamForm = z.infer<typeof teamFormSchema>;

export const getTeamSections = (disabled: boolean): FormBuilderSectionType<TeamForm>[] => [
  {
    id: "main-info",
    label: "Основная информация",
    fields: [
      { id: "name", label: "Название", type: "text", disabled, className: "col-span-2" },
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
];
