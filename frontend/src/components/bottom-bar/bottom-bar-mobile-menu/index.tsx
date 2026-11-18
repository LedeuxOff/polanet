import { barButton } from "../styles";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomBarMobileMenu = ({ label }: { label?: string }) => {
  const { setOpen } = useTabbar();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      title="Меню"
      aria-label="Меню"
      className={cn(barButton.secondary, !label && barButton.icon)}
    >
      <MenuIcon />
      {label}
    </button>
  );
};
