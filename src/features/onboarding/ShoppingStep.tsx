"use client";

import type { CarbonTwinProfile } from "@/types";

interface ShoppingStepProps {
  data: CarbonTwinProfile["shopping"];
  onChange: (data: CarbonTwinProfile["shopping"]) => void;
}

export function ShoppingStep({ data, onChange }: ShoppingStepProps) {
  const update = <K extends keyof typeof data>(key: K, value: typeof data[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">🛍️ Shopping & Consumption</h2>
        <p className="text-muted-foreground">What you buy and how you dispose of it matters</p>
      </div>

      {/* Clothing */}
      <div>
        <label htmlFor="clothing-items" className="block text-sm font-medium mb-2">
          New clothing items per year:{" "}
          <span className="text-primary font-bold">{data.newClothingItemsPerYear}</span>
        </label>
        <input
          id="clothing-items"
          type="range"
          min={0}
          max={100}
          step={1}
          value={data.newClothingItemsPerYear}
          onChange={(e) => update("newClothingItemsPerYear", Number(e.target.value))}
          className="w-full accent-primary"
          aria-describedby="clothing-hint"
        />
        <p id="clothing-hint" className="text-xs text-muted-foreground mt-1">
          Average person buys 20-60 new garments per year · Each item ≈ 33 kgCO₂e
        </p>
      </div>

      {/* Electronics */}
      <div>
        <label htmlFor="electronics-items" className="block text-sm font-medium mb-2">
          New electronics per year:{" "}
          <span className="text-primary font-bold">{data.electronicsPerYear}</span>
        </label>
        <input
          id="electronics-items"
          type="range"
          min={0}
          max={10}
          step={1}
          value={data.electronicsPerYear}
          onChange={(e) => update("electronicsPerYear", Number(e.target.value))}
          className="w-full accent-primary"
          aria-describedby="electronics-hint"
        />
        <p id="electronics-hint" className="text-xs text-muted-foreground mt-1">
          Smartphones, laptops, TVs, etc. · Each item ≈ 400 kgCO₂e on average
        </p>
      </div>

      {/* Online orders */}
      <div>
        <label htmlFor="online-orders" className="block text-sm font-medium mb-2">
          Online deliveries per month:{" "}
          <span className="text-primary font-bold">{data.onlineOrdersPerMonth}</span>
        </label>
        <input
          id="online-orders"
          type="range"
          min={0}
          max={30}
          step={1}
          value={data.onlineOrdersPerMonth}
          onChange={(e) => update("onlineOrdersPerMonth", Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Recycling */}
      <div>
        <label htmlFor="recycling" className="block text-sm font-medium mb-2">
          Recycling rate:{" "}
          <span className="text-primary font-bold">{data.recyclingPercentage}%</span>
        </label>
        <input
          id="recycling"
          type="range"
          min={0}
          max={100}
          step={5}
          value={data.recyclingPercentage}
          onChange={(e) => update("recyclingPercentage", Number(e.target.value))}
          className="w-full accent-primary"
          aria-describedby="recycling-hint"
        />
        <p id="recycling-hint" className="text-xs text-muted-foreground mt-1">
          What percentage of your waste do you recycle or compost?
        </p>

        {/* Visual recycling indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${data.recyclingPercentage}%`,
                background: `linear-gradient(90deg, #22c55e, #14b8a6)`,
              }}
              role="presentation"
            />
          </div>
          <span className="text-xs text-muted-foreground w-8 text-right">
            {data.recyclingPercentage}%
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="glass rounded-xl p-4 mt-2">
        <p className="text-sm font-medium mb-1">🎉 Almost done!</p>
        <p className="text-xs text-muted-foreground">
          After completing setup, your Digital Carbon Twin will be created and you can start exploring your future impact.
        </p>
      </div>
    </div>
  );
}
