import { authApi } from "../api";
import type { User } from "../types";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface TabbarContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const TabbarContext = createContext<TabbarContextType | undefined>(undefined);

export function TabbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  const value: TabbarContextType = {
    open,
    setOpen,
  };

  return <TabbarContext.Provider value={value}>{children}</TabbarContext.Provider>;
}

export function useTabbar() {
  const context = useContext(TabbarContext);
  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
}
