import Image from "next/image";
import Link from "next/link";
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
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={36}
        height={36}
        className="size-9"
        priority
      />
      <span className="flex items-baseline gap-1">
        <span className="text-lg font-bold tracking-tight text-foreground">SUN</span>
        <span className="text-sm font-medium tracking-wide text-muted-foreground">shift</span>
      </span>
    </Link>
  );
}
