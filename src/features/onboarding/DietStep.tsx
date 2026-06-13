"use client";

import type { CarbonTwinProfile } from "@/types";

interface DietStepProps {
  data: CarbonTwinProfile["diet"];
  onChange: (data: CarbonTwinProfile["diet"]) => void;
}

const DIET_TYPES = [
  { value: "vegan", label: "Vegan", emoji: "🌱", desc: "100% plant-based" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥦", desc: "No meat or fish" },
  { value: "pescatarian", label: "Pescatarian", emoji: "🐟", desc: "Fish, no meat" },
  { value: "omnivore_low", label: "Flexitarian", emoji: "🥗", desc: "Mostly plant-based" },
  { value: "omnivore_medium", label: "Omnivore", emoji: "🍽️", desc: "Regular meat eater" },
  { value: "omnivore_high", label: "High Meat", emoji: "🥩", desc: "Daily meat consumption" },
] as const;

export function DietStep({ data, onChange }: DietStepProps) {
  const update = <K extends keyof typeof data>(key: K, value: typeof data[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">🥗 Diet Habits</h2>
        <p className="text-muted-foreground">Food choices significantly impact your carbon footprint</p>
      </div>

      {/* Diet type */}
      <fieldset>
        <legend className="block text-sm font-medium mb-3">Which best describes your diet?</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DIET_TYPES.map((diet) => (
            <label
              key={diet.value}
              className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all ${
                data.type === diet.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="dietType"
                value={diet.value}
                checked={data.type === diet.value}
                onChange={() => update("type", diet.value)}
                className="sr-only"
              />
              <span className="text-2xl" aria-hidden="true">{diet.emoji}</span>
              <span className="font-medium text-sm">{diet.label}</span>
              <span className="text-xs text-muted-foreground">{diet.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Meat meals per week */}
      <div>
        <label htmlFor="meat-meals" className="block text-sm font-medium mb-2">
          Meat meals per week:{" "}
          <span className="text-primary font-bold">{data.meatMealsPerWeek}</span>
        </label>
        <input
          id="meat-meals"
          type="range"
          min={0}
          max={21}
          step={1}
          value={data.meatMealsPerWeek}
          onChange={(e) => update("meatMealsPerWeek", Number(e.target.value))}
          className="w-full accent-primary"
          aria-label={`Meat meals per week: ${data.meatMealsPerWeek}`}
        />
      </div>

      {/* Dairy */}
      <div>
        <label htmlFor="dairy-servings" className="block text-sm font-medium mb-2">
          Dairy servings per day:{" "}
          <span className="text-primary font-bold">{data.dairyServingsPerDay}</span>
        </label>
        <input
          id="dairy-servings"
          type="range"
          min={0}
          max={6}
          step={0.5}
          value={data.dairyServingsPerDay}
          onChange={(e) => update("dairyServingsPerDay", Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Local food */}
      <div>
        <label htmlFor="local-food" className="block text-sm font-medium mb-2">
          Locally-sourced food:{" "}
          <span className="text-primary font-bold">{data.localFoodPercentage}%</span>
        </label>
        <input
          id="local-food"
          type="range"
          min={0}
          max={100}
          step={5}
          value={data.localFoodPercentage}
          onChange={(e) => update("localFoodPercentage", Number(e.target.value))}
          className="w-full accent-primary"
          aria-describedby="local-food-hint"
        />
        <p id="local-food-hint" className="text-xs text-muted-foreground mt-1">
          Seasonal and locally grown food has a much lower footprint
        </p>
      </div>
    </div>
  );
}
