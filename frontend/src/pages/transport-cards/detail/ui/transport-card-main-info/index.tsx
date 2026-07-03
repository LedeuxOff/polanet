import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransportCard, TransportCardForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  isSubmitting: boolean;
  form: UseFormReturn<TransportCardForm>;
  card: TransportCard | null;
}

export const TransportCardMainInfo = ({ isSubmitting, form, card }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Номер карты</Label>
        <Input
          className="rounded-2xl"
          id="cardNumber"
          disabled={isSubmitting}
          {...form.register("cardNumber")}
        />
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
          <SelectTrigger disabled={isSubmitting} className="rounded-2xl">
            <SelectValue placeholder="Активна" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-xl">
            <SelectItem value="active">Активна</SelectItem>
            <SelectItem value="inactive">Неактивна</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
