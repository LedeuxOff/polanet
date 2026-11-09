import { useCallback, useEffect, useState } from "react";
import { directoriesApi } from "@/lib/api";
import type { WorkStatusRef, WorkTypeRef } from "@/lib/types";

type Directories = { statuses: WorkStatusRef[]; types: WorkTypeRef[] };

// Справочники меняются редко — грузим один раз на сессию и делим между компонентами
let cache: Promise<Directories> | null = null;
const listeners = new Set<(d: Directories) => void>();

const load = () => {
  if (!cache) {
    cache = Promise.all([directoriesApi.workStatuses(), directoriesApi.workTypes()])
      .then(([statuses, types]) => ({ statuses, types }))
      .catch((err) => {
        cache = null; // попробуем снова при следующем обращении
        throw err;
      });
  }
  return cache;
};

/** Сбросить кеш после изменения справочников и разослать свежие данные */
export const invalidateWorkDirectories = async () => {
  cache = null;
  const data = await load();
  listeners.forEach((l) => l(data));
  return data;
};

/** Статусы и типы работ из справочников */
export const useWorkDirectories = () => {
  const [data, setData] = useState<Directories>({ statuses: [], types: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const listener = (d: Directories) => alive && setData(d);
    listeners.add(listener);
    load()
      .then((d) => alive && setData(d))
      .catch(() => undefined)
      .finally(() => alive && setIsLoading(false));
    return () => {
      alive = false;
      listeners.delete(listener);
    };
  }, []);

  const reload = useCallback(() => invalidateWorkDirectories(), []);

  return { ...data, isLoading, reload };
};
