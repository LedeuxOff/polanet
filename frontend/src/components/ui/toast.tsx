import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const toastVariants = cva(
  "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground",
        success: "bg-green-600 text-white shadow-xl",
        error: "bg-red-600 text-white border-red-700",
        warning: "bg-yellow-500 text-black border-yellow-600",
        info: "bg-blue-600 text-white border-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ToastProps extends VariantProps<typeof toastVariants> {
  id: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, message, variant, duration = 3000, onClose }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      requestAnimationFrame(() => setIsVisible(true));
    }, []);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant }),
          "rounded-2xl",
          isVisible
            ? "animate-[toast-slide-in_0.4s_ease-out]"
            : "animate-[toast-slide-out_0.3s_ease-out]",
        )}
      >
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className="ml-2 hover:opacity-80 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  },
);

Toast.displayName = "Toast";
