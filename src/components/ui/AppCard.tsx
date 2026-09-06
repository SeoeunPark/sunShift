import { cn } from "@/lib/utils";

interface AppCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "inset" | "sleep";
  as?: "div" | "section";
}

export function AppCard({
  children,
  className,
  variant = "default",
  as: Component = "div",
}: AppCardProps) {
  return (
    <Component
      className={cn(
        variant === "default" && "app-card",
        variant === "hero" && "app-hero",
        variant === "inset" && "app-card-inset",
        variant === "sleep" && "app-sleep-panel",
        className,
      )}
    >
      {children}
    </Component>
  );
}
