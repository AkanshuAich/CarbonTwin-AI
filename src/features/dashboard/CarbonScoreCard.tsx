"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils";

interface CarbonScoreCardProps {
  score: number;
  rank: string;
  rankConfig: {
    label: string;
    color: string;
    bgColor: string;
    emoji: string;
  };
}

export function CarbonScoreCard({ score, rank, rankConfig }: CarbonScoreCardProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass rounded-2xl p-6 card-hover" aria-label={`Carbon score: ${score} out of 100, rated ${rankConfig.label}`}>
      <p className="text-muted-foreground text-sm mb-4">Carbon Score</p>
      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative" aria-hidden="true">
          <svg width="100" height="100" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            {/* Score arc */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={rankConfig.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          {/* Score number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-bold"
              style={{ color: rankConfig.color }}
            >
              {score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Rank info */}
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-2"
            style={{
              backgroundColor: rankConfig.bgColor,
              color: rankConfig.color,
            }}
          >
            <span>{rankConfig.emoji}</span>
            {rankConfig.label}
          </div>
          <p className="text-xs text-muted-foreground">
            {score >= 70
              ? "Great job! Keep it up."
              : score >= 50
              ? "Room for improvement."
              : "Let's make some changes!"}
          </p>
        </div>
      </div>
    </div>
  );
}
