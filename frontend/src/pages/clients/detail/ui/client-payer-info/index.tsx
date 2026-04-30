import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <Card>
      <CardHeader>
        <CardTitle>Плательщик</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="payerLastName">Фамилия</Label>
              <Input
                id="payerLastName"
                disabled={isSubmitting}
                {...form.register("payerLastName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerFirstName">Имя</Label>
              <Input
                id="payerFirstName"
                disabled={isSubmitting}
                {...form.register("payerFirstName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerMiddleName">Отчество</Label>
              <Input
                id="payerMiddleName"
                disabled={isSubmitting}
                {...form.register("payerMiddleName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payerPhone">Телефон</Label>
            <Input id="payerPhone" disabled={isSubmitting} {...form.register("payerPhone")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
