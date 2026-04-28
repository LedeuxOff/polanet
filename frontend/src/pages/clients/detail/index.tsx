import { Link, useNavigate } from "@tanstack/react-router";
import { useClientDetailPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientMainInfo } from "./ui/client-main-info";
import { ClientPayerInfo } from "./ui/client-payer-info";
import { ClientReceiverInfo } from "./ui/client-receiver-info";
import { ChevronLeft, TrashIcon } from "lucide-react";

export const EditClientPage = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    client,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    clientType,
    setClientType,
    isSubmitting,
  } = useClientDetailPage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Клиент не найден
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Клиенты</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/clients" className="text-sm text-muted-foreground">
                Список клиентов
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">
                {client.type === "individual"
                  ? `${client.lastName} ${client.firstName} ${client.middleName || ""}`.trim()
                  : client.organizationName}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <ClientMainInfo
              form={form}
              clientType={clientType}
              setClientType={setClientType}
              isSubmitting={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <ClientPayerInfo form={form} isSubmitting={isSubmitting} />

            <ClientReceiverInfo form={form} isSubmitting={isSubmitting} />
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Button
            type="button"
            disabled={isDeleting || isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/clients" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {client && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="submit"
            disabled={isDeleting || isSubmitting}
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
};
