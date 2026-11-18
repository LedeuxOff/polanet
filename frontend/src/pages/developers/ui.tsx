import { Code2Icon, ContactIcon, UserRoundIcon } from "lucide-react";
import { listCardClass } from "@/components/data-list";
import type { FormBuilderSectionType } from "@/widgets/form-builder/types";
import type { FieldValues, Path } from "react-hook-form";

/** Блок «Доступ» — роль разработчика фиксирована */
export const DeveloperAccessInfo = () => (
  <div
    key="access"
    className="col-span-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/5"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
      <Code2Icon className="h-5 w-5" />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Разработчик</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Полный доступ ко всем разделам. Роль не меняется.
      </span>
    </div>
  </div>
);

/** Секции формы разработчика (деталка и создание) */
export const getDeveloperSections = <T extends FieldValues>(
  disabled: boolean,
  telegram?: () => JSX.Element,
): FormBuilderSectionType<T>[] => [
  {
    id: "personal",
    label: "Личные данные",
    description: "ФИО и дата рождения",
    icon: <UserRoundIcon />,
    cardClassName: listCardClass,
    fields: [
      { id: "lastName" as Path<T>, label: "Фамилия *", type: "text", disabled },
      { id: "firstName" as Path<T>, label: "Имя *", type: "text", disabled },
      { id: "middleName" as Path<T>, label: "Отчество", type: "text", disabled },
      { id: "birthDate" as Path<T>, label: "Дата рождения", type: "date", disabled },
    ],
  },
  {
    id: "contacts",
    label: "Контакты",
    description: telegram ? "Почта для входа, телефон и Telegram" : "Почта для входа и телефон",
    icon: <ContactIcon />,
    cardClassName: listCardClass,
    fields: [
      { id: "email" as Path<T>, label: "Email *", type: "email", disabled },
      { id: "phone" as Path<T>, label: "Телефон", type: "phone", disabled },
      {
        id: "email" as Path<T>,
        label: "Telegram",
        type: "controller",
        hide: !telegram,
        Controller: () => telegram?.() ?? <span key="tg" />,
      },
    ],
  },
  {
    id: "access",
    label: "Доступ",
    icon: <Code2Icon />,
    cardClassName: listCardClass,
    fields: [
      {
        id: "lastName" as Path<T>,
        label: "Роль",
        type: "controller",
        Controller: () => <DeveloperAccessInfo key="access" />,
      },
    ],
  },
];
