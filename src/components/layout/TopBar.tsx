"use client";

import { useAuth } from "@/features/auth/useAuth";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Bell } from "lucide-react";
import { cn } from "@/utils";

export function TopBar() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      role="banner"
    >
      {/* Spacer for mobile hamburger */}
      <div className="w-10 lg:hidden" aria-hidden="true" />

      {/* Right controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button
          className="p-2 rounded-xl hover:bg-muted transition-colors relative"
          aria-label="Notifications (0 unread)"
        >
          <Bell className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-3 border-l border-border/50">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={`${user.displayName ?? "User"}'s profile picture`}
              className="w-8 h-8 rounded-full ring-2 ring-primary/30"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium leading-none">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors ml-1"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
