import { Link } from "@tanstack/react-router";
import { useTemplatesListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Template } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { HomeIcon, MenuIcon, SearchIcon, ChevronUp, ChevronDown, TrashIcon } from "lucide-react";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export const TemplatesPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const { templates, isLoading, search, handleSearchChange, handleDelete } = useTemplatesListPage();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const getTypeLabel = (type: "delivery" | "pickup") => {
    return type === "delivery" ? "Доставка" : "Получение";
  };

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ getValue }) => {
        const type = getValue<"delivery" | "pickup">();
        return <Badge variant="secondary">{getTypeLabel(type)}</Badge>;
      },
    },
    {
      accessorKey: "address",
      header: "Адрес",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
    {
      accessorKey: "clientName",
      header: "Клиент",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
    {
      accessorKey: "payerLastName",
      header: "Плательщик",
      cell: ({ row }) => {
        const t = row.original;
        return `${t.payerLastName} ${t.payerFirstName}`;
      },
    },
    {
      accessorKey: "receiverLastName",
      header: "Приемщик",
      cell: ({ row }) => {
        const t = row.original;
        return `${t.receiverLastName} ${t.receiverFirstName}`;
      },
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(template.id);
            }}
            className="px-3 bg-red-400 rounded-2xl text-white flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" /> Удалить
          </Button>
        );
      },
    },
  ];

  return (
    <PermissionGuard permission="templates:list">
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle>Мои шаблоны</CardTitle>
          </CardHeader>
        </Card>

        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по шаблону..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable columns={columns} data={templates} />
        )}

        <div
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[58px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[58px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
        >
          <div
            onClick={() => setHideBottomTabbar(false)}
            className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronUp className="text-white w-5" />
          </div>

          <Link to="/">
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            >
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

          <Button
            onClick={() => setHideBottomTabbar(true)}
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </PermissionGuard>
  );
};
