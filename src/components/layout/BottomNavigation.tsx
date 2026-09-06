"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Moon, Settings, TreePalm } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/calendar", label: "달력", icon: Calendar },
  { href: "/sleep", label: "꿀잠", icon: Moon },
  { href: "/leave", label: "연차", icon: TreePalm },
  { href: "/settings", label: "설정", icon: Settings },
] as const;

const HIDDEN_PREFIXES = ["/onboarding", "/auth", "/offline"];

function shouldHideNav(pathname: string): boolean {
  return HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function BottomNavigation() {
  const pathname = usePathname();

  if (shouldHideNav(pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="주요 메뉴"
    >
      <div className="mx-auto max-w-lg rounded-2xl border border-border/60 bg-card/90 p-1 shadow-lg shadow-primary/[0.06] backdrop-blur-xl">
        <ul className="flex items-stretch justify-around">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="min-w-0 flex-1">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium leading-none transition-all",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-5 shrink-0", isActive && "stroke-[2.25]")} aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
