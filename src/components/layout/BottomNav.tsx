"use client";

import { History, ListChecks, LogOut, House } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "ホーム", icon: House },
  { href: "/history", label: "履歴", icon: History },
  { href: "/tasks", label: "家事リスト", icon: ListChecks },
] as const;

// 常に画面下部に表示するナビゲーション。ホーム・履歴・家事リスト・ログアウトの4項目。
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-3 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-6" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full flex-col items-center gap-0.5 px-2 py-3 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut className="size-6" aria-hidden />
            ログアウト
          </button>
        </li>
      </ul>
    </nav>
  );
}
