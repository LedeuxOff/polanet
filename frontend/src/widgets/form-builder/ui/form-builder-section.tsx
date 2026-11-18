import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormBuilderSectionType } from "../types";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";
import { FormBuilderTextField } from "./form-builder-fields/text-field";
import { FormBuilderEmailField } from "./form-builder-fields/email-field";
import { FormBuilderPhoneField } from "./form-builder-fields/phone-field";
import { FormBuilderDateField } from "./form-builder-fields/date-field";
import { FormBuilderSelectField } from "./form-builder-fields/select-field";
import { FieldValues, UseFormReturn } from "react-hook-form";

export const FormBuilderSection = <T extends FieldValues = FieldValues>({
  label,
  description,
  icon,
  cardClassName,
  className,
  form,
  fields,
}: FormBuilderSectionType<T> & { form: UseFormReturn<T> }) => {
  const isMobile = useIsMobile();

  return (
    <Card
      className={cn(
        "rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20",
        cardClassName,
      )}
    >
      <CardHeader className={cn(icon && "flex flex-row items-center gap-3 space-y-0")}>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200 [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <CardTitle className={cn(icon && "text-base")}>{label}</CardTitle>
          {description && (
            <span className="text-sm text-slate-500 dark:text-slate-300">{description}</span>
          )}
        </div>
      </CardHeader>
      <CardContent
        className={cn(`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`, className)}
      >
        {fields
          .filter((field) => !field.hide)
          .map((field) => {
            if (field.type === "text") {
              return <FormBuilderTextField<T> key={field.id} {...field} form={form} />;
            }

            if (field.type === "email") {
              return <FormBuilderEmailField<T> key={field.id} {...field} form={form} />;
            }

            if (field.type === "phone") {
              return <FormBuilderPhoneField<T> key={field.id} {...field} form={form} />;
            }

            if (field.type === "date") {
              return <FormBuilderDateField<T> key={field.id} {...field} form={form} />;
            }

            if (field.type === "select") {
              return <FormBuilderSelectField<T> key={field.id} {...field} form={form} />;
            }

            if (field.Controller) {
              return field.Controller();
            }

            return <></>;
          })}
      </CardContent>
    </Card>
  );
};
