import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  blur?: boolean;
  className?: string;
}

export const LoadingOverlay = ({
  isLoading,
  message = "Loading...",
  fullScreen = false,
  blur = true,
  className,
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 z-50 transition-all duration-300",
        fullScreen
          ? "fixed inset-0"
          : "absolute inset-0 rounded-lg",
        blur ? "backdrop-blur-sm" : "",
        "bg-background/80",
        className
      )}
    >
      {/* Outer glow ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        
        {/* Spinner container */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 animate-pulse" />
          
          {/* Center icon */}
          <Loader2 className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: "1.5s" }} />
        </div>
      </div>

      {/* Loading message */}
      {message && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-foreground animate-pulse">
            {message}
          </p>
          
          {/* Animated dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                style={{
                  animation: "bounce 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Simpler inline spinner for buttons or small areas
export const Spinner = ({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-current",
        sizeClasses[size],
        className
      )}
    />
  );
};

// Page-level loading state
export const PageLoader = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingOverlay isLoading={true} message={message} className="relative bg-transparent" />
  </div>
);

// Skeleton loading placeholder
export const LoadingSkeleton = ({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) => (
  <div className={cn("space-y-3 animate-pulse", className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
