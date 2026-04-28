import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverTransportCardSection } from "./ui/driver-transport-card-section";
import { useDriverDetailPage } from "./hooks";
import { DriverSection } from "./ui/driver-section";
import { DriveRemoveTransportCardModal } from "./ui/driver-remove-transport-card-modal";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, TrashIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";

export const EditDriverPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const {
    isLoading,
    driver,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    isSubmitting,
    showUnbindDialog,
    setShowUnbindDialog,
    isUnbinding,
    handleUnbindCard,
    transportCards,
    selectedCardId,
    setSelectedCardId,
  } = useDriverDetailPage();

  if (isLoading || isPermissionsLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!hasPermission("drivers:detail")) {
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

  if (!driver) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Водитель не найден
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Водители</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/drivers" className="text-sm text-muted-foreground">
                Список водителей
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">
                {`${driver.lastName} ${driver.firstName} ${driver.middleName || ""}`.trim()}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!hasPermission("drivers:update")) {
            showToast("У вас нет прав на редактирование водителя", "error");
            return;
          }
          await onSubmit(data);
          showToast("Водитель успешно сохранен", "success");
          navigate({ to: "/drivers" });
        })}
      >
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverSection form={form} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Транспортная карта</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverTransportCardSection
                  driver={driver}
                  setShowUnbindDialog={setShowUnbindDialog}
                  isUnbinding={isUnbinding}
                  selectedCardId={selectedCardId}
                  setSelectedCardId={setSelectedCardId}
                  transportCards={transportCards}
                />

                <DriveRemoveTransportCardModal
                  setShowUnbindDialog={setShowUnbindDialog}
                  showUnbindDialog={showUnbindDialog}
                  driver={driver}
                  isUnbinding={isUnbinding}
                  handleUnbindCard={handleUnbindCard}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Button
            type="button"
            disabled={isDeleting || isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/drivers" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {driver && (
            <Button
              type="button"
              className="px-3 py-4 bg-red-600 rounded-md hover:bg-red-700"
              onClick={() => {
                if (!hasPermission("drivers:delete")) {
                  showToast("У вас нет прав на удаление водителя", "error");
                  return;
                }
                handleDelete();
              }}
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
