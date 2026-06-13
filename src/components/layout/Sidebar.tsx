"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  LayoutDashboard,
  Sparkles,
  MessageSquare,
  MapPin,
  FileText,
  TrendingDown,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/utils";
import { useState } from "react";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Your carbon overview",
  },
  {
    href: "/future-impact",
    label: "Future Impact",
    icon: TrendingDown,
    description: "Simulate lifestyle changes",
    badge: "Hero",
  },
  {
    href: "/prioritizer",
    label: "AI Prioritizer",
    icon: Sparkles,
    description: "Ranked recommendations",
  },
  {
    href: "/ai-coach",
    label: "AI Coach",
    icon: MessageSquare,
    description: "Sustainability assistant",
  },
  {
    href: "/green-routes",
    label: "Green Routes",
    icon: MapPin,
    description: "Eco-friendly navigation",
  },
  {
    href: "/report",
    label: "Weekly Report",
    icon: FileText,
    description: "Your sustainability recap",
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="CarbonTwin AI - Go to dashboard"
        >
          <Leaf className="w-7 h-7 text-primary" aria-hidden="true" />
          <span className="font-bold text-lg">CarbonTwin AI</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full gradient-brand text-white font-medium leading-none">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                  {item.description}
                </p>
              </div>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-border/50">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <span className="text-primary font-medium">Gemini AI</span> &{" "}
            <span className="text-primary font-medium">Google Cloud</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card border border-border shadow-lg"
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-border/50 bg-card/80 backdrop-blur-xl flex-col z-40"
        aria-label="Application sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-card border-r border-border flex flex-col z-50"
              aria-label="Mobile navigation"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
