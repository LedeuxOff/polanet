import { useState, useEffect } from "react";
import { deliveriesApi } from "@/lib/api/deliveries-api";
import { RecipientHistory } from "@/lib/types/delivery-types";
import { ArrowRightIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  deliveryId: number;
}

const actionLabels: Record<string, string> = {
  created: "Назначен",
  updated: "Изменён",
  deleted: "Удалён",
};

const actionColors: Record<string, string> = {
  created: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
  updated: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  deleted: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
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
    return <p className="pl-5 text-xs text-muted-foreground">Загрузка...</p>;
  }

  if (history.length === 0) {
    return <p className="pl-5 text-xs text-muted-foreground">Изменений получателя нет</p>;
  }

  return (
    <ol className="ml-2 flex flex-col gap-3 border-l pl-4 dark:border-white/20">
      {history.map((item) => {
        const userName = item.changedByName || "Неизвестный пользователь";

        return (
          <li key={item.id} className="relative">
            <span
              className={cn(
                "absolute -left-[27px] top-0 flex h-5 w-5 items-center justify-center rounded-full",
                actionColors[item.action] ||
                  "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-zinc-200",
              )}
            >
              {item.action === "created" && <PlusIcon className="h-3 w-3" />}
              {item.action === "updated" && <ArrowRightIcon className="h-3 w-3" />}
              {item.action === "deleted" && <Trash2Icon className="h-3 w-3" />}
            </span>

            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="font-medium">{actionLabels[item.action] || item.action}</span>
              {item.oldRecipientName && (
                <>
                  <span className="text-muted-foreground">{item.oldRecipientName}</span>
                  <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                </>
              )}
              <span>{item.recipientName || "Не назначен"}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString("ru-RU")} · {userName}
            </div>
            {item.comment && <p className="mt-0.5 text-xs text-muted-foreground">{item.comment}</p>}
          </li>
        );
      })}
    </ol>
  );
};
