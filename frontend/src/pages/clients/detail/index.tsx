import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useClientDetailPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientMainInfo } from "./ui/client-main-info";
import { ClientPayerInfo } from "./ui/client-payer-info";
import { ClientReceiverInfo } from "./ui/client-receiver-info";
import { ChevronDown, ChevronLeft, ChevronUp, MenuIcon, TrashIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { ClientForm } from "@/lib/types";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const ClientDetailContent = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

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
      <Card className="rounded-2xl shadow-xl">
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
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Клиент не найден
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Клиенты</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/clients" className="text-sm text-muted-foreground">
                <Badge variant="outline">Список</Badge>
              </Link>

              <span className="w-1 h-1 bg-blue-400 rounded-full" />

              <Badge variant="secondary">
                {client.type === "individual"
                  ? `${client.lastName} ${client.firstName} ${client.middleName || ""}`.trim()
                  : client.organizationName}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {error && <div className="p-3 bg-red-600 text-white rounded-md text-sm">{error}</div>}
        <div className={`flex flex-col gap-4`}>
          <ClientMainInfo
            form={form}
            clientType={clientType}
            setClientType={setClientType}
            isSubmitting={isSubmitting}
          />

          <ClientPayerInfo form={form} isSubmitting={isSubmitting} />

          <ClientReceiverInfo form={form} isSubmitting={isSubmitting} />
        </div>

        <div
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[58px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[58px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
        >
          <div
            onClick={() => setHideBottomTabbar(false)}
            className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronUp className="text-white w-5" />
          </div>

          <Button
            type="button"
            disabled={isDeleting || isSubmitting}
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            onClick={() => navigate({ to: "/clients" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {isMobile && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
              onClick={() => setOpen(true)}
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
          )}

          {client && (
            <Button
              type="button"
              className="px-3 py-4 bg-red-400 rounded-2xl hover:bg-red-500"
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
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>

          <Button
            onClick={() => setHideBottomTabbar(true)}
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
          >
            <ChevronDown className="w-4 h-4" />
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
