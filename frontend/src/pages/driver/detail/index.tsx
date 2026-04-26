import { Card, CardContent } from "@/components/ui/card";
import { DriverTransportCardSection } from "./ui/driver-transport-card-section";
import { useDriverDetailPage } from "./hooks";
import { DriverSection } from "./ui/driver-section";
import { DriveRemoveTransportCardModal } from "./ui/driver-remove-transport-card-modal";

export const EditDriverPage = () => {
  const {
    isLoading,
    driver,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    error,
    isSubmitting,
    showUnbindDialog,
    setShowUnbindDialog,
    isUnbinding,
    handleUnbindCard,
    transportCards,
    selectedCardId,
    setSelectedCardId,
  } = useDriverDetailPage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
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
    <div className="space-y-6">
      {/* Информация о водителе */}
      <DriverSection
        driver={driver}
        handleDelete={handleDelete}
        isDeleting={isDeleting}
        form={form}
        onSubmit={onSubmit}
        error={error}
        isSubmitting={isSubmitting}
      />

      {/* Транспортная карта водителя */}
      <DriverTransportCardSection
        driver={driver}
        setShowUnbindDialog={setShowUnbindDialog}
        isUnbinding={isUnbinding}
        selectedCardId={selectedCardId}
        setSelectedCardId={setSelectedCardId}
        transportCards={transportCards}
      />

      {/* Модальное окно подтверждения отвязки */}
      <DriveRemoveTransportCardModal
        setShowUnbindDialog={setShowUnbindDialog}
        showUnbindDialog={showUnbindDialog}
        driver={driver}
        isUnbinding={isUnbinding}
        handleUnbindCard={handleUnbindCard}
      />
    </div>
  );
};
