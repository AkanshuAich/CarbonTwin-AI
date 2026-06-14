"use client";

import { motion } from "framer-motion";
import { MapPin, Search, Loader2 } from "lucide-react";
import { formatCO2, cn } from "@/utils";
import { useGreenRoutes, MODE_CONFIG } from "@/hooks/useGreenRoutes";

export default function GreenRoutesPage() {
  const {
    origin,
    destination,
    routes,
    isLoading,
    aiRecommendation,
    activeMode,
    mapRef,
    originInputRef,
    destInputRef,
    handleSearch,
    handleSelectRoute,
  } = useGreenRoutes();

  const carEmissions =
    routes?.find((r) => r.mode === "driving")?.emissionsKgCO2e ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-6 h-6 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold">Green Route Intelligence</h1>
        </div>
        <p className="text-muted-foreground">
          Compare travel modes and find the lowest-carbon route for any journey
        </p>
      </div>

      {/* Map Element */}
      <div
        ref={mapRef}
        className="w-full glass rounded-2xl overflow-hidden shadow-inner border border-border/50"
        style={{ height: "400px" }}
        role="region"
        aria-label="Interactive Map"
      >
        <div className="w-full h-full flex items-center justify-center bg-muted/30">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      </div>

      {/* Search */}
      <div className="glass rounded-2xl p-6 relative z-10 -mt-12 mx-4 shadow-lg border border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label
              htmlFor="origin-input"
              className="block text-sm font-medium mb-2"
            >
              From
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="origin-input"
                ref={originInputRef}
                type="text"
                defaultValue={origin}
                placeholder="Enter start location"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="destination-input"
              className="block text-sm font-medium mb-2"
            >
              To
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary"
                aria-hidden="true"
              />
              <input
                id="destination-input"
                ref={destInputRef}
                type="text"
                defaultValue={destination}
                placeholder="Enter destination"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-medium gradient-brand text-white h-[42px]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:shadow-lg hover:shadow-primary/20 transition-all"
            )}
            aria-label="Search for green routes"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="w-4 h-4" aria-hidden="true" />
            )}
            Compare
          </button>
        </div>
      </div>

      {/* Results */}
      {routes && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {aiRecommendation && (
            <div className="glass rounded-2xl p-5 border border-primary/20 bg-primary/5">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {aiRecommendation}
              </p>
            </div>
          )}

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            role="list"
            aria-label="Route options sorted by carbon emissions"
          >
            {routes
              .sort((a, b) => a.emissionsKgCO2e - b.emissionsKgCO2e)
              .map((route) => {
                const config = MODE_CONFIG[route.mode];
                const saving = carEmissions - route.emissionsKgCO2e;
                const savingPercent =
                  carEmissions > 0 ? (saving / carEmissions) * 100 : 0;
                const isActive = activeMode === route.mode;

                return (
                  <button
                    key={route.mode}
                    onClick={() => handleSelectRoute(route.mode)}
                    className={cn(
                      "text-left glass rounded-2xl p-5 transition-all w-full",
                      isActive
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:border-primary/30 card-hover",
                      route.recommended &&
                        !isActive &&
                        "border-primary/40 border"
                    )}
                    role="listitem"
                  >
                    {route.recommended && (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium mb-2">
                        <span aria-hidden="true">✨</span> AI Recommended
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${config.color}20` }}
                        aria-hidden="true"
                      >
                        {/* Note: In a real app we'd map string names to Lucide icons properly. For now we use the string or component if it carried over. 
                            Since we changed the hook to return strings for icons to avoid shipping components in the hook state, let's just use generic icons here or map them. */}
                        {route.mode === "driving" && <span className="text-lg">🚗</span>}
                        {route.mode === "transit" && <span className="text-lg">🚌</span>}
                        {route.mode === "bicycling" && <span className="text-lg">🚲</span>}
                        {route.mode === "walking" && <span className="text-lg">🚶</span>}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate">
                          {route.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {route.durationMinutes} min ·{" "}
                          {route.distanceKm.toFixed(1)} km
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          CO₂
                        </span>
                        <span
                          className="font-bold text-sm"
                          style={{
                            color:
                              route.emissionsKgCO2e === 0
                                ? "#22c55e"
                                : route.mode === "driving"
                                ? "#ef4444"
                                : "#f59e0b",
                          }}
                        >
                          {route.emissionsKgCO2e === 0
                            ? "Zero 🌿"
                            : formatCO2(route.emissionsKgCO2e)}
                        </span>
                      </div>

                      {saving > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            vs Drive
                          </span>
                          <span className="text-emerald-500 font-medium text-sm">
                            -{Math.round(savingPercent)}%
                          </span>
                        </div>
                      )}

                      {route.cost !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Cost
                          </span>
                          <span className="font-medium text-sm text-muted-foreground">
                            {route.cost === 0
                              ? "Free"
                              : `£${route.cost.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
