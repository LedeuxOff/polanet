import { useEffect, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { workersApi } from "@/lib/api";
import { Worker, getWorkerName } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  /** Подпись текущего замерщика (если список ещё не загружен) */
  selectedLabel?: string;
  /** Имя замерщика из старой системы — подсказка, пока рабочий не выбран */
  legacyName?: string | null;
  disabled?: boolean;
}

/** Замерщик: выбор из рабочих (роль WORKER) с поиском */
export const MeasurerPicker = ({ value, onChange, selectedLabel, legacyName, disabled }: Props) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    workersApi
      .list({ limit: 500 })
      .then((res) => setWorkers(res.data))
      .catch(() => setWorkers([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Combobox
      value={value ? String(value) : null}
      selectedLabel={selectedLabel}
      options={workers.map((w) => ({
        value: String(w.id),
        label: getWorkerName(w),
        hint: [formatPhoneDisplay(w.phone), w.teamName].filter(Boolean).join(" · ") || undefined,
      }))}
      placeholder={legacyName ? `Из старой системы: ${legacyName}` : "Выберите замерщика"}
      searchPlaceholder="Поиск по ФИО или телефону"
      emptyText="Рабочие не найдены — добавьте их в разделе «Рабочие»"
      isLoading={isLoading}
      disabled={disabled}
      clearable
      onChange={(id) => onChange(id ? Number(id) : null)}
    />
  );
};
