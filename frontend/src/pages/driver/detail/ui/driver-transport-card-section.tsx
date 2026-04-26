import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Driver, TransportCard } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { Dispatch, SetStateAction } from "react";

interface Props {
  driver: Driver;
  setShowUnbindDialog: Dispatch<SetStateAction<boolean>>;
  isUnbinding: boolean;
  selectedCardId: string;
  setSelectedCardId: Dispatch<SetStateAction<string>>;
  transportCards: TransportCard[];
}

export const DriverTransportCardSection = ({
  driver,
  setShowUnbindDialog,
  isUnbinding,
  selectedCardId,
  setSelectedCardId,
  transportCards,
}: Props) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Транспортная карта</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {driver.transportCard ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{driver.transportCard.cardNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Общие расходы: {driver.transportCard.totalExpenses} ₽
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate({
                    to: "/transport-cards/$cardId",
                    params: { cardId: String(driver.transportCard!.id) },
                  })
                }
              >
                Открыть
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Для отвязки карты нажмите кнопку ниже
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowUnbindDialog(true)}
                disabled={isUnbinding}
              >
                {isUnbinding ? "Отвязка..." : "Отвязать карту"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Привязать транспортную карту</Label>
            <Select value={selectedCardId} onValueChange={setSelectedCardId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите карту" />
              </SelectTrigger>
              <SelectContent>
                {transportCards.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground">Нет доступных карт</div>
                ) : (
                  transportCards.map((card) => (
                    <SelectItem key={card.id} value={String(card.id)}>
                      {card.cardNumber}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Карта будет привязана после нажатия кнопки "Сохранить"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
