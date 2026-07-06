import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronsUpDownIcon, KeyIcon, LogOut, MoonIcon, SunIcon, UserIcon } from "lucide-react";
import { APP_VERSION } from "@/lib/api";
import { menuItems } from "../../consts";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useRootLayout } from "../../hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/lib/contexts/theme-context";

export const Sidebar = () => {
  // Filter menu items based on permissions
  const { hasPermission } = usePermissions();
  const { navigate, logout, user } = useRootLayout();
  const currentPath = useLocation();
  const { theme, toggleTheme } = useTheme();

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
    <div className="fixed top-[16px] dark:bg-white/10 dark:backdrop-blur-xl border border-zinc-200 dark:border-white/20 bottom-[16px] left-[16px] bg-zinc-50 w-[280px] max-w-[280px] rounded-2xl shadow-xl flex flex-col gap-2">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center rounded-2xl bg-zinc-100 shadow-xl dark:shadow-none dark:bg-white/5 dark:backdrop-blur-md border border-zinc-200 dark:border-white/10">
          <img src="/layout/logo.png" alt="logo" className="w-16" />
          <div className="flex flex-col">
            <span className="text-[20px] text-zinc-500 dark:text-slate-100 font-semibold">
              POLA NET
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-300 font-semibold">
              SAND SALES
            </span>
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
                      <Link key={link.url} to={link.url} activeOptions={{ exact: false }}>
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
      </div>

      <div className="px-6 pb-6">
        <Popover>
          <PopoverTrigger className="w-full p-4 rounded-2xl shadow-xl dark:shadow-none bg-zinc-100 dark:bg-white/5 dark:backdrop-blur-md border dark:border-white/10 transition-all hover:bg-zinc-200/40 dark:hover:bg-white/10 dark:hover:border-white/20 dark:hover:shadow-lg">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="flex justify-center">
                  <div className="bg-blue-100 dark:bg-white/5 dark:backdrop-blur-md border border-blue-200 dark:border-zinc-200 dark:border-white/10 text-blue-500 dark:text-slate-100 flex p-4 rounded-full">
                    <UserIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium truncate text-zinc-600 dark:text-slate-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-slate-200 truncate">
                    {user?.roleName}
                  </p>
                </div>
              </div>
              <ChevronsUpDownIcon className="w-4 text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-slate-200" />
            </div>

            <Separator className="my-4 dark:bg-slate-50/20" />

            <div className="text-center text-xs mt-2 text-zinc-400 dark:text-slate-50/60">
              Версия: {APP_VERSION}
            </div>
          </PopoverTrigger>
          <PopoverContent className="max-w-[246px] shadow-xl rounded-2xl dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium truncate dark:text-slate-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-200 truncate">
                  {user?.roleName}
                </p>
              </div>

              <Separator className="dark:bg-slate-50/20" />

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
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
