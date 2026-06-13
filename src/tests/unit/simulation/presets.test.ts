import { SCENARIO_PRESETS, SCENARIO_TEMPLATES } from "@/lib/simulation/presets";
import type { ScenarioChangeType } from "@/types";

const VALID_CHANGE_TYPES: ScenarioChangeType[] = [
  "transport_mode_change",
  "reduce_flights",
  "work_from_home",
  "diet_change",
  "reduce_electricity",
  "install_renewable",
  "reduce_shopping",
  "increase_recycling",
];

describe("Simulation Presets", () => {
  describe("SCENARIO_PRESETS", () => {
    it("should contain at least 10 presets", () => {
      expect(SCENARIO_PRESETS.length).toBeGreaterThanOrEqual(10);
    });

    it("should have valid types for all presets", () => {
      SCENARIO_PRESETS.forEach((preset) => {
        expect(VALID_CHANGE_TYPES).toContain(preset.type);
      });
    });

    it("should have non-empty labels for all presets", () => {
      SCENARIO_PRESETS.forEach((preset) => {
        expect(preset.label).toBeTruthy();
        expect(preset.label.length).toBeGreaterThan(0);
      });
    });

    it("should have non-empty descriptions for all presets", () => {
      SCENARIO_PRESETS.forEach((preset) => {
        expect(preset.description).toBeTruthy();
        expect(preset.description.length).toBeGreaterThan(0);
      });
    });

    it("should have icons for all presets", () => {
      SCENARIO_PRESETS.forEach((preset) => {
        expect(preset.icon).toBeTruthy();
      });
    });

    it("should have parameters objects for all presets", () => {
      SCENARIO_PRESETS.forEach((preset) => {
        expect(preset.parameters).toBeDefined();
        expect(typeof preset.parameters).toBe("object");
      });
    });

    it("should include all major transport modes", () => {
      const transportPresets = SCENARIO_PRESETS.filter(
        (p) => p.type === "transport_mode_change"
      );
      expect(transportPresets.length).toBeGreaterThanOrEqual(3);

      const modes = transportPresets.map((p) => p.parameters.newMode);
      expect(modes).toContain("metro");
      expect(modes).toContain("car_electric");
    });

    it("should have reductionPercent as number for reduce_flights presets", () => {
      const flightPresets = SCENARIO_PRESETS.filter(
        (p) => p.type === "reduce_flights"
      );
      expect(flightPresets.length).toBeGreaterThan(0);
      flightPresets.forEach((preset) => {
        const pct = Number(preset.parameters.reductionPercent);
        expect(pct).toBeGreaterThan(0);
        expect(pct).toBeLessThanOrEqual(100);
      });
    });

    it("should have daysPerWeek between 1 and 5 for work_from_home presets", () => {
      const wfhPresets = SCENARIO_PRESETS.filter(
        (p) => p.type === "work_from_home"
      );
      expect(wfhPresets.length).toBeGreaterThan(0);
      wfhPresets.forEach((preset) => {
        const days = Number(preset.parameters.daysPerWeek);
        expect(days).toBeGreaterThanOrEqual(1);
        expect(days).toBeLessThanOrEqual(5);
      });
    });

    it("should have newPercentage between 1 and 100 for increase_recycling presets", () => {
      const recyclingPresets = SCENARIO_PRESETS.filter(
        (p) => p.type === "increase_recycling"
      );
      expect(recyclingPresets.length).toBeGreaterThan(0);
      recyclingPresets.forEach((preset) => {
        const pct = Number(preset.parameters.newPercentage);
        expect(pct).toBeGreaterThan(0);
        expect(pct).toBeLessThanOrEqual(100);
      });
    });

    it("should have empty parameters for install_renewable", () => {
      const renewablePreset = SCENARIO_PRESETS.find(
        (p) => p.type === "install_renewable"
      );
      expect(renewablePreset).toBeDefined();
      expect(Object.keys(renewablePreset!.parameters)).toHaveLength(0);
    });

    it("should have unique labels", () => {
      const labels = SCENARIO_PRESETS.map((p) => p.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });
  });

  describe("SCENARIO_TEMPLATES", () => {
    it("should contain at least 4 templates", () => {
      expect(SCENARIO_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    });

    it("should have non-empty names for all templates", () => {
      SCENARIO_TEMPLATES.forEach((template) => {
        expect(template.name).toBeTruthy();
        expect(template.name.length).toBeGreaterThan(0);
      });
    });

    it("should have non-empty descriptions for all templates", () => {
      SCENARIO_TEMPLATES.forEach((template) => {
        expect(template.description).toBeTruthy();
      });
    });

    it("should reference valid (non-undefined) presets", () => {
      SCENARIO_TEMPLATES.forEach((template) => {
        template.changes.forEach((change) => {
          expect(change).toBeDefined();
          expect(change).not.toBeUndefined();
          expect(VALID_CHANGE_TYPES).toContain(change.type);
        });
      });
    });

    it("should have at least 2 changes per template", () => {
      SCENARIO_TEMPLATES.forEach((template) => {
        expect(template.changes.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should have unique template names", () => {
      const names = SCENARIO_TEMPLATES.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should have a 'Minimal Carbon Lifestyle' template with 4 changes", () => {
      const minimal = SCENARIO_TEMPLATES.find(
        (t) => t.name === "Minimal Carbon Lifestyle"
      );
      expect(minimal).toBeDefined();
      expect(minimal!.changes.length).toBe(4);
    });
  });
});
