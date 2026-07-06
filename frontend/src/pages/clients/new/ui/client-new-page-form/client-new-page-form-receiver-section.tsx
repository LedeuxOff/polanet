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

export const ClientNewPageFormReceiverSection = ({ form, isSubmitting }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>Приемщик</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="receiver.lastName">Фамилия</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="receiver.lastName"
                placeholder="Петров"
                disabled={isSubmitting}
                {...form.register("receiver.lastName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver.firstName">Имя</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="receiver.firstName"
                placeholder="Петр"
                disabled={isSubmitting}
                {...form.register("receiver.firstName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver.middleName">Отчество</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="receiver.middleName"
                placeholder="Петрович"
                disabled={isSubmitting}
                {...form.register("receiver.middleName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver.phone">Телефон</Label>
            <InputPhone
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              id="receiver.phone"
              disabled={isSubmitting}
              onPhoneChange={(value) =>
                form.setValue("receiver.phone", value || "", { shouldValidate: true })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
