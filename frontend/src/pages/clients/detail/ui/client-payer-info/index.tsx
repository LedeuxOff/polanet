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

export const ClientPayerInfo = ({ form, isSubmitting }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle>Плательщик</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="payerLastName">Фамилия</Label>
              <Input
                className="rounded-2xl"
                id="payerLastName"
                disabled={isSubmitting}
                {...form.register("payerLastName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerFirstName">Имя</Label>
              <Input
                className="rounded-2xl"
                id="payerFirstName"
                disabled={isSubmitting}
                {...form.register("payerFirstName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerMiddleName">Отчество</Label>
              <Input
                className="rounded-2xl"
                id="payerMiddleName"
                disabled={isSubmitting}
                {...form.register("payerMiddleName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payerPhone">Телефон</Label>
            <InputPhone
              className="rounded-2xl"
              id="payerPhone"
              disabled={isSubmitting}
              value={form.watch("payerPhone")}
              onPhoneChange={(value) =>
                form.setValue("payerPhone", value || "", { shouldValidate: true })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
