import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/contexts/auth-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { MenuIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Добро пожаловать</CardTitle>
          <CardDescription>Административная панель Polanet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Рады видеть вас снова, {user?.firstName || "Гость"}!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
          <CardDescription>Управление пользователями системы</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/users">
            <Button>Перейти к пользователям</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Роли</CardTitle>
          <CardDescription>Управление ролями и доступом</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">В разработке...</p>
        </CardContent>
      </Card>

      {isMobile && (
        <div
          className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
        >
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900 flex gap-2"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" /> Меню
          </Button>
        </div>
      )}
    </div>
  );
}
