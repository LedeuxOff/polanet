import { Input } from "@/components/ui/input";
import { InputPhone } from "@/components/ui/input-phone";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks";
import { DriverForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<DriverForm>;
  isSubmitting: boolean;
}

export const DriverSection = ({ form, isSubmitting }: Props) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4">
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия</Label>
          <Input
            className="rounded-2xl"
            id="lastName"
            disabled={isSubmitting}
            {...form.register("lastName")}
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">Имя</Label>
          <Input
            className="rounded-2xl"
            id="firstName"
            disabled={isSubmitting}
            {...form.register("firstName")}
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Отчество</Label>
          <Input
            className="rounded-2xl"
            id="middleName"
            disabled={isSubmitting}
            {...form.register("middleName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <InputPhone
            className="rounded-2xl"
            id="phone"
            disabled={isSubmitting}
            value={form.watch("phone")}
            onPhoneChange={(value) => form.setValue("phone", value || "", { shouldValidate: true })}
          />
        </div>
      </div>
    </div>
  );
};
