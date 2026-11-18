import { cn } from "@/lib/utils";
import { FormBuilderFieldType } from "../../types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldValues, UseFormReturn } from "react-hook-form";

export const FormBuilderSelectField = <T extends FieldValues = FieldValues>({
  id,
  form,
  label,
  className,
  disabled,
  select,
}: FormBuilderFieldType<T> & { form: UseFormReturn<T> }) => {
  const errorMessage = form.formState.errors[id]?.message as string | undefined;
  const fieldValue = form.watch(id);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>

      <Select
        value={String(fieldValue || "")}
        onValueChange={(value) => form.setValue(id, value as never)}
      >
        <SelectTrigger
          disabled={disabled}
          className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
        >
          <SelectValue placeholder="Выберите значение" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          {select?.options.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
};
