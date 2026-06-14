"use client";

import type { CarbonTwinProfile } from "@/types";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

interface EnergyStepProps {
  data: CarbonTwinProfile["energy"];
  onChange: (data: CarbonTwinProfile["energy"]) => void;
}

const ENERGY_SOURCES = [
  { value: "grid", label: "Grid (Mixed)", emoji: "🔌", desc: "Standard electricity" },
  { value: "mixed", label: "Part Renewable", emoji: "🌤️", desc: "Some green energy" },
  { value: "renewable", label: "100% Renewable", emoji: "☀️", desc: "Solar, wind, etc." },
] as const;

export function EnergyStep({ data, onChange }: EnergyStepProps) {
  const update = <K extends keyof typeof data>(key: K, value: typeof data[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">⚡ Home Energy</h2>
        <p className="text-muted-foreground">Your home energy use and source</p>
      </div>

      {/* Energy source */}
      <fieldset>
        <legend className="block text-sm font-medium mb-3">Electricity source</legend>
        <div className="grid grid-cols-3 gap-3">
          {ENERGY_SOURCES.map((source) => (
            <label
              key={source.value}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border cursor-pointer transition-all text-center ${
                data.energySource === source.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="energySource"
                value={source.value}
                checked={data.energySource === source.value}
                onChange={() => update("energySource", source.value)}
                className="sr-only"
              />
              <span className="text-2xl" aria-hidden="true">{source.emoji}</span>
              <span className="font-medium text-sm">{source.label}</span>
              <span className="text-xs text-muted-foreground">{source.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Monthly kWh */}
      <div>
        <label htmlFor="monthly-kwh" className="block text-sm font-medium mb-2">
          Monthly electricity usage:{" "}
          <span className="text-primary font-bold">{data.monthlyKwh} kWh</span>
        </label>
        <input
          id="monthly-kwh"
          type="range"
          min={50}
          max={1000}
          step={25}
          value={data.monthlyKwh}
          onChange={(e) => update("monthlyKwh", Number(e.target.value))}
          className="w-full accent-primary"
          aria-describedby="kwh-hint"
        />
        <p id="kwh-hint" className="text-xs text-muted-foreground mt-1">
          Average UK home uses ~250 kWh/month · Check your electricity bill
        </p>
      </div>

      {/* Household size */}
      <div>
        <label htmlFor="household-size" className="block text-sm font-medium mb-2">
          Household size:{" "}
          <span className="text-primary font-bold">{data.householdSize} {data.householdSize === 1 ? "person" : "people"}</span>
        </label>
        <input
          id="household-size"
          type="range"
          min={1}
          max={8}
          step={1}
          value={data.householdSize}
          onChange={(e) => update("householdSize", Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <ToggleSwitch
          id="ac-toggle"
          label="Air Conditioning"
          description="Do you use AC regularly?"
          checked={data.hasAirConditioning}
          onChange={(checked) => update("hasAirConditioning", checked)}
        />

        <ToggleSwitch
          id="heating-toggle"
          label="Electric Heating"
          description="Electric boiler or radiators?"
          checked={data.hasElectricHeating}
          onChange={(checked) => update("hasElectricHeating", checked)}
        />
      </div>
    </div>
  );
}
