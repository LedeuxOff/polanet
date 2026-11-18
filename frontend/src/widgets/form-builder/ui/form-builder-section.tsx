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
  className,
  form,
  fields,
}: FormBuilderSectionType<T> & { form: UseFormReturn<T> }) => {
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
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
