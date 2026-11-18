import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/lib/contexts/permission-context";
import type { Team, Work, WorkInput } from "@/lib/types";
import { preparePhoneForApi } from "@/lib/utils/phone";
import { cn } from "@/lib/utils";
import {
  NO_TEAM,
  STRENGTH_OPTIONS,
  DAY_END,
  DAY_START,
  TIME_OPTIONS,
  minutesToTime,
  getStatusClasses,
  getVolume,
} from "../consts";
import type { Slot } from "../hooks";
import { ClientPicker, type ClientPickerValue } from "./client-picker";
import { MeasurerPicker } from "./measurer-picker";
import { useWorkDirectories } from "../use-directories";

const NO_STRENGTH = "none";

/** Выбор времени из сетки 08:00–23:00 с шагом 30 минут */
const TimeSelect = ({
  value,
  onChange,
  disabled,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options: string[];
}) => (
  <Select value={value} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {/* Нестандартное время (не кратное 30 мин) сохраняем в списке */}
      {value && !options.includes(value) && <SelectItem value={value}>{value}</SelectItem>}
      {options.map((t) => (
        <SelectItem key={t} value={t}>
          {t}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const optionalNumber = z
  .string()
  .trim()
  .refine((v) => v === "" || (!Number.isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) >= 0), {
    message: "Введите неотрицательное число",
  });

const workFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Укажите дату"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Укажите время начала"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Укажите время окончания"),
  teamId: z.string(),
  status: z.string().min(1, "Выберите статус"),
  workType: z.string().min(1, "Выберите тип работ"),
  address: z.string(),
  area: optionalNumber,
  thickness: optionalNumber,
  strength: z.string(),
  price: optionalNumber,
  hoseLength: optionalNumber,
  isTransmix: z.boolean(),
  measurerId: z.number().nullable(),
  notes: z.string(),
}).refine((v) => v.endTime > v.startTime, {
  message: "Окончание должно быть позже начала",
  path: ["endTime"],
});

export type WorkFormValues = z.infer<typeof workFormSchema>;

const toNumber = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
const numToStr = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

const getDefaults = (initial: Work | Slot): WorkFormValues => {
  const work = "id" in initial ? initial : null;
  return {
    date: initial.date,
    startTime: initial.startTime ?? minutesToTime(DAY_START),
    endTime: initial.endTime ?? minutesToTime(DAY_END),
    teamId: initial.teamId ? String(initial.teamId) : NO_TEAM,
    status: work?.status ?? "preliminary",
    workType: work?.workType ?? "standard",
    address: work?.address ?? "",
    area: numToStr(work?.area),
    thickness: numToStr(work?.thickness),
    strength: work ? (work.strength ?? NO_STRENGTH) : "M150",
    price: numToStr(work?.price),
    hoseLength: numToStr(work?.hoseLength),
    isTransmix: work?.isTransmix ?? false,
    measurerId: work?.measurerId ?? null,
    notes: work?.notes ?? "",
  };
};

interface Props {
  /** Существующая работа (редактирование) или выбранный слот (создание) */
  initial: Work | Slot;
  teams: Team[];
  submitLabel: string;
  onSubmit: (input: WorkInput) => Promise<void>;
  onCancel: () => void;
}

export const WorkForm = ({ initial, teams, submitLabel, onSubmit, onCancel }: Props) => {
  const { hasPermission } = usePermissions();
  const { statuses, types } = useWorkDirectories();
  const currentWork = "id" in initial ? initial : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [client, setClient] = useState<ClientPickerValue>({
    mode: "existing",
    client: "id" in initial ? initial.client : null,
  });

  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    defaultValues: getDefaults(initial),
  });
  const { register, control, handleSubmit, watch, formState } = form;
  const errors = formState.errors;

  // Бригада могла быть деактивирована — оставляем её в списке, чтобы не потерять значение
  const currentTeam = "id" in initial ? initial.team : null;
  const teamOptions =
    currentTeam && !teams.some((t) => t.id === currentTeam.id)
      ? [...teams, { id: currentTeam.id, name: `${currentTeam.name} (неактивна)` }]
      : teams;

  const volume = getVolume(toNumber(watch("area") || ""), toNumber(watch("thickness") || ""));

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    if (client.mode === "new" && !client.firstName.trim()) {
      setFormError("Укажите имя нового клиента");
      return;
    }

    const input: WorkInput = {
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      teamId: values.teamId === NO_TEAM ? null : Number(values.teamId),
      status: values.status,
      workType: values.workType,
      address: values.address.trim() || null,
      area: toNumber(values.area),
      thickness: toNumber(values.thickness),
      strength: values.strength === NO_STRENGTH ? null : values.strength,
      price: values.price.trim() === "" ? null : Math.round(Number(values.price.replace(",", "."))),
      hoseLength: toNumber(values.hoseLength),
      isTransmix: values.isTransmix,
      measurerId: values.measurerId,
      notes: values.notes.trim() || null,
    };

    if (client.mode === "new") {
      input.newClient = {
        firstName: client.firstName.trim(),
        phone: preparePhoneForApi(client.phone) ?? null,
      };
    } else {
      input.clientId = client.client?.id ?? null;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(input);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Не удалось сохранить работу");
    } finally {
      setIsSubmitting(false);
    }
  });

  const fieldError = (name: keyof WorkFormValues) =>
    errors[name]?.message ? (
      <p className="text-xs text-destructive">{String(errors[name]?.message)}</p>
    ) : null;

  return (
    <form onSubmit={submit} className="space-y-5">
      {formError && (
        <div className="whitespace-pre-line rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      {/* Слот */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Слот</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Дата *</Label>
            <Input type="date" disabled={isSubmitting} {...register("date")} />
            {fieldError("date")}
          </div>
          <div className="space-y-1">
            <Label>Начало *</Label>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <TimeSelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  options={TIME_OPTIONS.slice(0, -1)}
                />
              )}
            />
            {fieldError("startTime")}
          </div>
          <div className="space-y-1">
            <Label>Окончание *</Label>
            <Controller
              control={control}
              name="endTime"
              render={({ field }) => (
                <TimeSelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  options={TIME_OPTIONS.slice(1)}
                />
              )}
            />
            {fieldError("endTime")}
          </div>
          <div className="space-y-1">
            <Label>Бригада</Label>
            <Controller
              control={control}
              name="teamId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TEAM}>Без бригады</SelectItem>
                    {teamOptions.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <Label>Статус</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Статус работы, которого нет в справочнике, оставляем в списке */}
                    {field.value && !statuses.some((s) => s.code === field.value) && (
                      <SelectItem value={field.value}>
                        {currentWork?.statusInfo.name ?? field.value}
                      </SelectItem>
                    )}
                    {statuses.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn("h-3 w-3 rounded-full border", getStatusClasses(s.color))}
                          />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </section>

      {/* Клиент */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Клиент</h3>
        <ClientPicker
          value={client}
          onChange={setClient}
          disabled={isSubmitting}
          canCreateClient={hasPermission("screed-clients:create")}
        />
      </section>

      {/* Объект */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Объект</h3>
        <div className="space-y-1">
          <Label>Адрес</Label>
          <Textarea rows={2} disabled={isSubmitting} {...register("address")} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label>Площадь, м²</Label>
            <Input inputMode="decimal" disabled={isSubmitting} {...register("area")} />
            {fieldError("area")}
          </div>
          <div className="space-y-1">
            <Label>Толщина, мм</Label>
            <Input inputMode="decimal" disabled={isSubmitting} {...register("thickness")} />
            {fieldError("thickness")}
          </div>
          <div className="space-y-1">
            <Label>Марка</Label>
            <Controller
              control={control}
              name="strength"
              render={({ field }) => (
                <Select
                  value={field.value || NO_STRENGTH}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_STRENGTH}>Не указана</SelectItem>
                    {/* Значение из старой системы, которого нет в списке, сохраняем */}
                    {field.value &&
                      field.value !== NO_STRENGTH &&
                      !STRENGTH_OPTIONS.includes(field.value) && (
                        <SelectItem value={field.value}>{field.value}</SelectItem>
                      )}
                    {STRENGTH_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <Label>Объём</Label>
            <div className="flex h-10 items-center rounded-md border px-3 text-sm text-muted-foreground dark:border-white/20">
              {volume ? `${volume} м³` : "—"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Тип работ</Label>
            <Controller
              control={control}
              name="workType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.value && !types.some((t) => t.code === field.value) && (
                      <SelectItem value={field.value}>
                        {currentWork?.workTypeInfo.name ?? field.value}
                      </SelectItem>
                    )}
                    {types.map((t) => (
                      <SelectItem key={t.code} value={t.code}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <Label>Длина рукава, м</Label>
            <Input inputMode="decimal" disabled={isSubmitting} {...register("hoseLength")} />
            {fieldError("hoseLength")}
          </div>
          <div className="flex items-end pb-2">
            <Controller
              control={control}
              name="isTransmix"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    disabled={isSubmitting}
                  />
                  Подача миксером
                </label>
              )}
            />
          </div>
        </div>
      </section>

      {/* Деньги и прочее */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Стоимость и детали</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Цена, ₽</Label>
            <Input inputMode="numeric" disabled={isSubmitting} {...register("price")} />
            {fieldError("price")}
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Замерщик</Label>
            <Controller
              control={control}
              name="measurerId"
              render={({ field }) => (
                <MeasurerPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  selectedLabel={
                    currentWork?.measurer && currentWork.measurer.id === field.value
                      ? [
                          currentWork.measurer.lastName,
                          currentWork.measurer.firstName,
                          currentWork.measurer.middleName,
                        ]
                          .filter(Boolean)
                          .join(" ")
                      : undefined
                  }
                  legacyName={currentWork?.measurerName}
                />
              )}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Заметки</Label>
          <Textarea rows={5} disabled={isSubmitting} {...register("notes")} />
        </div>
      </section>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
