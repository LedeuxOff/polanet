import { Link, useNavigate } from "@tanstack/react-router";
import { useClientsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";

export const ClientsPage = () => {
  const navigate = useNavigate();
  const { clients, isLoading, handleDelete } = useClientsListPage();

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ getValue }) => {
        const type = getValue<"individual" | "legal">();
        return type === "individual" ? "Физ. лицо" : "Юр. лицо";
      },
    },
    {
      accessorKey: "name",
      header: "Наименование",
      cell: ({ row }) => {
        const client = row.original;
        const name =
          client.type === "individual"
            ? `${client.lastName} ${client.firstName} ${client.middleName || ""}`.trim()
            : client.organizationName || "—";

        return (
          <button
            onClick={() =>
              navigate({
                to: "/clients/$clientId",
                params: { clientId: String(row.original.id) },
              })
            }
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted/50 transition-colors shadow-sm text-sm"
          >
            <span className="font-medium">{name}</span>
          </button>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
          Удалить
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Клиенты</CardTitle>
          <Link to="/clients/new">
            <Button>Добавить клиента</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable columns={columns} data={clients} />
        )}
      </CardContent>
    </Card>
  );
};
