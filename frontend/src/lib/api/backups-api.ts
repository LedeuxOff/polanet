import { request } from ".";

export interface Backup {
  filename: string;
  path: string;
  size: number;
  createdAt: string;
}

export const backupsApi = {
  // Получить список всех резервных копий
  list: () => request<Backup[]>("/backups"),

  // Создать новую резервную копию
  create: () =>
    request<{
      message: string;
      backup: Backup;
    }>("/backups", {
      method: "POST",
    }),

  // Восстановить из резервной копии
  restore: (filename: string) =>
    request<{
      message: string;
      backupPath: string;
    }>(`/backups/${filename}/restore`, {
      method: "POST",
    }),

  // Удалить резервную копию
  delete: (filename: string) =>
    request<{
      message: string;
      filename: string;
    }>(`/backups/${filename}`, {
      method: "DELETE",
    }),
};
