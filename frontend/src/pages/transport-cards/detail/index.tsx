import { useNavigate } from "@tanstack/react-router";
import { useTransportCardDetailPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { PageError } from "@/components/screens/error";
import { TransportCardPageHead } from "./ui/transport-card-head";
import { FormBuilder } from "@/widgets/form-builder";
import { TransportCardExpenses } from "./ui/transport-card-expenses";
import { TransportCardHistory } from "./ui/transport-card-history";

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
    showToast("Топливная карта успешно сохранена", "success");
    navigate({ to: "/transport-cards" });
  });

  const totalExpenses = card?.totalExpenses || 0;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <TransportCardPageHead card={card} />

      <FormBuilder
        form={form}
        sections={[
          {
            id: "main-info",
            label: "Основная информация",
            fields: [
              {
                id: "cardNumber",
                label: "Номер карты",
                type: "text",
                disabled: isSubmitting,
                className: "col-span-3",
              },
              {
                id: "status",
                label: "Статус",
                type: "select",
                disabled: isSubmitting,
                select: {
                  options: [
                    { id: "active", name: "Активна" },
                    { id: "inactive", name: "Неактивна" },
                  ],
                },
                className: "col-span-3",
              },
            ],
          },
          {
            id: "expenses",
            label: "Расходы",
            fields: [
              {
                id: "cardNumber",
                label: "Расходы",
                type: "controller",
                className: "col-span-3",
                Controller: () => (
                  <TransportCardExpenses
                    totalExpenses={totalExpenses}
                    openExpenseDialog={openExpenseDialog}
                    card={card}
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
                  />
                ),
              },
            ],
          },
          {
            id: "history",
            label: "История изменений",
            hide: !isRoleAdminOrDeveloper,
            fields: [
              {
                id: "cardNumber",
                label: "История",
                type: "controller",
                className: "col-span-3",
                Controller: () => <TransportCardHistory card={card} />,
              },
            ],
          },
        ]}
        actions={{
          submit: {
            onSubmit: handleSubmit,
            isSubmitting: isSubmitting,
            disabled: isSubmitting || isDeleting,
            label: isSubmitting ? "Сохранение..." : "Сохранить",
          },
          back: () => navigate({ to: "/transport-cards" }),
          delete: {
            onDelete: () => {
              if (!hasPermission("transport-cards:delete")) {
                showToast("У вас нет прав на удаление карты", "error");
                return;
              }
              handleDelete();
            },
            isDeleting: isDeleting,
            disabled: isDeleting || isSubmitting,
          },
        }}
      />
    </div>
  );
};
