import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  compact?: boolean;
}

type PageToken = number | "ellipsis-left" | "ellipsis-right";

const getPageTokens = (current: number, total: number, siblings: number): PageToken[] => {
  const totalSlots = siblings * 2 + 5;
  if (total <= totalSlots) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(current - siblings, 2);
  const right = Math.min(current + siblings, total - 1);
  const tokens: PageToken[] = [1];

  if (left > 2) tokens.push("ellipsis-left");
  for (let p = left; p <= right; p++) tokens.push(p);
  if (right < total - 1) tokens.push("ellipsis-right");
  tokens.push(total);

  return tokens;
};

const baseBtn =
  "flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

export const ListPagination = ({
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  compact = false,
}: Props) => {
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const tokens = getPageTokens(currentPage, totalPages, compact ? 0 : 1);

  const goTo = (page: number) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t pt-4 dark:border-white/20",
        compact ? "flex-col" : "justify-between",
      )}
    >
      <p className="text-sm text-muted-foreground">
        Показано{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        из <span className="font-medium text-foreground">{totalItems}</span>
      </p>

      <nav
        aria-label="Пагинация"
        className="flex items-center gap-1 rounded-2xl border p-1 dark:border-white/20"
      >
        <button
          type="button"
          aria-label="Предыдущая страница"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(baseBtn, "hover:bg-muted dark:hover:bg-white/10")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {tokens.map((token) =>
          typeof token === "number" ? (
            <button
              key={token}
              type="button"
              aria-current={token === currentPage ? "page" : undefined}
              onClick={() => goTo(token)}
              className={cn(
                baseBtn,
                token === currentPage
                  ? "bg-blue-600 text-white shadow-sm dark:bg-blue-600/60"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-white/10",
              )}
            >
              {token}
            </button>
          ) : (
            <span
              key={token}
              className="flex h-9 w-6 items-center justify-center text-muted-foreground"
            >
              …
            </span>
          ),
        )}

        <button
          type="button"
          aria-label="Следующая страница"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(baseBtn, "hover:bg-muted dark:hover:bg-white/10")}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};
