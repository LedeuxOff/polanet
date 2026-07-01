import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverTransportCardSection } from "./ui/driver-transport-card-section";
import { useDriverDetailPage } from "./hooks";
import { DriverSection } from "./ui/driver-section";
import { DriveRemoveTransportCardModal } from "./ui/driver-remove-transport-card-modal";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronUp, MenuIcon, TrashIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export const EditDriverPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
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
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!hasPermission("drivers:detail")) {
    return (
      <Card className="rounded-2xl shadow-xl">
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
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Водитель не найден
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Водители</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/drivers" className="text-sm text-muted-foreground">
                <Badge variant="outline">Список</Badge>
              </Link>

              <span className="w-1 h-1 bg-blue-400 rounded-full" />

              <Badge variant="secondary">
                {`${driver.lastName} ${driver.firstName} ${driver.middleName || ""}`.trim()}
              </Badge>
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
        <div className={`flex flex-col gap-4 pb-32`}>
          <div className="flex flex-col gap-4 flex-1">
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverSection form={form} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <Card className="rounded-2xl shadow-xl">
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
            onClick={() => navigate({ to: "/drivers" })}
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

          {driver && (
            <Button
              type="button"
              className="px-3 py-4 bg-red-400 rounded-2xl hover:bg-red-500"
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
