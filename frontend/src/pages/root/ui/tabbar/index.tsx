import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { menuItems } from "../../consts";
import { usePermissions } from "@/lib/contexts/permission-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@tanstack/react-router";
import { LogOut, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/api";
import { useRootLayout } from "../../hooks";

export const TabBar = () => {
  const { open, setOpen } = useTabbar();
  const { hasPermission } = usePermissions();
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
      <DrawerContent className="">
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
                        location.pathname === link.url ||
                        location.pathname.startsWith(`${link.url}/`);
                      return (
                        <Link key={link.url} to={link.url} onClick={() => setOpen(false)}>
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

          <div className="py-4 flex flex-col items-center gap-4 w-full">
            <Button
              type="button"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="flex gap-4 bg-red-500 hover:bg-red-600 w-full"
            >
              <LogOut className="h-4 w-4" />
              <span>Выйти</span>
            </Button>

            <div className="text-center text-xs text-muted-foreground">v{APP_VERSION}</div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
