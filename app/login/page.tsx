"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Zap, Globe, TrendingDown, ArrowRight, Shield } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/utils";

const FEATURES = [
  {
    icon: Globe,
    title: "Digital Carbon Twin",
    description: "A personal model of your lifestyle that calculates your exact environmental impact.",
    color: "text-emerald-400",
  },
  {
    icon: TrendingDown,
    title: "Future Impact Explorer",
    description: "Simulate lifestyle changes and see their impact before making a decision.",
    color: "text-teal-400",
  },
  {
    icon: Zap,
    title: "AI Action Prioritizer",
    description: "Gemini-powered recommendations ranked by impact, personalized to your life.",
    color: "text-blue-400",
  },
  {
    icon: Shield,
    title: "Sustainability Coach",
    description: "Your personal AI assistant for all things sustainability — ask anything.",
    color: "text-purple-400",
  },
];

const STATS = [
  { value: "4,800", unit: "kg", label: "Global average CO₂/year" },
  { value: "2,000", unit: "kg", label: "Paris Agreement target" },
  { value: "60%", unit: "", label: "Reduction achievable with changes" },
];

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (err) {
      console.error("Sign-in error:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-primary" aria-hidden="true" />
          <span className="font-bold text-lg">CarbonTwin AI</span>
        </div>
        <span className="text-sm text-muted-foreground">Powered by Gemini</span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary pulse-green" aria-hidden="true" />
            Now powered by Gemini AI
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            See Your{" "}
            <span className="text-gradient">Environmental Impact</span>
            {" "}Before Making a Decision
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            CarbonTwin AI creates your Digital Carbon Twin — a living model of 
            your lifestyle that simulates the future impact of every decision.
          </p>

          {/* CTA */}
          <motion.button
            onClick={handleSignIn}
            disabled={isSigningIn || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg",
              "gradient-brand text-white shadow-lg shadow-primary/25",
              "transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            aria-label="Sign in with Google to get started"
            id="sign-in-button"
          >
            {isSigningIn ? "Entering..." : "Enter CarbonTwin AI"}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </motion.button>

          <p className="text-sm text-muted-foreground mt-4">
            Free to use · No credit card required · Powered by Google Cloud
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
                <span className="text-primary text-xl ml-1">{stat.unit}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 max-w-4xl mx-auto w-full"
          role="list"
          aria-label="Key features"
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-6 text-left card-hover"
              role="listitem"
            >
              <feature.icon
                className={cn("w-8 h-8 mb-3", feature.color)}
                aria-hidden="true"
              />
              <h2 className="font-semibold text-lg mb-2">{feature.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/30">
        <p>
          © 2025 CarbonTwin AI · Built on Google Cloud ·{" "}
          <span className="text-primary">Gemini AI</span> +{" "}
          <span className="text-primary">Firebase</span>
        </p>
      </footer>
    </div>
  );
}
