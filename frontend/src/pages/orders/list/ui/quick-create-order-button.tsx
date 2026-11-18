import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

export function QuickCreateOrderButton() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    volume: "",
  });

  const loadClients = async () => {
    try {
      const response = await clientsApi.list({ limit: 1000 });
      setClients(response.data || []);
    } catch (error) {
      console.error("Ошибка загрузки клиентов:", error);
    }
  };

  useEffect(() => {
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
        volume: formData.volume ? parseFloat(formData.volume) : undefined,
      });
      setOpen(false);
      setFormData({ clientId: "", volume: "" });
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

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(value) => setOpen(value)}>
        <DrawerTrigger>
          <Button
            type="button"
            className="w-full px-8 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-white"
          >
            Создать черновик
          </Button>
        </DrawerTrigger>
        <DrawerContent className="rounded-t-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <div className="px-2 flex-1 max-h-[90vh] pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Клиент</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
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
              <div className="space-y-2">
                <Label htmlFor="volume">Объем груза (м³)</Label>
                <Input
                  className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                  id="volume"
                  type="number"
                  step="0.1"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  className="bg-blue-500/90 dark:bg-blue-600/40 dark:text-zinc-100 dark:border dark:border-white/10 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600/30"
                  type="submit"
                  disabled={isLoading || !formData.clientId}
                >
                  {isLoading ? "Создание..." : "Создать"}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="px-8 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-white"
        >
          Создать черновик
        </Button>
      </DialogTrigger>
      <DialogContent className="!rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 sm:max-w-[425px]">
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
              <SelectTrigger className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
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
          <div className="space-y-2">
            <Label htmlFor="volume">Объем груза (м³)</Label>
            <Input
              id="volume"
              type="number"
              step="0.1"
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              value={formData.volume}
              onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="bg-blue-500/90 dark:bg-blue-600/40 dark:text-zinc-100 dark:border dark:border-white/10 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600/30"
              type="submit"
              disabled={isLoading || !formData.clientId}
            >
              {isLoading ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
