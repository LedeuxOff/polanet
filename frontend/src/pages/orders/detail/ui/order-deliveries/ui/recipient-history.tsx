import { useState, useEffect } from "react";
import { deliveriesApi } from "@/lib/api/deliveries-api";
import { RecipientHistory } from "@/lib/types/delivery-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, UserIcon, ArrowRightIcon, PlusIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  deliveryId: number;
}

const actionLabels: Record<string, string> = {
  created: "Создан",
  updated: "Изменен",
  deleted: "Удален",
};

const actionColors: Record<string, string> = {
  created: "bg-green-100 text-green-700",
  updated: "bg-blue-100 text-blue-700",
  deleted: "bg-red-100 text-red-700",
};

export const RecipientHistoryList = ({ deliveryId }: Props) => {
  const [history, setHistory] = useState<RecipientHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await deliveriesApi.getRecipientHistory(deliveryId);
        setHistory(data);
      } catch (error) {
        console.error("Error loading recipient history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [deliveryId]);

  if (isLoading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">История получателей</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">История изменений получателя отсутствует</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">История получателей ({history.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => {
            const isFirst = index === history.length - 1;
            const isLast = index === 0;
            const userName = item.changedByName || "Неизвестный пользователь";

            return (
              <div key={item.id} className="relative">
                {/* Timeline line */}
                {!isLast && <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />}

                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                      actionColors[item.action] || "bg-gray-100 text-gray-700",
                    )}
                  >
                    {item.action === "created" && <PlusIcon className="w-5 h-5" />}
                    {item.action === "updated" && <ArrowRightIcon className="w-5 h-5" />}
                    {item.action === "deleted" && <TrashIcon className="w-5 h-5" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs", actionColors[item.action])}>
                        {actionLabels[item.action] || item.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleString("ru-RU")}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {userName}
                      </span>
                    </div>

                    <div className="mt-2 text-sm">
                      {item.oldRecipientName && item.recipientType && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.oldRecipientName}</span>
                          <ArrowRightIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{item.recipientName || "Не назначен"}</span>
                        </div>
                      )}

                      {!item.oldRecipientName && item.recipientType && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Назначен:</span>
                          <span className="font-medium">{item.recipientName || "Не назначен"}</span>
                        </div>
                      )}

                      {item.comment && (
                        <p className="mt-1 text-muted-foreground text-xs">{item.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
