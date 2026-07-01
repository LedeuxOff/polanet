import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputPhone } from "@/components/ui/input-phone";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks";
import { ClientForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<ClientForm>;
  isSubmitting: boolean;
}

export const ClientReceiverInfo = ({ form, isSubmitting }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle>Приемщик</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="receiverLastName">Фамилия</Label>
              <Input
                className="rounded-2xl"
                id="receiverLastName"
                disabled={isSubmitting}
                {...form.register("receiverLastName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverFirstName">Имя</Label>
              <Input
                className="rounded-2xl"
                id="receiverFirstName"
                disabled={isSubmitting}
                {...form.register("receiverFirstName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverMiddleName">Отчество</Label>
              <Input
                className="rounded-2xl"
                id="receiverMiddleName"
                disabled={isSubmitting}
                {...form.register("receiverMiddleName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiverPhone">Телефон</Label>
            <InputPhone
              className="rounded-2xl"
              id="receiverPhone"
              disabled={isSubmitting}
              value={form.watch("receiverPhone")}
              onPhoneChange={(value) =>
                form.setValue("receiverPhone", value || "", { shouldValidate: true })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
