import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CarForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<CarForm>;
  disabled: boolean;
}

export const CarNewPageForm = ({ form, disabled }: Props) => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Марка</Label>
          <Input
            className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
            id="brand"
            disabled={disabled}
            {...form.register("brand")}
          />
          {form.formState.errors.brand && (
            <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licensePlate">Гос номер</Label>
          <Input
            className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
            id="licensePlate"
            disabled={disabled}
            {...form.register("licensePlate")}
          />
          {form.formState.errors.licensePlate && (
            <p className="text-sm text-destructive">{form.formState.errors.licensePlate.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
