import { cn } from "@/lib/utils";
import { FormBuilderFieldType } from "../../types";
import { Label } from "@/components/ui/label";
import { InputPhone } from "@/components/ui/input-phone";
import { FieldValues, UseFormReturn } from "react-hook-form";

export const FormBuilderPhoneField = <T extends FieldValues = FieldValues>({
  id,
  form,
  label,
  className,
  disabled,
}: FormBuilderFieldType<T> & { form: UseFormReturn<T> }) => {
  const errorMessage = form.formState.errors[id]?.message as string | undefined;
  const phoneValue = form.watch(id);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <InputPhone
        className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
        id={id}
        disabled={disabled}
        value={phoneValue as string | undefined}
        onPhoneChange={(value) =>
          form.setValue(id, (value || "") as never, { shouldValidate: true })
        }
      />

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
};
