import Link from "next/link";
import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  href?: string;
}

export function AppLogo({ className, href = "/" }: AppLogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 select-none", className)}
      aria-label="SUN shift 홈"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 shadow-md shadow-orange-500/25">
        <Sun className="size-[18px] text-white" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="flex items-baseline gap-1">
        <span className="text-lg font-bold tracking-tight text-foreground">SUN</span>
        <span className="text-sm font-medium tracking-wide text-muted-foreground">shift</span>
      </span>
    </Link>
  );
}
