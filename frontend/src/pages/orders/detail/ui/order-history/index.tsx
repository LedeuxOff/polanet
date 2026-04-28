import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useMemo } from "react";

interface Props {
  order: Order;
}

const ITEMS_PER_PAGE = 3;

export const OrderHistory = ({ order }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const history = order.history || [];

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
  }, [history.length]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return history.slice(start, start + ITEMS_PER_PAGE);
  }, [history, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="history">
          <AccordionTrigger className="text-base">
            История изменений ({history.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              {paginatedHistory.map((item) => {
                const userName = [
                  item.userLastName,
                  item.userFirstName && item.userFirstName.charAt(0) + ".",
                  item.userMiddleName && item.userMiddleName.charAt(0) + ".",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div key={item.id} className="p-3 border rounded-md bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.action === "created"
                              ? "default"
                              : item.action === "status_changed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {item.action === "created" && "Создана"}
                          {item.action === "updated" && "Изменена"}
                          {item.action === "status_changed" && "Статус изменён"}
                          {item.action === "payment_added" && "Выплата добавлена"}
                          {item.action === "payment_removed" && "Выплата удалена"}
                          {item.action === "deleted" && "Удалена"}
                        </Badge>
                        {userName && <span className="text-sm font-medium">{userName}</span>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString("ru-RU")}
                      </span>
                    </div>
                    {item.fieldName && (
                      <p className="text-sm">
                        <span className="font-medium">{item.fieldName}:</span>{" "}
                        {item.oldValue && (
                          <span className="text-muted-foreground line-through">
                            {item.oldValue}
                          </span>
                        )}
                        {item.oldValue && item.newValue && " → "}
                        {item.newValue && <span className="font-medium">{item.newValue}</span>}
                      </p>
                    )}
                    {item.newValue && !item.fieldName && <p className="text-sm">{item.newValue}</p>}
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="h-10 w-10 bg-zinc-800 text-white hover:bg-zinc-900 hover:text-white"
                    type="button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md">
                    <span className="text-sm font-medium">{currentPage}</span>
                    <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="h-10 w-10 bg-zinc-800 text-white hover:bg-zinc-900 hover:text-white"
                    type="button"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
