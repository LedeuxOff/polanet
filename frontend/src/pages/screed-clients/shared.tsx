import { UserRoundIcon } from "lucide-react";
import { listCardClass } from "@/components/data-list";
import z from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ScreedClient, ScreedClientInput } from "@/lib/types";
import { formatPhoneDisplay, preparePhoneForApi } from "@/lib/utils/phone";
import type { FormBuilderSectionType } from "@/widgets/form-builder/types";
import type { UseFormReturn } from "react-hook-form";

export const screedClientFormSchema = z.object({
  lastName: z.string().optional(),
  firstName: z.string().trim().min(1, "Имя обязательно"),
  middleName: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type ScreedClientForm = z.infer<typeof screedClientFormSchema>;

export const emptyScreedClientForm: ScreedClientForm = {
  lastName: "",
  firstName: "",
  middleName: "",
  phone: "",
  notes: "",
};

export const getScreedClientName = (
  c: Pick<ScreedClient, "lastName" | "firstName" | "middleName">,
) => [c.lastName, c.firstName, c.middleName].filter(Boolean).join(" ") || "Без имени";

export const toScreedClientForm = (c: ScreedClient): ScreedClientForm => ({
  lastName: c.lastName || "",
  firstName: c.firstName,
  middleName: c.middleName || "",
  phone: formatPhoneDisplay(c.phone),
  notes: c.notes || "",
});

export const toScreedClientInput = (data: ScreedClientForm): ScreedClientInput => ({
  lastName: data.lastName?.trim() || null,
  firstName: data.firstName.trim(),
  middleName: data.middleName?.trim() || null,
  phone: preparePhoneForApi(data.phone) || null,
  notes: data.notes?.trim() || null,
});

export const getScreedClientSections = (
  form: UseFormReturn<ScreedClientForm>,
  disabled: boolean,
): FormBuilderSectionType<ScreedClientForm>[] => [
  {
    id: "main-info",
    label: "Основная информация",
    description: "ФИО, телефон и заметки",
    icon: <UserRoundIcon />,
    cardClassName: listCardClass,
    fields: [
      { id: "lastName", label: "Фамилия", type: "text", disabled },
      { id: "firstName", label: "Имя *", type: "text", disabled },
      { id: "middleName", label: "Отчество", type: "text", disabled },
      { id: "phone", label: "Телефон", type: "phone", disabled },
      {
        id: "notes",
        label: "Заметки",
        type: "controller",
        className: "col-span-full",
        Controller: () => (
          <div key="notes" className="col-span-full flex flex-col gap-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              rows={3}
              disabled={disabled}
              placeholder="Например: предпочитает звонки после 18:00"
              className="resize-none rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              {...form.register("notes")}
            />
          </div>
        ),
      },
    ],
  },
];
