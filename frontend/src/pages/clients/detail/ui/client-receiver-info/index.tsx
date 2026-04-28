import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<ClientForm>;
  isSubmitting: boolean;
}

export const ClientReceiverInfo = ({ form, isSubmitting }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Приемщик</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiverLastName">Фамилия</Label>
              <Input
                id="receiverLastName"
                disabled={isSubmitting}
                {...form.register("receiverLastName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverFirstName">Имя</Label>
              <Input
                id="receiverFirstName"
                disabled={isSubmitting}
                {...form.register("receiverFirstName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverMiddleName">Отчество</Label>
              <Input
                id="receiverMiddleName"
                disabled={isSubmitting}
                {...form.register("receiverMiddleName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiverPhone">Телефон</Label>
            <Input id="receiverPhone" disabled={isSubmitting} {...form.register("receiverPhone")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
