import { useBackupsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { ChevronDown, ChevronUp, HomeIcon, MenuIcon, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";

export const BackupsPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const {
    backups,
    isLoading,
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
              className="rounded-2xl"
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
              className="rounded-2xl"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle>Резервные копии</CardTitle>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      ) : (
        <DataTable columns={columns} data={backups} />
      )}

      <div
        className={`fixed transition-all ${isMobile ? "bottom-2" : hideBottomTabbar ? "-bottom-14" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
      >
        <div
          onClick={() => setHideBottomTabbar(false)}
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronUp className="text-white w-5" />
        </div>

        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600">
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        {isMobile && (
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        )}

        {canCreate && (
          <Button
            type="button"
            onClick={handleCreate}
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600"
          >
            Создать
          </Button>
        )}

        <Button
          onClick={() => setHideBottomTabbar(true)}
          type="button"
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
