import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronsUpDownIcon, KeyIcon, LogOut, UserIcon } from "lucide-react";
import { APP_VERSION } from "@/lib/api";
import { menuItems } from "../../consts";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useRootLayout } from "../../hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Sidebar = () => {
  // Filter menu items based on permissions
  const { hasPermission } = usePermissions();
  const { navigate, logout, user } = useRootLayout();
  const currentPath = useLocation();

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
    <div className="fixed top-[16px] bg-white/10 backdrop-blur-xl border border-white/20 bottom-[16px] left-[16px] bg-zinc-50 w-[280px] max-w-[280px] rounded-2xl shadow-xl flex flex-col gap-2">
      <div className="px-4 flex-1 overflow-y-auto">
        <Accordion type="multiple" className="w-full" defaultValue={["1"]}>
          {filteredMenuItems.map((menuItem) => (
            <AccordionItem value={menuItem.id} className="border-0">
              <AccordionTrigger className="text-base flex gap-2 items-center text-[14px] font-medium border-0 [&>.lucide-chevron-down]:text-slate-200">
                <div className="flex gap-2 items-center">
                  <menuItem.icon className="!rotate-0 w-4 h-4 text-slate-50" />
                  <span className="text-slate-50">{menuItem.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex">
                <div className="flex flex-col gap-2 border-l border-slate-300/40 pl-4 ml-2 w-full">
                  {menuItem.links.map((link) => {
                    const isActive =
                      currentPath.pathname === link.url ||
                      currentPath.pathname.startsWith(`${link.url}/`);
                    return (
                      <Link key={link.url} to={link.url} activeOptions={{ exact: false }}>
                        <div
                          className={`py-2 px-4 hover:pl-5 transition-all text-[14px] text-slate-50 rounded-2xl relative hover:bg-slate-50/20 ${isActive && "bg-slate-50/20 text-black"}`}
                        >
                          <span>{link.title}</span>

                          {isActive && (
                            <div className="absolute top-[14px] left-[-22px] w-3 h-3 rounded-full bg-slate-50" />
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

      <div className="px-4 pb-4">
        <Popover>
          <PopoverTrigger className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="flex justify-center">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 flex p-4 rounded-full">
                    <UserIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium truncate text-slate-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-200 truncate">{user?.roleName}</p>
                </div>
              </div>
              <ChevronsUpDownIcon className="w-4 text-zinc-400 group-hover:text-slate-200" />
            </div>

            <Separator className="my-4 bg-slate-50/20" />

            <div className="text-center text-xs mt-2 text-slate-50/60">Версия: {APP_VERSION}</div>
          </PopoverTrigger>
          <PopoverContent className="max-w-[246px] shadow-xl rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium truncate text-slate-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-200 truncate">{user?.roleName}</p>
              </div>

              <Separator className="bg-slate-50/20" />

              <Button
                type="button"
                asChild
                className="flex gap-4 rounded-2xl bg-blue-500/40 hover:bg-blue-500/30 backdrop-blur-md border border-white/10"
              >
                <Link to="/change-password">
                  <KeyIcon className="h-4 w-4" />
                  <span>Сменить пароль</span>
                </Link>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                className="flex gap-4 rounded-2xl bg-red-500/40 hover:bg-red-500/30 backdrop-blur-md border border-white/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
