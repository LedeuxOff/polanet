import { useIsMobile } from "@/hooks";
import { Link, ToOptions } from "@tanstack/react-router";
import { Badge } from "../ui/badge";

interface Props {
  items: { label: string; href?: ToOptions["to"]; active?: boolean }[];
}

export const Breadcrumbs = ({ items }: Props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {items.map((item, index) => (
        <div className="flex items-center gap-2">
          {index !== 0 && <span className="w-1 h-1 bg-blue-400 dark:bg-zinc-100 rounded-full" />}

          {item.active ? (
            <Badge
              variant="secondary"
              className="dark:bg-blue-600/40 dark:backdrop-blur-xl dark:border dark:border-white/20"
            >
              {item.label}
            </Badge>
          ) : (
            <Link to={item.href} className="text-sm text-muted-foreground">
              <Badge
                variant="outline"
                className="dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              >
                {item.label}
              </Badge>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};
