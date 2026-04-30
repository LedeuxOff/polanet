import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "./lib/contexts/auth-context";
import { PermissionProvider } from "./lib/contexts/permission-context";
import { ToastProvider } from "./lib/contexts/toast-context";
import "./styles/globals.css";
import { TabbarProvider } from "./lib/contexts/tabbar-context";

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <PermissionProvider>
      <ToastProvider>
        <TabbarProvider>
          <RouterProvider router={router} />
        </TabbarProvider>
      </ToastProvider>
    </PermissionProvider>
  </AuthProvider>,
);
