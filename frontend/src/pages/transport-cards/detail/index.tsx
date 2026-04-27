import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTransportCardDetailPage } from "./hooks";
import { Button } from "@/components/ui/button";
import { TransportCardMainInfo } from "./ui/transport-card-main-info";
import { TransportCardExpenses } from "./ui/transport-card-expenses";
import { TransportCardHistory } from "./ui/transport-card-history";
import { ChevronLeft, TrashIcon } from "lucide-react";

export const TransportCardDetailPage = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    card,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    isSubmitting,
    drivers,
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  const totalExpenses = card?.totalExpenses || 0;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Транспортные карты</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/transport-cards" className="text-sm text-muted-foreground">
                Список транспортных карт
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">Транспортная карта №{card?.cardNumber}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <TransportCardMainInfo
                  isSubmitting={isSubmitting}
                  form={form}
                  card={card}
                  drivers={drivers}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Расходы</CardTitle>
              </CardHeader>
              <CardContent>
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
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>История изменений</CardTitle>
              </CardHeader>
              <CardContent>
                <TransportCardHistory card={card} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Button
            type="button"
            disabled={isDeleting || isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/transport-cards" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {card && (
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
