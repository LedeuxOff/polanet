import { useMemo, useState } from "react";
import { CheckIcon, KeyRoundIcon, SearchIcon } from "lucide-react";
import { SectionCard } from "@/components/data-list";
import { Input } from "@/components/ui/input";
import type { Permission } from "@/lib/api/permissions-api";
import { cn } from "@/lib/utils";

interface Props {
  permissionsByModule: Record<string, Permission[]>;
  moduleNames: Record<string, string>;
  rolePermissions: string[];
  togglePermission: (code: string) => void;
  toggleModulePermissions: (perms: Permission[]) => void;
  /** Есть несохранённые изменения прав */
  isDirty?: boolean;
}

export const RolePermissions = ({
  permissionsByModule,
  moduleNames,
  rolePermissions,
  togglePermission,
  toggleModulePermissions,
  isDirty,
}: Props) => {
  const [search, setSearch] = useState("");
  const selected = useMemo(() => new Set(rolePermissions), [rolePermissions]);

  const total = Object.values(permissionsByModule).reduce((n, list) => n + list.length, 0);

  const modules = useMemo(() => {
    const term = search.trim().toLowerCase();
    return Object.entries(permissionsByModule)
      .map(([key, perms]) => {
        const title = moduleNames[key] || key;
        const list =
          !term || title.toLowerCase().includes(term)
            ? perms
            : perms.filter(
                (p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term),
              );
        return { key, title, perms, list };
      })
      .filter((m) => m.list.length > 0);
  }, [permissionsByModule, moduleNames, search]);

  return (
    <SectionCard
      icon={<KeyRoundIcon />}
      iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300"
      title="Права доступа"
      description={`Выбрано ${rolePermissions.length} из ${total}`}
      action={
        isDirty && (
          <span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 sm:inline dark:bg-amber-400/20 dark:text-amber-200">
            Есть несохранённые изменения
          </span>
        )
      }
    >
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="h-11 rounded-2xl pl-9 dark:border-white/20 dark:bg-white/10"
          placeholder="Поиск по разделу или праву"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {modules.map(({ key, title, perms, list }) => {
          const count = perms.filter((p) => selected.has(p.code)).length;
          const all = count === perms.length;
          const pct = perms.length ? (count / perms.length) * 100 : 0;

          return (
            <div
              key={key}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-4 transition-colors",
                count > 0
                  ? "border-slate-200 bg-white dark:border-white/15 dark:bg-white/5"
                  : "border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-transparent",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                      {title}
                    </span>
                    <span className="text-xs tabular-nums text-slate-400">
                      {count}/{perms.length}
                    </span>
                  </div>
                  <div className="h-1 w-full max-w-[160px] overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        all ? "bg-emerald-500" : "bg-blue-500",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleModulePermissions(perms)}
                  className={cn(
                    "h-8 shrink-0 rounded-xl px-3 text-xs font-medium transition-colors",
                    all
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-200 dark:hover:bg-blue-500/25",
                  )}
                >
                  {all ? "Снять все" : "Выбрать все"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {list.map((p) => {
                  const on = selected.has(p.code);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePermission(p.code)}
                      aria-pressed={on}
                      title={p.code}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition-all active:scale-95",
                        on
                          ? "border-blue-200 bg-blue-50 font-medium text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/15 dark:text-blue-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/15 dark:bg-transparent dark:text-slate-300 dark:hover:border-white/25",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-md border transition-colors",
                          on
                            ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-slate-900"
                            : "border-slate-300 dark:border-white/30",
                        )}
                      >
                        {on && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {modules.length === 0 && (
          <div className="col-span-full py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Ничего не найдено
          </div>
        )}
      </div>
    </SectionCard>
  );
};
