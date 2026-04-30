import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const toastVariants = cva(
  "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground",
        success: "bg-green-600 text-white border-green-700",
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
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
      <div ref={ref} className={cn(toastVariants({ variant }))}>
        <span>{message}</span>
        <button onClick={() => onClose(id)} className="ml-2 hover:opacity-80 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  },
);

Toast.displayName = "Toast";
