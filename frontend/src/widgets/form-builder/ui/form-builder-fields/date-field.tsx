import { cn } from "@/lib/utils";
import { FormBuilderFieldType } from "../../types";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Controller, FieldValues, UseFormReturn } from "react-hook-form";

export const FormBuilderDateField = <T extends FieldValues = FieldValues>({
  id,
  form,
  label,
  className,
  disabled,
}: FormBuilderFieldType<T> & { form: UseFormReturn<T> }) => {
  const errorMessage = form.formState.errors[id]?.message as string | undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Controller
        control={form.control}
        name={id}
        render={({ field }) => (
          <DatePicker
            id={id}
            value={field.value ?? ""}
            onChange={field.onChange}
            disabled={disabled}
          />
        )}
      />

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
};
