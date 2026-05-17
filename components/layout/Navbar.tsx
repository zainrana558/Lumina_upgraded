"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, User, LogOut, LogIn, ChevronDown, Menu, X, Settings, Clock, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  isGuest?: boolean;
}

/**
 * Enhanced navigation links with keyboard shortcuts
 */
const navLinks = [
  { href: "/browse", label: "Home", shortcut: "1" },
  { href: "/movies", label: "Movies", shortcut: "2" },
  { href: "/tv", label: "TV Shows", shortcut: "3" },
  { href: "/search", label: "Search", shortcut: "/" },
  { href: "/my-list", label: "My List", shortcut: "4" },
];

export default function Navbar({ isGuest = false }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if in input
      if (document.activeElement?.tagName === "INPUT") return;
      
      switch (e.key) {
        case "1":
          router.push("/browse");
          break;
        case "2":
          router.push("/movies");
          break;
        case "3":
          router.push("/tv");
          break;
        case "4":
          if (!isGuest) router.push("/my-list");
          break;
        case "/":
          e.preventDefault();
          setSearchOpen(true);
          break;
        case "Escape":
          setSearchOpen(false);
          setMenuOpen(false);
          setMobileMenuOpen(false);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, isGuest]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg" 
          : "bg-gradient-to-b from-background/95 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link
            href="/browse"
            className="text-2xl font-bold transition-transform hover:scale-105"
            aria-label="Lumina Home"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-x">
              Lumina
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  pathname === link.href
                    ? "text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                <span className="absolute -top-0.5 right-1 text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {link.shortcut}
                </span>
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center animate-scale-in">
                <Input
                  type="text"
                  placeholder="Search titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 md:w-64 bg-muted/50 border-border focus:border-primary"
                  autoFocus
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-2 text-muted-foreground hover:text-white"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
                <span className="hidden md:inline text-xs opacity-50 border border-muted-foreground/30 px-1.5 rounded">
                  /
                </span>
              </button>
            )}
          </div>

          {/* Notifications (placeholder) */}
          {!isGuest && (
            <button
              className="relative text-muted-foreground hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-muted-foreground hover:text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* User Menu */}
          {isGuest ? (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/20"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Sign In</span>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
                aria-label="User menu"
                aria-expanded={menuOpen}
              >
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className={`h-3 w-3 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-56 glass rounded-xl border border-border shadow-2xl animate-scale-in overflow-hidden"
                  role="menu"
                >
                  <div className="p-2">
                    <Link
                      href="/profiles"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Switch Profile
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Watch History
                    </Link>
                    <Link
                      href="/my-list"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      <Flame className="h-4 w-4 text-muted-foreground" />
                      My List
                    </Link>
                    <hr className="my-2 border-border" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                <span className="text-xs opacity-50">{link.shortcut}</span>
              </Link>
            ))}
            {!isGuest && (
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Clock className="h-4 w-4" />
                  Watch History
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
