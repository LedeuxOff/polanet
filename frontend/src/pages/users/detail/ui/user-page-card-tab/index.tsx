import { BottomBar } from "@/components/bottom-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransportCard, User } from "@/lib/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { Truck } from "lucide-react";

interface Props {
  user: User;
  availableCards: TransportCard[];
  isFetchingCards: boolean;
  handleDetachCard: () => Promise<void>;
  handleAttachCard: (cardId: number) => Promise<void>;
  isDetachingCard: boolean;
  isAttachingCard: boolean;
}

export const UserPageTransportCardTab = ({
  user,
  availableCards,
  isFetchingCards,
  handleDetachCard,
  handleAttachCard,
  isDetachingCard,
  isAttachingCard,
}: Props) => {
  const navigate = useNavigate();

  const isDriver = user?.roleCode === "DRIVER";

  // Get current transport card from available cards or user data
  const currentTransportCard = user?.transportCardId
    ? availableCards.find((card) => card.id === user.transportCardId) || null
    : null;

  if (!isDriver) {
    return (
      <div className="rounded-2xl flex items-center justify-center py-12 text-muted-foreground dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <div className="text-center">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-50 dark:text-zinc-100" />
          <p className="dark:text-zinc-100">
            Транспортная карта доступна только для сотрудников с ролью "Водитель"
          </p>
        </div>
      </div>
    );
  }

  if (isFetchingCards) {
    return (
      <div className="flex items-center justify-center w-full">
        <Skeleton className="w-full h-32 rounded-2xl bg-zinc-300 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Current attached card */}
        {currentTransportCard || user?.transportCardNumber ? (
          <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
            <CardContent className="pt-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-white/20 py-8 flex flex-col gap-4">
                <div className="h-8 bg-zinc-200 dark:bg-white/30 w-full" />

                <div className="px-4">
                  <p className="text-sm text-muted-foreground dark:text-zinc-100">Номер карты</p>
                  <p className="text-lg font-mono font-semibold">
                    {currentTransportCard?.cardNumber || user?.transportCardNumber}
                  </p>
                </div>

                <div className="px-4 flex justify-between gap-4">
                  <Badge
                    className={
                      currentTransportCard?.status === "active" ||
                      user?.transportCardStatus === "active"
                        ? "bg-green-100 dark:bg-green-500/40 border dark:border-none border-green-600 text-green-600 dark:text-green-800 px-8 py-2 rounded-2xl hover:bg-green-100"
                        : "bg-red-100 dark:bg-red-500/40 border dark:border-none border-red-600 text-red-600 dark:text-red-800 px-8 py-2 rounded-2xl hover:bg-red-100"
                    }
                  >
                    {(currentTransportCard?.status || user?.transportCardStatus) === "active"
                      ? "Активна"
                      : "Неактивна"}
                  </Badge>

                  <Button
                    onClick={handleDetachCard}
                    disabled={isDetachingCard}
                    className="rounded-2xl bg-red-400 dark:bg-red-600/40 hover:bg-red-500 dark:hover:bg-red-600/60 text-white px-4"
                  >
                    {isDetachingCard ? "Отвязываю..." : "Отвязать карту"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
            <CardHeader>
              <CardTitle>Нет привязанной карты</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-zinc-100">
                К этому сотруднику не привязана транспортная карта. Выберите карту ниже для
                привязки.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Available cards to attach */}
        {!currentTransportCard && !user?.transportCardNumber && availableCards.length > 0 && (
          <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
            <CardHeader>
              <CardTitle>Доступные карты для привязки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-start justify-between p-4 rounded-2xl bg-zinc-100 border border-zinc-100 shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                >
                  <div className="space-y-4">
                    <p className="font-mono font-semibold">{card.cardNumber}</p>
                    <Badge
                      className={
                        card?.status === "active"
                          ? "bg-green-100 dark:bg-green-500/40 border dark:border-none border-green-600 text-green-600 dark:text-green-800 px-8 py-2 rounded-2xl hover:bg-green-100"
                          : "bg-red-100 dark:bg-red-500/40 border dark:border-none border-red-600 text-red-600 dark:text-red-800 px-8 py-2 rounded-2xl hover:bg-red-100"
                      }
                    >
                      {card?.status === "active" ? "Активна" : "Неактивна"}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleAttachCard(card.id)}
                    disabled={isAttachingCard}
                    className="rounded-2xl bg-blue-500 dark:bg-blue-600/40 hover:bg-blue-600 dark:hover:bg-blue-600/60 px-4 dark:text-zinc-100"
                  >
                    {isAttachingCard ? "Привязываю..." : "Привязать"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {availableCards.length === 0 && !currentTransportCard && !user?.transportCardNumber && (
          <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
            <CardHeader>
              <CardTitle>Нет доступных карт</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-zinc-100">
                Все транспортные карты уже привязаны к сотрудникам. Сначала создайте новую карту.
              </p>
              <Link to="/transport-cards/new">
                <Button className="mt-4 rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-zinc-100">
                  Создать транспортную карту
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomBar hideSaveButton onBack={() => navigate({ to: "/users" })} />
    </>
  );
};
