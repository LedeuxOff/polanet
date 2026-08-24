import { useNavigate } from "@tanstack/react-router";
import { useTransportCardDetailPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { PageError } from "@/components/screens/error";
import { TransportCardPageHead } from "./ui/transport-card-head";
import { TransportCardPageForm } from "./ui/transport-card-form";
import { BottomBar } from "@/components/bottom-bar";

export const TransportCardDetailPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const { user } = useAuth();

  const {
    isLoading,
    card,
    error,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    isSubmitting,
    expenseAmount,
    setExpenseAmount,
    expenseDateTime,
    setExpenseDateTime,
    expensePaymentType,
    setExpensePaymentType,
    handleAddExpense,
    isAddingExpense,
    handleRemoveExpense,
    showExpenseDialog,
    setShowExpenseDialog,
    openExpenseDialog,
  } = useTransportCardDetailPage();

  if (isLoading || isPermissionsLoading) {
    return <PermissionsLoader />;
  }

  if (!hasPermission("transport-cards:detail")) {
    return <NoAccessScreen />;
  }

  if (!card || error) {
    return <PageError />;
  }

  // Проверяем, является ли пользователь администратором или разработчиком
  const isRoleAdminOrDeveloper = user?.roleCode === "ADMIN" || user?.roleCode === "DEVELOPER";

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!hasPermission("transport-cards:update")) {
      showToast("У вас нет прав на редактирование карты", "error");
      return;
    }
    await onSubmit(data);
    showToast("Транспортная карта успешно сохранена", "success");
    navigate({ to: "/transport-cards" });
  });

  return (
    <div className="flex flex-col gap-4 pb-4">
      <TransportCardPageHead card={card} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TransportCardPageForm
          isSubmitting={isSubmitting}
          form={form}
          card={card}
          openExpenseDialog={openExpenseDialog}
          handleRemoveExpense={handleRemoveExpense}
          showExpenseDialog={showExpenseDialog}
          setShowExpenseDialog={setShowExpenseDialog}
          expensePaymentType={expensePaymentType}
          setExpensePaymentType={setExpensePaymentType}
          expenseAmount={expenseAmount}
          setExpenseAmount={setExpenseAmount}
          expenseDateTime={expenseDateTime}
          setExpenseDateTime={setExpenseDateTime}
          handleAddExpense={handleAddExpense}
          isAddingExpense={isAddingExpense}
          hasPermission={hasPermission}
          showToast={showToast}
          isRoleAdminOrDeveloper={isRoleAdminOrDeveloper}
        />

        <BottomBar
          saveLabel={isSubmitting ? "Сохранение..." : "Сохранить"}
          isSumitting={isSubmitting}
          onBack={() => navigate({ to: "/transport-cards" })}
          showDeleteButton
          isDeleting={isDeleting}
          handleDelete={() => {
            if (!hasPermission("transport-cards:delete")) {
              showToast("У вас нет прав на удаление карты", "error");
              return;
            }
            handleDelete();
          }}
        />
      </form>
    </div>
  );
};
