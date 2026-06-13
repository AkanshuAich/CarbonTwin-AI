"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Car, Bus, Bike, Footprints, Search, Loader2 } from "lucide-react";
import { formatCO2, cn } from "@/utils";
import type { RouteOption, TravelMode } from "@/types";
import { ROUTE_EMISSION_FACTORS } from "@/lib/carbon/constants";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const MODE_CONFIG: Record<TravelMode, { label: string; icon: React.ElementType; color: string }> = {
  driving: { label: "Car", icon: Car, color: "#ef4444" },
  transit: { label: "Public Transit", icon: Bus, color: "#f59e0b" },
  bicycling: { label: "Cycling", icon: Bike, color: "#22c55e" },
  walking: { label: "Walking", icon: Footprints, color: "#14b8a6" },
};

export default function GreenRoutesPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<RouteOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [activeMode, setActiveMode] = useState<TravelMode | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  const googleMapsRef = useRef<{
    map: google.maps.Map;
    directionsService: google.maps.DirectionsService;
    directionsRenderer: google.maps.DirectionsRenderer;
    originAutocomplete: google.maps.places.Autocomplete;
    destAutocomplete: google.maps.places.Autocomplete;
    flightPolyline?: google.maps.Polyline | null;
  } | null>(null);

  const routeResponsesRef = useRef<Partial<Record<TravelMode, google.maps.DirectionsResult>>>({});

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Google Maps API key is missing");
        return;
      }

      // Configure the Maps JS API via the module-level loader
      const loaderOptions = {
        key: apiKey,
        version: "weekly" as const,
      };
      setOptions(loaderOptions as Parameters<typeof setOptions>[0]);

      try {
        const [mapsLib, routesLib, placesLib, geocodingLib] = await Promise.all([
          importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          importLibrary("routes") as Promise<google.maps.RoutesLibrary>,
          importLibrary("places") as Promise<google.maps.PlacesLibrary>,
          importLibrary("geocoding") as Promise<google.maps.GeocodingLibrary>
        ]);
        
        if (!mapRef.current || !originInputRef.current || !destInputRef.current) return;

        const map = new mapsLib.Map(mapRef.current, {
          center: { lat: 51.5072, lng: -0.1276 }, // Default London
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const directionsService = new routesLib.DirectionsService();
        const directionsRenderer = new routesLib.DirectionsRenderer({
          map,
          suppressMarkers: false,
        });

        const originAutocomplete = new placesLib.Autocomplete(originInputRef.current, { fields: ["formatted_address", "geometry", "name"] });
        const destAutocomplete = new placesLib.Autocomplete(destInputRef.current, { fields: ["formatted_address", "geometry", "name"] });

        originAutocomplete.addListener("place_changed", () => {
          const place = originAutocomplete.getPlace();
          if (place.formatted_address) {
            setOrigin(place.formatted_address);
          } else if (place.name) {
            setOrigin(place.name);
          }
        });

        destAutocomplete.addListener("place_changed", () => {
          const place = destAutocomplete.getPlace();
          if (place.formatted_address) {
            setDestination(place.formatted_address);
          } else if (place.name) {
            setDestination(place.name);
          }
        });

        googleMapsRef.current = { map, directionsService, directionsRenderer, originAutocomplete, destAutocomplete };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            map.setCenter(pos);
            
            // Geocode the position to an address for the "From" input
            try {
              const geocoder = new geocodingLib.Geocoder();
              const response = await geocoder.geocode({ location: pos });
              if (response.results[0]) {
                const address = response.results[0].formatted_address;
                setOrigin(address);
                if (originInputRef.current) {
                  originInputRef.current.value = address;
                }
              }
            } catch (geocodeErr) {
              console.error("Failed to geocode current location", geocodeErr);
            }
          });
        }
      } catch (err) {
        console.error("Failed to load Google Maps", err);
      }
    };

    initMap();
  }, []);

  const handleSearch = async () => {
    const searchOrigin = originInputRef.current?.value || origin;
    const searchDest = destInputRef.current?.value || destination;

    if (!searchOrigin || !searchDest || !googleMapsRef.current) return;
    if (googleMapsRef.current.flightPolyline) {
      googleMapsRef.current.flightPolyline.setMap(null);
      googleMapsRef.current.flightPolyline = null;
    }
    
    setIsLoading(true);
    setRoutes(null);
    setAiRecommendation("");
    routeResponsesRef.current = {};

    const { directionsService, directionsRenderer } = googleMapsRef.current;
    const modes: { mode: TravelMode; travelMode: google.maps.TravelMode }[] = [
      { mode: "driving", travelMode: window.google.maps.TravelMode.DRIVING },
      { mode: "transit", travelMode: window.google.maps.TravelMode.TRANSIT },
      { mode: "bicycling", travelMode: window.google.maps.TravelMode.BICYCLING },
      { mode: "walking", travelMode: window.google.maps.TravelMode.WALKING },
    ];

    const results: RouteOption[] = [];

    await Promise.allSettled(
      modes.map(async ({ mode, travelMode }) => {
        try {
          const response = await directionsService.route({
            origin: searchOrigin,
            destination: searchDest,
            travelMode,
            provideRouteAlternatives: false,
          });

          if (response.routes.length > 0) {
            routeResponsesRef.current[mode] = response;
            const route = response.routes[0]!;
            let totalDistanceMeters = 0;
            let totalDurationSeconds = 0;

            route.legs.forEach(leg => {
              if (leg.distance) totalDistanceMeters += leg.distance.value;
              if (leg.duration) totalDurationSeconds += leg.duration.value;
            });

            const distanceKm = totalDistanceMeters / 1000;
            const durationMinutes = Math.round(totalDurationSeconds / 60);
            
            // Hard UI limits: Completely hide options that are physically unreasonable
            if (mode === "walking" && distanceKm > 25) return; // Hide walking if > 25km (~5 hours)
            if (mode === "bicycling" && distanceKm > 100) return; // Hide cycling if > 100km (~5 hours)

            let emissionsKgCO2e = 0;
            if (mode === "driving") emissionsKgCO2e = distanceKm * (ROUTE_EMISSION_FACTORS.driving || 0.192);
            else if (mode === "transit") emissionsKgCO2e = distanceKm * (ROUTE_EMISSION_FACTORS.transit || 0.089);
            
            let cost = 0;
            if (mode === "driving") cost = distanceKm * 0.15;
            else if (mode === "transit") cost = 2.5;

            results.push({
              mode,
              displayName: MODE_CONFIG[mode].label,
              icon: "", 
              durationMinutes,
              distanceKm,
              emissionsKgCO2e,
              cost,
            });
          }
        } catch {
          // Skip mode if not available
        }
      })
    );

    if (results.length > 0) {
      const carRoute = results.find(r => r.mode === "driving");
      
      const viableGreenRoutes = results.filter(r => {
        if (r.mode === "driving") return false;
        
        // Human limits for active transport
        if (r.mode === "walking" && r.distanceKm > 3) return false; // Don't recommend walking > 3km
        if (r.mode === "bicycling" && r.distanceKm > 15) return false; // Don't recommend cycling > 15km
        
        // Practicality limit for public transit
        if (r.mode === "transit" && carRoute) {
          // If transit takes more than 2.5x the time of driving, it's considered unviable for comfort
          if (r.durationMinutes > carRoute.durationMinutes * 2.5) return false;
        }
        
        return true;
      });

      // Sort remaining viable green routes by lowest emissions
      const bestGreen = viableGreenRoutes.sort((a, b) => a.emissionsKgCO2e - b.emissionsKgCO2e)[0] || null;

      if (bestGreen) {
        bestGreen.recommended = true;
      }
      
      if (carRoute && bestGreen && carRoute.emissionsKgCO2e > bestGreen.emissionsKgCO2e) {
        setAiRecommendation(
          `✨ Taking ${bestGreen.displayName} instead of driving saves ${formatCO2(
            carRoute.emissionsKgCO2e - bestGreen.emissionsKgCO2e
          )} of CO₂ for this journey!`
        );
      } else if (carRoute && !bestGreen) {
        // No viable green alternatives
        setAiRecommendation(
          `🚗 For a journey of this distance (${carRoute.distanceKm.toFixed(1)} km), driving is currently the most practical option.`
        );
      }

      setRoutes(results);
      
      const renderMode = bestGreen ? bestGreen.mode : results[0]!.mode;
      setActiveMode(renderMode);
      directionsRenderer.setMap(googleMapsRef.current.map);
      directionsRenderer.setDirections(routeResponsesRef.current[renderMode]!);
      directionsRenderer.setOptions({
        polylineOptions: { strokeColor: MODE_CONFIG[renderMode].color, strokeWeight: 6 }
      });
    } else {
      // Clear the old route from the map so it isn't stuck displaying the previous search
      directionsRenderer.setMap(null);
      
      // If results.length === 0 (e.g. crossing oceans, unmapped territory)
      setAiRecommendation("✨ Asking AI for smart multi-modal alternatives...");
      
      // Draw a flight path (geodesic polyline) between origin and destination
      try {
        const geocodingLib = await importLibrary("geocoding") as google.maps.GeocodingLibrary;
        const geocoder = new geocodingLib.Geocoder();
        
        const [originRes, destRes] = await Promise.all([
          geocoder.geocode({ address: searchOrigin }),
          geocoder.geocode({ address: searchDest })
        ]);
        
        if (originRes.results[0] && destRes.results[0]) {
          const oLoc = originRes.results[0].geometry.location;
          const dLoc = destRes.results[0].geometry.location;
          
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(oLoc);
          bounds.extend(dLoc);
          googleMapsRef.current.map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
          
          const flightPath = new window.google.maps.Polyline({
            path: [oLoc, dLoc],
            geodesic: true,
            strokeColor: "#3b82f6", // Blue flight path
            strokeOpacity: 0,
            strokeWeight: 4,
            icons: [{
              icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 },
              offset: "0",
              repeat: "20px"
            }]
          });
          flightPath.setMap(googleMapsRef.current.map);
          
          // Store it so we can clear it next time
          googleMapsRef.current.flightPolyline = flightPath;
        }
      } catch {
        // Fallback for failed flight path
      }

      try {
        const aiRes = await fetch("/api/ai/route-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: searchOrigin, destination: searchDest }),
        });
        const aiData = await aiRes.json();
        if (aiData.advice) {
          setAiRecommendation("🌍 " + aiData.advice);
        } else {
          setAiRecommendation(
            "❌ We couldn't find any viable routes between these two locations."
          );
        }
      } catch (err) {
        setAiRecommendation(
          "❌ We couldn't find any viable routes between these two locations."
        );
      }
      setRoutes([]);
    }

    setIsLoading(false);
  };

  const handleSelectRoute = (mode: TravelMode) => {
    if (!googleMapsRef.current) return;
    const response = routeResponsesRef.current[mode];
    if (response) {
      setActiveMode(mode);
      googleMapsRef.current.directionsRenderer.setMap(googleMapsRef.current.map);
      googleMapsRef.current.directionsRenderer.setDirections(response);
      googleMapsRef.current.directionsRenderer.setOptions({
        polylineOptions: { strokeColor: MODE_CONFIG[mode].color, strokeWeight: 6 }
      });
    }
  };

  const carEmissions = routes?.find((r) => r.mode === "driving")?.emissionsKgCO2e ?? 0;

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
            <label htmlFor="origin-input" className="block text-sm font-medium mb-2">
              From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
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
            <label htmlFor="destination-input" className="block text-sm font-medium mb-2">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" aria-hidden="true" />
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
              <p className="text-sm font-medium text-foreground leading-relaxed">{aiRecommendation}</p>
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
                const Icon = config.icon;
                const saving = carEmissions - route.emissionsKgCO2e;
                const savingPercent = carEmissions > 0 ? (saving / carEmissions) * 100 : 0;
                const isActive = activeMode === route.mode;

                return (
                  <button
                    key={route.mode}
                    onClick={() => handleSelectRoute(route.mode)}
                    className={cn(
                      "text-left glass rounded-2xl p-5 transition-all w-full",
                      isActive ? "ring-2 ring-primary shadow-md" : "hover:border-primary/30 card-hover",
                      route.recommended && !isActive && "border-primary/40 border"
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
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate">{route.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {route.durationMinutes} min · {route.distanceKm.toFixed(1)} km
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">CO₂</span>
                        <span
                          className="font-bold text-sm"
                          style={{ color: route.emissionsKgCO2e === 0 ? "#22c55e" : route.mode === "driving" ? "#ef4444" : "#f59e0b" }}
                        >
                          {route.emissionsKgCO2e === 0 ? "Zero 🌿" : formatCO2(route.emissionsKgCO2e)}
                        </span>
                      </div>

                      {saving > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">vs Drive</span>
                          <span className="text-emerald-500 font-medium text-sm">
                            -{Math.round(savingPercent)}%
                          </span>
                        </div>
                      )}

                      {route.cost !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Cost</span>
                          <span className="font-medium text-sm text-muted-foreground">
                            {route.cost === 0 ? "Free" : `£${route.cost.toFixed(2)}`}
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
