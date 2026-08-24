import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewTransportCardForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<NewTransportCardForm>;
  isSubmitting: boolean;
}

export const CardNewPageForm = ({ form, isSubmitting }: Props) => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Номер карты *</Label>
          <Input
            className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
            id="cardNumber"
            placeholder="12345678"
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
            value={form.watch("status") || "active"}
            onValueChange={(value: "active" | "inactive") => form.setValue("status", value)}
          >
            <SelectTrigger
              disabled={isSubmitting}
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
            >
              <SelectValue placeholder="Активна" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
              <SelectItem value="active">Активна</SelectItem>
              <SelectItem value="inactive">Неактивна</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
