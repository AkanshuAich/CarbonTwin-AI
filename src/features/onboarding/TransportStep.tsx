"use client";

import type { CarbonTwinProfile } from "@/types";

interface TransportStepProps {
  data: CarbonTwinProfile["transport"];
  onChange: (data: CarbonTwinProfile["transport"]) => void;
}

const TRANSPORT_MODES = [
  { value: "car_petrol", label: "Petrol Car", emoji: "🚗" },
  { value: "car_diesel", label: "Diesel Car", emoji: "🚙" },
  { value: "car_electric", label: "Electric Car", emoji: "⚡" },
  { value: "motorcycle", label: "Motorcycle", emoji: "🏍️" },
  { value: "bus", label: "Bus", emoji: "🚌" },
  { value: "metro", label: "Metro/Train", emoji: "🚇" },
  { value: "bicycle", label: "Bicycle", emoji: "🚲" },
  { value: "walking", label: "Walking", emoji: "🚶" },
] as const;

export function TransportStep({ data, onChange }: TransportStepProps) {
  const update = <K extends keyof typeof data>(key: K, value: typeof data[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">🚗 Transport Habits</h2>
        <p className="text-muted-foreground">Tell us about how you get around</p>
      </div>

      {/* Primary mode */}
      <fieldset>
        <legend className="block text-sm font-medium mb-3">Primary mode of transport</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRANSPORT_MODES.map((mode) => (
            <label
              key={mode.value}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border cursor-pointer transition-all ${
                data.primaryMode === mode.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="primaryMode"
                value={mode.value}
                checked={data.primaryMode === mode.value}
                onChange={() => update("primaryMode", mode.value)}
                className="sr-only"
              />
              <span className="text-2xl" aria-hidden="true">{mode.emoji}</span>
              <span className="text-xs font-medium text-center">{mode.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Weekly km */}
      <div>
        <label htmlFor="weekly-km" className="block text-sm font-medium mb-2">
          Weekly distance travelled:{" "}
          <span className="text-primary font-bold">{data.weeklyKm} km</span>
        </label>
        <input
          id="weekly-km"
          type="range"
          min={0}
          max={500}
          step={10}
          value={data.weeklyKm}
          onChange={(e) => update("weeklyKm", Number(e.target.value))}
          className="w-full accent-primary"
          aria-describedby="weekly-km-hint"
        />
        <p id="weekly-km-hint" className="text-xs text-muted-foreground mt-1">
          Total km per week for all transport combined
        </p>
      </div>

      {/* Flights */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="short-haul" className="block text-sm font-medium mb-2">
            Short-haul flights/year{" "}
            <span className="text-primary font-bold">({data.shortHaulFlights})</span>
          </label>
          <input
            id="short-haul"
            type="range"
            min={0}
            max={20}
            step={1}
            value={data.shortHaulFlights}
            onChange={(e) => update("shortHaulFlights", Number(e.target.value))}
            className="w-full accent-primary"
            aria-label={`Short-haul flights per year: ${data.shortHaulFlights}`}
          />
          <p className="text-xs text-muted-foreground mt-1">Under 3 hours ✈️</p>
        </div>
        <div>
          <label htmlFor="long-haul" className="block text-sm font-medium mb-2">
            Long-haul flights/year{" "}
            <span className="text-primary font-bold">({data.longHaulFlights})</span>
          </label>
          <input
            id="long-haul"
            type="range"
            min={0}
            max={10}
            step={1}
            value={data.longHaulFlights}
            onChange={(e) => update("longHaulFlights", Number(e.target.value))}
            className="w-full accent-primary"
            aria-label={`Long-haul flights per year: ${data.longHaulFlights}`}
          />
          <p className="text-xs text-muted-foreground mt-1">Over 3 hours ✈️</p>
        </div>
      </div>
    </div>
  );
}
