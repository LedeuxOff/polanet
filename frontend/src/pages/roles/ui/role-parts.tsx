import { ShieldCheckIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/data-list";
import { cn } from "@/lib/utils";

export const roleTone = "bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300";

export const RoleCodeBadge = ({ code, className }: { code: string; className?: string }) => (
  <span
    className={cn(
      "inline-flex w-fit items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-medium text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300",
      className,
    )}
  >
    {code}
  </span>
);

export const RoleIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex shrink-0 items-center justify-center", roleTone, className)}>
    <ShieldCheckIcon className="h-1/2 w-1/2" />
  </div>
);

type RoleFormValues = { code?: string; name?: string };

/** Блок «Основная информация» роли: код + название */
export const RoleMainInfo = <T extends RoleFormValues>({
  form,
  disabled,
}: {
  form: UseFormReturn<T>;
  disabled?: boolean;
}) => {
  const f = form as unknown as UseFormReturn<RoleFormValues>;
  return (
    <SectionCard
      icon={<ShieldCheckIcon />}
      iconClassName={roleTone}
      title="Основная информация"
      description="Код используется в системе, название видят пользователи"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Название *</Label>
          <Input
            className="rounded-2xl dark:border-white/20 dark:bg-white/10"
            id="name"
            placeholder="Администратор"
            disabled={disabled}
            {...f.register("name")}
          />
          {f.formState.errors.name && (
            <p className="text-sm text-destructive">{f.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Код роли *</Label>
          <Input
            className="rounded-2xl font-mono uppercase dark:border-white/20 dark:bg-white/10"
            id="code"
            placeholder="ADMIN"
            disabled={disabled}
            {...f.register("code")}
          />
          {f.formState.errors.code && (
            <p className="text-sm text-destructive">{f.formState.errors.code.message}</p>
          )}
        </div>
      </div>
    </SectionCard>
  );
};
