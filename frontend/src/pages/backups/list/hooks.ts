import { backupsApi } from "@/lib/api/backups-api";
import { Backup } from "@/lib/api/backups-api";
import { useEffect, useState } from "react";
import { usePermissions } from "@/lib/contexts/permission-context";

export const useBackupsListPage = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { hasPermission } = usePermissions();

  const loadBackups = async () => {
    try {
      const data = await backupsApi.list();
      setBackups(data);
    } catch (error) {
      console.error("Ошибка загрузки бэкапов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await backupsApi.create();
      await loadBackups();
    } catch (error) {
      alert("Ошибка при создании резервной копии: " + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (filename: string) => {
    if (
      !confirm(
        `Вы уверены, что хотите восстановить базу данных из "${filename}"? Текущее состояние будет сохранено как бэкап.`,
      )
    ) {
      return;
    }

    setIsRestoring(filename);
    try {
      await backupsApi.restore(filename);
      await loadBackups();
      alert("База данных успешно восстановлена!");
    } catch (error) {
      alert("Ошибка при восстановлении: " + (error as Error).message);
    } finally {
      setIsRestoring(null);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Вы уверены, что хотите удалить резервную копию "${filename}"?`)) {
      return;
    }

    setIsDeleting(filename);
    try {
      await backupsApi.delete(filename);
      setBackups(backups.filter((b) => b.filename !== filename));
    } catch (error) {
      alert("Ошибка при удалении: " + (error as Error).message);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("ru-RU");
  };

  const canCreate = hasPermission("backups:create");
  const canRestore = hasPermission("backups:restore");
  const canDelete = hasPermission("backups:delete");

  return {
    backups,
    isLoading,
    isCreating,
    isRestoring,
    isDeleting,
    handleCreate,
    handleRestore,
    handleDelete,
    formatFileSize,
    formatDate,
    canCreate,
    canRestore,
    canDelete,
  };
};
