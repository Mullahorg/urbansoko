import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-xl group-[.toaster]:shadow-primary/5 group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:bg-muted/50 group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted group-[.toast]:hover:text-foreground group-[.toast]:border-0 group-[.toast]:rounded-full",
          success:
            "group-[.toaster]:bg-green-500/95 group-[.toaster]:text-white group-[.toaster]:border-green-500/50 group-[.toaster]:shadow-green-500/20",
          error:
            "group-[.toaster]:bg-destructive/95 group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive/50 group-[.toaster]:shadow-destructive/20",
          warning:
            "group-[.toaster]:bg-yellow-500/95 group-[.toaster]:text-white group-[.toaster]:border-yellow-500/50 group-[.toaster]:shadow-yellow-500/20",
          info:
            "group-[.toaster]:bg-blue-500/95 group-[.toaster]:text-white group-[.toaster]:border-blue-500/50 group-[.toaster]:shadow-blue-500/20",
          loading:
            "group-[.toaster]:bg-muted/95 group-[.toaster]:text-foreground group-[.toaster]:border-border/50",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5" />,
        error: <AlertCircle className="h-5 w-5" />,
        warning: <AlertTriangle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
        loading: <Loader2 className="h-5 w-5 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
