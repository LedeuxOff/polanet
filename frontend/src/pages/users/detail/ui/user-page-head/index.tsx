import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks";
import { User } from "@/lib/types";
import { Link } from "@tanstack/react-router";

interface Props {
  user: User;
}

export const UserPageHead = ({ user }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Сотрудники</CardTitle>

          {!isMobile && (
            <div className="flex items-center gap-2">
              <Link to="/users" className="text-sm text-muted-foreground">
                <Badge
                  variant="outline"
                  className="dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                >
                  Список сотрудников
                </Badge>
              </Link>

              <span className="w-1 h-1 bg-blue-400 dark:bg-zinc-100 rounded-full" />

              <Badge
                variant="secondary"
                className="dark:bg-blue-600/40 dark:backdrop-blur-xl dark:border dark:border-white/20"
              >
                {user.firstName} {user.lastName}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
