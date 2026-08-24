import { Button } from "@/components/ui/button";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { MenuIcon } from "lucide-react";

export const BottomBarMobileMenu = () => {
  const { setOpen } = useTabbar();
  return (
    <Button
      type="button"
      className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
      onClick={() => setOpen(true)}
    >
      <MenuIcon className="w-4 h-4 dark:text-zinc-100" />
    </Button>
  );
};
