import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { clientsApi, ordersApi } from "@/lib/api";
import { useState } from "react";

export function QuickCreateOrderButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
  });

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(data);
    } catch (error) {
      console.error("Ошибка загрузки клиентов:", error);
    }
  };

  React.useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newOrder = await ordersApi.quickCreate({
        clientId: Number(formData.clientId),
      });
      setOpen(false);
      setFormData({ clientId: "" });
      navigate({
        to: "/orders/$orderId",
        params: { orderId: String(newOrder.id) },
      });
    } catch (error) {
      alert("Ошибка при создании заявки: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700">
          Создать заявку
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать черновик заявки</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Клиент</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) => setFormData({ ...formData, clientId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.type === "legal"
                      ? client.organizationName
                      : `${client.lastName} ${client.firstName} ${client.middleName || ""}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading || !formData.clientId}>
              {isLoading ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
