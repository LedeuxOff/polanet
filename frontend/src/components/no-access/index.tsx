import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "../ui/card";
import { BanIcon } from "lucide-react";

export const NoAccessScreen = () => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardContent className="py-8 flex flex-col gap-4 items-center">
        <BanIcon />
        <p className="text-muted-foreground dark:text-zinc-100">
          У вас нет доступа к этой странице
        </p>
        <Link to="/">
          <button className="px-8 py-2 text-zinc-100 transition-all bg-blue-500/90 dark:bg-blue-600/40 dark:text-zinc-100 dark:border dark:border-white/10 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600/30 flex-1">
            На главную
          </button>
        </Link>
      </CardContent>
    </Card>
  );
};
