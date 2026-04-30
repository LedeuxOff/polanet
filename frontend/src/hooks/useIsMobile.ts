import { useState, useEffect } from "react";

const BREAKPOINT = 768;

/**
 * Хук для определения, является ли устройство мобильным
 * Возвращает true, если ширина экрана меньше 768px
 * Автоматически обновляется при изменении размера окна
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < BREAKPOINT : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
