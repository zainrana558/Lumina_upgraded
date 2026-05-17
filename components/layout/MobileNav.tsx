"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Heart, Search, LogIn, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Enhanced mobile navigation with better touch targets
 */
const allLinks = [
  { href: "/browse", icon: Home, label: "Home", guestVisible: true, shortcut: "H" },
  { href: "/movies", icon: Film, label: "Movies", guestVisible: true, shortcut: "M" },
  { href: "/tv", icon: Tv, label: "TV", guestVisible: true, shortcut: "T" },
  { href: "/search", icon: Search, label: "Search", guestVisible: true, shortcut: "S" },
  { href: "/my-list", icon: Heart, label: "My List", guestVisible: false, shortcut: "L" },
  { href: "/history", icon: Clock, label: "History", guestVisible: false, shortcut: "R" },
];

interface MobileNavProps {
  isGuest?: boolean;
}

export default function MobileNav({ isGuest = false }: MobileNavProps) {
  const pathname = usePathname();

  const links = isGuest
    ? allLinks.filter((l) => l.guestVisible)
    : allLinks;

  return (
    <nav 
      className="fixed bottom-0 left-0 z-50 w-full border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Safe area padding for modern mobile devices */}
      <div className="flex items-center justify-around pb-safe pt-2 px-2">
        {links.map(({ href, icon: Icon, label, shortcut }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-2 px-3 min-w-[64px] rounded-xl transition-all duration-200",
              "active:scale-95 active:bg-white/5",
              pathname === href 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={pathname === href ? "page" : undefined}
          >
            <div className={cn(
              "relative p-1.5 rounded-lg transition-colors",
              pathname === href 
                ? "bg-primary/10" 
                : "bg-transparent"
            )}>
              <Icon className="h-5 w-5" />
              {/* Active indicator */}
              {pathname === href && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-primary rounded-full" />
              )}
            </div>
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
