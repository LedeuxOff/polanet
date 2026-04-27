import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Driver, TransportCard, TransportCardForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  isSubmitting: boolean;
  form: UseFormReturn<TransportCardForm>;
  card: TransportCard | null;
  drivers: Driver[];
}

export const TransportCardMainInfo = ({ isSubmitting, form, card, drivers }: Props) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Номер карты</Label>
        <Input id="cardNumber" disabled={isSubmitting} {...form.register("cardNumber")} />
        {form.formState.errors.cardNumber && (
          <p className="text-sm text-destructive">{form.formState.errors.cardNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Статус</Label>
        <Select
          value={card?.status || "active"}
          onValueChange={(value: "active" | "inactive") =>
            form.setValue("status", value as "active" | "inactive")
          }
        >
          <SelectTrigger disabled={isSubmitting}>
            <SelectValue placeholder="Активна" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Активна</SelectItem>
            <SelectItem value="inactive">Неактивна</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="driverId">Водитель</Label>
        <Select
          value={String(form.watch("driverId") || "")}
          onValueChange={(value) => form.setValue("driverId", value ? Number(value) : null)}
        >
          <SelectTrigger disabled={isSubmitting}>
            <SelectValue placeholder="Не назначен" />
          </SelectTrigger>
          <SelectContent>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={String(driver.id)}>
                {driver.lastName} {driver.firstName} {driver.middleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
