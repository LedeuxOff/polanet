import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <>
      {driver.transportCard ? (
        <div className="space-y-4">
          <div className="border rounded-md flex flex-col">
            <div className="p-4 flex justify-between items-center">
              <span className="font-semibold">№{driver.transportCard.cardNumber}</span>

              <div>
                {driver.transportCard.status === "active" ? (
                  <div className="py-2 px-4 bg-green-200 text-green-800 rounded-md text-[14px] font-semibold">
                    Активна
                  </div>
                ) : (
                  <div className="py-2 px-4 bg-red-200 text-red-800 rounded-md text-[14px] font-semibold">
                    Неактивна
                  </div>
                )}
              </div>
            </div>

            <div className="h-12 bg-zinc-100" />

            <div className="p-4 flex flex-col gap-2">
              <span className="text-zinc-400">Расход по карте:</span>
              <span>{driver.transportCard.totalExpenses || 0} ₽</span>
            </div>

            <div className="p-4 flex justify-end gap-2 items-center">
              <Button
                variant="outline"
                type="button"
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

              <Button
                variant="destructive"
                type="button"
                size="sm"
                onClick={() => setShowUnbindDialog(true)}
                disabled={isUnbinding}
              >
                {isUnbinding ? "Отвязка..." : "Отвязать карту"}
              </Button>
            </div>
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
    </>
  );
};
