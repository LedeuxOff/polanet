import { cn } from "@/lib/utils";
import { FormBuilderFieldType } from "../../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldValues, UseFormReturn } from "react-hook-form";

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
      <Input
        className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
        id={id}
        type="date"
        disabled={disabled}
        {...form.register(id)}
      />

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
};
