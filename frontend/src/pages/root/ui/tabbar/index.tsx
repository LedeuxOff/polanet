import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { menuItems } from "../../consts";
import { usePermissions } from "@/lib/contexts/permission-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link, useLocation } from "@tanstack/react-router";
import { KeyIcon, LogOut, MoonIcon, SunIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/api";
import { useRootLayout } from "../../hooks";
import { useTheme } from "@/lib/contexts/theme-context";
import { Separator } from "@/components/ui/separator";

export const TabBar = () => {
  const { open, setOpen } = useTabbar();
  const { hasPermission } = usePermissions();
  const currentPath = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { navigate, logout, user } = useRootLayout();

  const filteredMenuItems = menuItems
    .map((menuItem) => ({
      ...menuItem,
      links: menuItem.links.filter((link) => {
        if (!link.permission) {
          return true;
        }
        return hasPermission(link.permission);
      }),
    }))
    .filter((menuItem) => menuItem.links.length > 0);

  return (
    <Drawer open={open} onOpenChange={(value) => setOpen(value)}>
      <DrawerContent className="dark:bg-white/10 dark:backdrop-blur-xl border border-zinc-200 dark:border-white/20">
        <div className="px-2 flex-1 max-h-[90vh]">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-center">
                <div className="bg-blue-200 text-blue-600 flex p-4 rounded-full">
                  <UserIcon />
                </div>
              </div>
              <div className="w-full flex flex-col items-center">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <Accordion type="multiple" className="w-full" defaultValue={["1"]}>
            {filteredMenuItems.map((menuItem) => (
              <AccordionItem value={menuItem.id} className="border-0">
                <AccordionTrigger className="text-base flex gap-2 items-center text-[14px] font-medium border-0 [&>.lucide-chevron-down]:text-blue-600 dark:[&>.lucide-chevron-down]:text-slate-200">
                  <div className="flex gap-6 items-center">
                    <menuItem.icon className="!rotate-0 w-4 h-4 text-blue-600 dark:text-slate-50" />
                    <span className="text-zinc-600 dark:text-slate-50">{menuItem.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex">
                  <div className="flex flex-col gap-2 border-l border-stone-300/60 pl-4 ml-2 w-full">
                    {menuItem.links.map((link) => {
                      const isActive =
                        currentPath.pathname === link.url ||
                        currentPath.pathname.startsWith(`${link.url}/`);
                      return (
                        <Link
                          key={link.url}
                          to={link.url}
                          activeOptions={{ exact: false }}
                          onClick={() => setOpen(false)}
                        >
                          <div
                            className={`py-2 px-4 hover:pl-5 transition-all text-[14px] text-zinc-600 dark:text-slate-50 rounded-2xl relative hover:bg-blue-100/40 dark:hover:bg-slate-50/20 ${isActive && "bg-blue-100/40 dark:bg-slate-50/20 text-black"}`}
                          >
                            <span>{link.title}</span>

                            {isActive && (
                              <div className="absolute top-[14px] left-[-22px] w-3 h-3 rounded-full bg-blue-500 dark:bg-stone-400" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="flex flex-col gap-4 py-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex w-full gap-1 bg-zinc-100 dark:bg-white/10 border border-white/10 rounded-2xl p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => theme !== "light" && toggleTheme()}
                  className={`flex flex-1 gap-2 h-8 px-3 rounded-2xl transition-all ${
                    theme === "light"
                      ? "bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <SunIcon className="h-4 w-4" />
                  <span className="text-xs">Светлая</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => theme !== "dark" && toggleTheme()}
                  className={`flex flex-1 gap-2 h-8 px-3 rounded-2xl transition-all ${
                    theme === "dark"
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "text-slate-500 hover:text-slate-600 hover:bg-white/10"
                  }`}
                >
                  <MoonIcon className="h-4 w-4" />
                  <span className="text-xs">Темная</span>
                </Button>
              </div>
            </div>

            <Separator className="dark:bg-slate-50/20" />

            <Button
              type="button"
              asChild
              className="flex gap-4 rounded-2xl bg-blue-400 dark:bg-blue-500/40 hover:bg-blue-500 dark:hover:bg-blue-500/30 backdrop-blur-md border border-white/10"
            >
              <Link to="/change-password">
                <KeyIcon className="h-4 w-4 text-white" />
                <span className="text-white">Сменить пароль</span>
              </Link>
            </Button>

            <Button
              type="button"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="flex gap-4 rounded-2xl bg-red-400 dark:bg-red-500/40 hover:bg-red-500 dark:hover:bg-red-500/30 backdrop-blur-md border border-white/10"
            >
              <LogOut className="h-4 w-4 text-white" />
              <span className="text-white">Выйти</span>
            </Button>

            <div className="text-center text-xs mt-2 text-zinc-400 dark:text-slate-50/60">
              Версия: {APP_VERSION}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
