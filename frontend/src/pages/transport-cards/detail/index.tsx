import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { useTransportCardDetailPage } from "./hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const TransportCardDetailPage = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    card,
    cardId,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    error,
    isSubmitting,
    drivers,
    expenseAmount,
    setExpenseAmount,
    expenseDate,
    setExpenseDate,
    handleAddExpense,
    isAddingExpense,
    handleRemoveExpense,
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
    <div className="space-y-6">
      {/* Основная форма */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Транспортная карта #{cardId}</CardTitle>
              {card && <p className="text-sm text-muted-foreground mt-1">{card.cardNumber}</p>}
            </div>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Удаление..." : "Удалить"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Номер карты</Label>
              <Input id="cardNumber" disabled={isSubmitting} {...form.register("cardNumber")} />
              {form.formState.errors.cardNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cardNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverId">Водитель</Label>
              <Select
                value={String(form.watch("driverId") || "")}
                onValueChange={(value) => form.setValue("driverId", value ? Number(value) : null)}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={String(driver.id)}>
                      {driver.lastName} {driver.firstName} {driver.middleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/transport-cards" })}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Блок расходов и истории */}
      {card && (
        <>
          {/* Финансы */}
          <Card>
            <CardHeader>
              <CardTitle>Расходы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Общая сумма расходов</p>
                <p className="text-2xl font-bold text-destructive">{totalExpenses} ₽</p>
              </div>

              <Separator />

              {/* Добавление расхода */}
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="expenseAmount">Сумма расхода</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="expenseDate">Дата оплаты</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddExpense} disabled={isAddingExpense || !expenseAmount}>
                  {isAddingExpense ? "Добавление..." : "Добавить расход"}
                </Button>
              </div>

              {/* История расходов */}
              {card.expenses && card.expenses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">История расходов</h4>
                  <div className="space-y-2">
                    {card.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{expense.amount} ₽</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.paymentDate).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExpense(expense.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* История изменений */}
          {card.history && card.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История изменений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {card.history.map((item) => {
                    const userName = [
                      item.userLastName,
                      item.userFirstName && item.userFirstName.charAt(0) + ".",
                      item.userMiddleName && item.userMiddleName.charAt(0) + ".",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <div key={item.id} className="p-3 border rounded-md bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                item.action === "created"
                                  ? "default"
                                  : item.action === "driver_assigned" ||
                                      item.action === "driver_unassigned"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {item.action === "created" && "Создана"}
                              {item.action === "updated" && "Изменена"}
                              {item.action === "deleted" && "Удалена"}
                              {item.action === "expense_added" && "Расход добавлен"}
                              {item.action === "expense_removed" && "Расход удален"}
                              {item.action === "driver_assigned" && "Водитель назначен"}
                              {item.action === "driver_unassigned" && "Водитель откреплен"}
                            </Badge>
                            {userName && <span className="text-sm font-medium">{userName}</span>}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        {item.fieldName && (
                          <p className="text-sm">
                            <span className="font-medium">{item.fieldName}:</span>{" "}
                            {item.oldValue && (
                              <span className="text-muted-foreground line-through">
                                {item.oldValue}
                              </span>
                            )}
                            {item.oldValue && item.newValue && " → "}
                            {item.newValue && <span className="font-medium">{item.newValue}</span>}
                          </p>
                        )}
                        {item.newValue && !item.fieldName && (
                          <p className="text-sm">{item.newValue}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
