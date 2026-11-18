import { FormEventHandler, HTMLAttributes, ReactNode } from "react";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

export type FormBuilderFieldType<T extends FieldValues = FieldValues> = {
  id: FieldPath<T>;
  label: string;
  type: "text" | "email" | "password" | "phone" | "date" | "select" | "controller";
  className?: HTMLAttributes<HTMLDivElement>["className"];
  disabled?: boolean;
  select?: {
    options: { id: string; name: string }[];
  };
  Controller?: () => JSX.Element;
  hide?: boolean;
};

export type FormBuilderSectionType<T extends FieldValues = FieldValues> = {
  id: string;
  label: string;
  /** Подзаголовок под названием секции */
  description?: string;
  /** Иконка секции (lucide), отображается слева от заголовка */
  icon?: ReactNode;
  /** Классы карточки секции (переопределяют стандартные) */
  cardClassName?: HTMLAttributes<HTMLDivElement>["className"];
  className?: HTMLAttributes<HTMLDivElement>["className"];
  fields: FormBuilderFieldType<T>[];
  hide?: boolean;
};

export type FormBuilderType<T extends FieldValues = FieldValues> = {
  form: UseFormReturn<T>;
  sections: FormBuilderSectionType<T>[];
  actions: {
    submit?: {
      onSubmit: FormEventHandler<HTMLFormElement>;
      label?: string;
      isHide?: boolean;
      isSubmitting?: boolean;
      disabled?: boolean;
    };
    back: () => void;
    delete?: {
      onDelete: () => void;
      label?: string;
      isHide?: boolean;
      isDeleting?: boolean;
      disabled?: boolean;
    };
    resetPassword?: {
      onReset: () => Promise<void>;
      label?: string;
      isHide?: boolean;
      isReseting?: boolean;
      disabled?: boolean;
    };
  };
};
