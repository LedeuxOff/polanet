import { Input } from "@/components/ui/input";
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
          <Input id="lastName" disabled={isSubmitting} {...form.register("lastName")} />
          {form.formState.errors.lastName && (
            <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">Имя</Label>
          <Input id="firstName" disabled={isSubmitting} {...form.register("firstName")} />
          {form.formState.errors.firstName && (
            <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Отчество</Label>
          <Input id="middleName" disabled={isSubmitting} {...form.register("middleName")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input id="phone" disabled={isSubmitting} {...form.register("phone")} />
        </div>
      </div>
    </div>
  );
};
