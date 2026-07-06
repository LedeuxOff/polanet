import { Card, CardContent } from "@/components/ui/card";

export const PageError = () => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardContent className="py-8 text-center text-muted-foreground dark:text-zinc-100">
        Ошибка при загрузке
      </CardContent>
    </Card>
  );
};
