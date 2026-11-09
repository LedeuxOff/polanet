import { useEffect, useRef, useState } from "react";
import { UserPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { InputPhone } from "@/components/ui/input-phone";
import { Label } from "@/components/ui/label";
import { clientsApi } from "@/lib/api";
import type { Client, WorkClient } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { getClientName } from "../consts";

export type ClientPickerValue =
  | { mode: "existing"; client: WorkClient | null }
  | { mode: "new"; firstName: string; phone?: string };

interface Props {
  value: ClientPickerValue;
  onChange: (value: ClientPickerValue) => void;
  disabled?: boolean;
  /** Можно ли создать нового клиента прямо из формы */
  canCreateClient: boolean;
}

const toWorkClient = (c: Client): WorkClient => ({
  id: c.id,
  type: c.type,
  lastName: c.lastName,
  firstName: c.firstName,
  middleName: c.middleName,
  organizationName: c.organizationName,
  phone: c.phone,
  email: c.email,
});

/** Клиент работы: выпадающий список с поиском по имени/названию и телефону или новый клиент */
export const ClientPicker = ({ value, onChange, disabled, canCreateClient }: Props) => {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Поиск на сервере с задержкой; без запроса — первые клиенты
  useEffect(() => {
    if (value.mode !== "existing") return;
    if (timer.current) clearTimeout(timer.current);
    const term = search.trim();
    timer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const digits = term.replace(/\D/g, "");
        const query = digits.length >= 4 && /^[\d\s()+-]+$/.test(term) ? digits : term;
        const res = await clientsApi.list({ search: query || undefined, limit: 20 });
        setClients(res.data);
      } catch {
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    }, term ? 300 : 0);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [search, value.mode]);

  if (value.mode === "new") {
    return (
      <div className="space-y-3 rounded-lg border border-dashed p-3 dark:border-white/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Новый клиент</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange({ mode: "existing", client: null })}
          >
            Выбрать из списка
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Имя *</Label>
            <Input
              value={value.firstName}
              disabled={disabled}
              placeholder="Например: Дмитрий от Антона"
              onChange={(e) => onChange({ ...value, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Телефон</Label>
            <InputPhone
              value={value.phone}
              disabled={disabled}
              onPhoneChange={(phone) => onChange({ ...value, phone })}
            />
          </div>
        </div>
      </div>
    );
  }

  const selected = value.client;
  const options: ComboboxOption[] = clients.map((c) => ({
    value: String(c.id),
    label: getClientName(toWorkClient(c)),
    hint: formatPhoneDisplay(c.phone) || undefined,
  }));

  return (
    <Combobox
      value={selected ? String(selected.id) : null}
      selectedLabel={selected ? getClientName(selected) : undefined}
      options={options}
      placeholder="Выберите клиента"
      searchPlaceholder="Поиск по имени, названию или телефону"
      emptyText="Клиенты не найдены"
      disabled={disabled}
      clearable
      isLoading={isLoading}
      onSearchChange={setSearch}
      onChange={(id) => {
        const client = clients.find((c) => String(c.id) === id);
        onChange({ mode: "existing", client: client ? toWorkClient(client) : null });
      }}
      footer={
        canCreateClient
          ? (close, term) => (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-blue-600 hover:bg-accent dark:text-blue-300"
                onClick={() => {
                  close();
                  onChange({ mode: "new", firstName: term.trim() });
                }}
              >
                <UserPlusIcon className="h-4 w-4" /> Новый клиент
                {term.trim() ? ` «${term.trim()}»` : ""}
              </button>
            )
          : undefined
      }
    />
  );
};
