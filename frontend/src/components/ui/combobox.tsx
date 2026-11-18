import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Вторая строка (телефон и т.п.) */
  hint?: string;
}

interface Props {
  value: string | null;
  onChange: (value: string | null, option: ComboboxOption | null) => void;
  options: ComboboxOption[];
  /** Подпись выбранного значения, если его нет среди options (например, ещё не загружено) */
  selectedLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Можно очистить выбор крестиком */
  clearable?: boolean;
  /** Поиск на сервере: если задан, локальная фильтрация отключается */
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
  /** Доп. элемент внизу списка (например, «Создать нового») */
  footer?: (close: () => void, search: string) => ReactNode;
  className?: string;
}

/**
 * Выпадающий список с поиском. Рендерится без портала — корректно работает внутри модалок
 * (прокрутка и фокус не конфликтуют с Dialog).
 */
export const Combobox = ({
  value,
  onChange,
  options,
  selectedLabel,
  placeholder = "Выберите значение",
  searchPlaceholder = "Поиск...",
  emptyText = "Ничего не найдено",
  disabled,
  clearable,
  onSearchChange,
  isLoading,
  footer,
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;
  const label = selected?.label ?? (value ? selectedLabel : undefined);

  const filtered = useMemo(() => {
    if (onSearchChange) return options;
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(term) || o.hint?.toLowerCase().includes(term),
    );
  }, [options, search, onSearchChange]);

  const close = () => {
    setOpen(false);
    setSearch("");
    onSearchChange?.("");
  };

  // Закрытие по клику вне компонента
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      setHighlight(0);
      inputRef.current?.focus();
    }
  }, [open]);

  const pick = (option: ComboboxOption) => {
    onChange(option.value, option);
    close();
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn("truncate", !label && "text-muted-foreground")}>
          {label ?? placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              title="Очистить"
              className="rounded p-0.5 hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null, null);
              }}
            >
              <XIcon className="h-4 w-4 opacity-60" />
            </span>
          )}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg">
          <div className="relative mb-1">
            <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlight(0);
                onSearchChange?.(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlight((h) => Math.min(h + 1, filtered.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlight((h) => Math.max(h - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault(); // не отправлять форму
                  if (filtered[highlight]) pick(filtered[highlight]);
                } else if (e.key === "Escape") {
                  e.stopPropagation(); // не закрывать модалку
                  close();
                }
              }}
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-2 py-2 text-sm text-muted-foreground">Загрузка...</div>
            ) : filtered.length === 0 ? (
              <div className="px-2 py-2 text-sm text-muted-foreground">{emptyText}</div>
            ) : (
              filtered.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(o)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                    i === highlight && "bg-accent text-accent-foreground",
                  )}
                >
                  <CheckIcon
                    className={cn("mt-0.5 h-4 w-4 shrink-0", o.value === value ? "opacity-100" : "opacity-0")}
                  />
                  <span className="min-w-0">
                    <span className="block truncate">{o.label}</span>
                    {o.hint && (
                      <span className="block truncate text-xs text-muted-foreground">{o.hint}</span>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>

          {footer && <div className="mt-1 border-t pt-1">{footer(close, search)}</div>}
        </div>
      )}
    </div>
  );
};
