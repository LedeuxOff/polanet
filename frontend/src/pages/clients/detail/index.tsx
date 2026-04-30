import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useClientDetailPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientMainInfo } from "./ui/client-main-info";
import { ClientPayerInfo } from "./ui/client-payer-info";
import { ClientReceiverInfo } from "./ui/client-receiver-info";
import { ChevronLeft, MenuIcon, TrashIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { ClientForm } from "@/lib/types";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

const ClientDetailContent = () => {
  const navigate = useNavigate();
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
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
    error,
  } = useClientDetailPage(clientId);

  // Показываем лоадер пока загружаются данные или permissions
  if (isLoading || isPermissionsLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  const handleSubmit = async (data: ClientForm) => {
    // Проверяем права на обновление
    if (!hasPermission("clients:update")) {
      showToast("У вас нет прав на редактирование клиента", "error");
      return;
    }

    const result = await onSubmit(data);
    if (result.success) {
      showToast("Клиент успешно сохранен", "success");
      navigate({ to: "/clients" });
    } else if (result.error) {
      showToast(result.error, "error");
    }
  };

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
                Список
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

      <form onSubmit={form.handleSubmit(handleSubmit)} className="pb-24">
        {error && <div className="p-3 bg-red-600 text-white rounded-md text-sm">{error}</div>}
        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4`}>
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

        <div
          className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
        >
          <Button
            type="button"
            disabled={isDeleting || isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/clients" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {isMobile && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={() => setOpen(true)}
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
          )}

          {client && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={() => {
                if (!hasPermission("clients:delete")) {
                  showToast("У вас нет прав на удаление клиента", "error");
                  return;
                }
                handleDelete(showToast);
              }}
              disabled={isDeleting || isSubmitting}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="button"
            onClick={() => {
              const data = form.getValues();
              handleSubmit(data);
            }}
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

export const EditClientPage = () => {
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();

  // Проверяем права на просмотр деталки
  if (isPermissionsLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка прав доступа...
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission("clients:detail")) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">У вас нет доступа к этой странице</p>
          <Link to="/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Вернуться на главную
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <ClientDetailContent />;
};
