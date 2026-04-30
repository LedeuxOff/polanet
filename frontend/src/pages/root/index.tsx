import { Outlet } from "@tanstack/react-router";
import { useRootLayout } from "./hooks";

import { usePermissions } from "@/lib/contexts/permission-context";
import { Sidebar } from "./ui/sidebar";
import { useIsMobile } from "@/hooks";
import { TabBar } from "./ui/tabbar";

export const RootLayout = () => {
  const { isLoading, isAuthenticated, isLoginPage, navigate } = useRootLayout();
  const { isLoading: isPermissionsLoading } = usePermissions();
  const isMobile = useIsMobile();

  if (isLoading || isPermissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated && isLoginPage) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Перенаправление...</div>
      </div>
    );
  }

  if (isAuthenticated && isLoginPage) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="bg-zinc-100 shadow-xl">
      {!isMobile && <Sidebar />}

      <main
        className={`flex-1 overflow-auto min-h-screen ${!isMobile ? "ml-[360px] pr-[40px]" : "pl-[20px] pr-[20px]"} pt-[40px]`}
      >
        <Outlet />
      </main>

      {isMobile && <TabBar />}
    </div>
  );
};
