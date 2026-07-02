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
    <div className="fixed top-[16px] bottom-[16px] left-[16px] bg-zinc-50 w-[280px] max-w-[280px] rounded-2xl shadow-xl border flex flex-col gap-2">
      {/* <div className="p-4">
        <div className="bg-gradient-to-t from-purple-600 to-blue-600 rounded-md p-2">
          <span className="text-white text-[24px] font-bold">Pola.Net</span>
        </div>
      </div> */}

      {/* <Separator /> */}

      <div className="px-4 flex-1 overflow-y-auto">
        <Accordion type="multiple" className="w-full" defaultValue={["1"]}>
          {filteredMenuItems.map((menuItem) => (
            <AccordionItem value={menuItem.id} className="border-0">
              <AccordionTrigger className="text-base flex gap-2 items-center text-[14px] font-medium border-0 [&>.lucide-chevron-down]:text-blue-600">
                <div className="flex gap-2 items-center">
                  <menuItem.icon className="!rotate-0 w-4 h-4 text-blue-600" />
                  <span>{menuItem.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex">
                <div className="flex flex-col gap-2 border-l pl-2 ml-2 w-full">
                  {menuItem.links.map((link) => {
                    const isActive =
                      currentPath.pathname === link.url ||
                      currentPath.pathname.startsWith(`${link.url}/`);
                    return (
                      <Link
                        key={link.url}
                        to={link.url}
                        activeProps={{
                          className: `bg-blue-50 text-black`,
                        }}
                        activeOptions={{ exact: false }}
                      >
                        <div
                          className={`hover:bg-blue-50 p-2 text-[14px] text-zinc-600 hover:text-black rounded-md relative ${isActive && "bg-blue-50 text-black"}`}
                        >
                          <span>{link.title}</span>

                          {isActive && (
                            <div className="absolute top-[14px] left-[-12px] w-2 h-2 rounded-full bg-blue-500" />
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
          <PopoverTrigger className="hover:bg-zinc-100 w-full p-2 border border-zinc-200 rounded-2xl">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="flex justify-center">
                  <div className="bg-blue-200 text-blue-600 flex p-4 rounded-full">
                    <UserIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.roleName}</p>
                </div>
              </div>
              <ChevronsUpDownIcon className="w-4 text-zinc-400 group-hover:text-zinc-600" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="max-w-[246px] rounded-2xl">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.roleName}</p>
              </div>

              <Separator />

              <Button
                type="button"
                asChild
                className="flex gap-4 bg-blue-400 hover:bg-blue-500 rounded-2xl"
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
                className="flex gap-4 bg-red-400 hover:bg-red-500 rounded-2xl"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="text-center text-xs text-muted-foreground mt-2 bg-blue-400 text-white rounded-2xl py-1">
          Версия: {APP_VERSION}
        </div>
      </div>
    </div>
  );
};
