import { useAuth } from "@/lib/contexts/auth-context";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const useRootLayout = () => {
  const { isAuthenticated, logout, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      navigate({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      });
    }

    if (isAuthenticated && isLoginPage) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isLoginPage, navigate, location.href, isLoading]);

  return {
    isLoading,
    isAuthenticated,
    isLoginPage,
    navigate,
    logout,
    user,
  };
};
