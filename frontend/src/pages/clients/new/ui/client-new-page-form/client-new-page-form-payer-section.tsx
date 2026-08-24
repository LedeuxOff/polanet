import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputPhone } from "@/components/ui/input-phone";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks";
import { NewClientForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<NewClientForm>;
  isSubmitting: boolean;
}

export const ClientNewPageFormPayerSection = ({ form, isSubmitting }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>Плательщик</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="payer.lastName">Фамилия</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="payer.lastName"
                placeholder="Иванов"
                disabled={isSubmitting}
                {...form.register("payer.lastName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payer.firstName">Имя</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="payer.firstName"
                placeholder="Иван"
                disabled={isSubmitting}
                {...form.register("payer.firstName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payer.middleName">Отчество</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="payer.middleName"
                placeholder="Иванович"
                disabled={isSubmitting}
                {...form.register("payer.middleName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payer.phone">Телефон</Label>
            <InputPhone
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              id="payer.phone"
              disabled={isSubmitting}
              onPhoneChange={(value) =>
                form.setValue("payer.phone", value || "", { shouldValidate: true })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
