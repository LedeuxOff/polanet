import { useBackupsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { RefreshCw, RotateCcw, Trash2 } from "lucide-react";

export const BackupsPage = () => {
  const {
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
  } = useBackupsListPage();

  const columns: ColumnDef<{
    filename: string;
    path: string;
    size: number;
    createdAt: string;
  }>[] = [
    {
      accessorKey: "filename",
      header: "Имя файла",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.filename}</span>,
    },
    {
      accessorKey: "size",
      header: "Размер",
      cell: ({ row }) => formatFileSize(row.original.size),
    },
    {
      accessorKey: "createdAt",
      header: "Дата создания",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRestore(row.original.filename)}
            disabled={isRestoring === row.original.filename}
            title="Восстановить базу данных"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {isRestoring === row.original.filename ? "Восстановление..." : "Восстановить"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.filename)}
            disabled={isDeleting === row.original.filename}
            title="Удалить резервную копию"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting === row.original.filename ? "Удаление..." : "Удалить"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Резервные копии</CardTitle>
          <Button onClick={handleCreate} disabled={isCreating}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isCreating ? "animate-spin" : ""}`} />
            {isCreating ? "Создание..." : "Создать бэкап"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет доступных резервных копий. Создайте первую бэкап.
          </div>
        ) : (
          <DataTable columns={columns} data={backups} />
        )}
      </CardContent>
    </Card>
  );
};
