import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { User } from "@/lib/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useUsersList } from "./hooks";

export const UsersPage = () => {
  const navigate = useNavigate();
  const { users, isLoading, handleDelete } = useUsersList();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "ФИО",
      cell: ({ row }) => {
        const lastName = row.original.lastName;
        const firstName = row.original.firstName;
        const middleName = row.original.middleName;

        const initials = [firstName?.charAt(0), middleName?.charAt(0)].filter(Boolean).join(".");

        const fullName = initials ? `${lastName} ${initials}.` : lastName;

        return (
          <button
            onClick={() =>
              navigate({
                to: "/users/$userId",
                params: { userId: String(row.original.id) },
              })
            }
            className="inline-flex items-center gap-2 px-2 py-1 rounded-md border bg-background hover:bg-muted/50 transition-colors shadow-sm text-sm"
          >
            <span className="font-medium">{fullName}</span>
          </button>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
    {
      accessorKey: "roleName",
      header: "Роль",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
  ];

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Пользователи</CardTitle>
          <Link to="/users/new">
            <Button>Добавить пользователя</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </CardContent>
    </Card>
  );
};
