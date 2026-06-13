import {
  cn,
  formatCO2,
  formatPercent,
  clamp,
  getCategoryColor,
  getRankConfig,
  sanitizeInput,
} from "@/utils";

describe("Utility Functions", () => {
  // ── cn (class name merger) ─────────────────────────────────
  describe("cn", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("base", false && "ignored", "included")).toBe("base included");
    });

    it("should handle undefined/null values", () => {
      expect(cn("a", undefined, null, "b")).toBe("a b");
    });

    it("should merge tailwind conflicting classes (last wins)", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("should handle empty inputs", () => {
      expect(cn()).toBe("");
    });
  });

  // ── formatCO2 ──────────────────────────────────────────────
  describe("formatCO2", () => {
    it("should format values below 1000 as kgCO₂e", () => {
      expect(formatCO2(500)).toBe("500 kgCO₂e");
    });

    it("should round values below 1000", () => {
      expect(formatCO2(499.7)).toBe("500 kgCO₂e");
    });

    it("should format values >= 1000 as tCO₂e", () => {
      expect(formatCO2(1000)).toBe("1.0 tCO₂e");
    });

    it("should format large values in tonnes", () => {
      expect(formatCO2(4800)).toBe("4.8 tCO₂e");
    });

    it("should format 1500 as 1.5 tCO₂e", () => {
      expect(formatCO2(1500)).toBe("1.5 tCO₂e");
    });

    it("should handle zero", () => {
      expect(formatCO2(0)).toBe("0 kgCO₂e");
    });

    it("should format 10000 correctly", () => {
      expect(formatCO2(10000)).toBe("10.0 tCO₂e");
    });
  });

  // ── formatPercent ──────────────────────────────────────────
  describe("formatPercent", () => {
    it("should format a positive percentage without sign by default", () => {
      expect(formatPercent(12.5)).toBe("12.5%");
    });

    it("should format with positive sign when showSign=true", () => {
      expect(formatPercent(12.5, true)).toBe("+12.5%");
    });

    it("should not add + sign to negative values", () => {
      expect(formatPercent(-5.3, true)).toBe("-5.3%");
    });

    it("should format zero correctly", () => {
      expect(formatPercent(0)).toBe("0.0%");
    });

    it("should round to 1 decimal place", () => {
      expect(formatPercent(33.333)).toBe("33.3%");
    });
  });

  // ── clamp ──────────────────────────────────────────────────
  describe("clamp", () => {
    it("should return value when within range", () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });

    it("should clamp to min when below", () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });

    it("should clamp to max when above", () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it("should handle equal min and max", () => {
      expect(clamp(50, 50, 50)).toBe(50);
    });

    it("should handle exact boundary values", () => {
      expect(clamp(0, 0, 100)).toBe(0);
      expect(clamp(100, 0, 100)).toBe(100);
    });
  });

  // ── getCategoryColor ───────────────────────────────────────
  describe("getCategoryColor", () => {
    it("should return blue for transport", () => {
      expect(getCategoryColor("transport")).toBe("#3b82f6");
    });

    it("should return amber for diet", () => {
      expect(getCategoryColor("diet")).toBe("#f59e0b");
    });

    it("should return red for energy", () => {
      expect(getCategoryColor("energy")).toBe("#ef4444");
    });

    it("should return purple for shopping", () => {
      expect(getCategoryColor("shopping")).toBe("#a855f7");
    });

    it("should return default green for unknown categories", () => {
      expect(getCategoryColor("unknown")).toBe("#22c55e");
    });
  });

  // ── getRankConfig ──────────────────────────────────────────
  describe("getRankConfig", () => {
    it("should return excellent config", () => {
      const config = getRankConfig("excellent");
      expect(config.label).toBe("Excellent");
      expect(config.emoji).toBe("🌟");
    });

    it("should return good config", () => {
      const config = getRankConfig("good");
      expect(config.label).toBe("Good");
      expect(config.emoji).toBe("✅");
    });

    it("should return average config", () => {
      const config = getRankConfig("average");
      expect(config.label).toBe("Average");
    });

    it("should return high config", () => {
      const config = getRankConfig("high");
      expect(config.label).toBe("High Impact");
      expect(config.emoji).toBe("⚠️");
    });

    it("should return very_high config", () => {
      const config = getRankConfig("very_high");
      expect(config.label).toBe("Very High");
      expect(config.emoji).toBe("🚨");
    });

    it("should fallback to average for unknown rank", () => {
      const config = getRankConfig("nonexistent");
      expect(config.label).toBe("Average");
    });

    it("should have color and bgColor for all ranks", () => {
      ["excellent", "good", "average", "high", "very_high"].forEach((rank) => {
        const config = getRankConfig(rank);
        expect(config.color).toBeTruthy();
        expect(config.bgColor).toBeTruthy();
      });
    });
  });

  // ── sanitizeInput ──────────────────────────────────────────
  describe("sanitizeInput", () => {
    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should remove < and > characters", () => {
      const result = sanitizeInput("<script>alert('xss')</script>");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toContain("alert('xss')");
    });

    it("should actually remove both < and > correctly", () => {
      const result = sanitizeInput("<b>bold</b>");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
    });

    it("should truncate input to 2000 characters", () => {
      const longInput = "a".repeat(3000);
      expect(sanitizeInput(longInput).length).toBe(2000);
    });

    it("should handle empty string", () => {
      expect(sanitizeInput("")).toBe("");
    });

    it("should preserve normal text", () => {
      expect(sanitizeInput("Hello, world! How are you?")).toBe(
        "Hello, world! How are you?"
      );
    });
  });
});
