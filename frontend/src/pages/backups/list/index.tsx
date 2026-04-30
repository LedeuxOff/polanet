import { useBackupsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { HomeIcon, MenuIcon, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

export const BackupsPage = () => {
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

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
    canCreate,
    canRestore,
    canDelete,
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
          {canRestore && (
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
          )}
          {canDelete && (
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
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Резервные копии</CardTitle>

            <div className="flex items-center gap-2">
              <span className="text-sm text-black">Список резервных копий</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : (
            <DataTable columns={columns} data={backups} />
          )}
        </CardContent>
      </Card>

      <div
        className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
      >
        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        {isMobile && (
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        )}

        {canCreate && (
          <Button
            onClick={handleCreate}
            type="button"
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Создать копию
          </Button>
        )}
      </div>
    </div>
  );
};
