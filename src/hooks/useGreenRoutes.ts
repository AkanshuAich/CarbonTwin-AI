import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/logger";
import type { RouteOption, TravelMode } from "@/types";
import { ROUTE_EMISSION_FACTORS } from "@/lib/carbon/constants";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { formatCO2 } from "@/utils";
import {
  WALKING_MAX_DISPLAY_KM,
  CYCLING_MAX_DISPLAY_KM,
  WALKING_RECOMMEND_MAX_KM,
  CYCLING_RECOMMEND_MAX_KM,
  TRANSIT_MAX_DRIVING_TIME_RATIO,
  DRIVING_COST_PER_KM,
  TRANSIT_FLAT_FARE,
} from "@/constants";

export const MODE_CONFIG: Record<
  TravelMode,
  { label: string; icon: string; color: string }
> = {
  driving: { label: "Car", icon: "Car", color: "#ef4444" },
  transit: { label: "Public Transit", icon: "Bus", color: "#f59e0b" },
  bicycling: { label: "Cycling", icon: "Bike", color: "#22c55e" },
  walking: { label: "Walking", icon: "Footprints", color: "#14b8a6" },
};

export function useGreenRoutes() {
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

  const routeResponsesRef = useRef<
    Partial<Record<TravelMode, google.maps.DirectionsResult>>
  >({});

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        logger.error({
          message: "Google Maps API key is missing — set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
        });
        return;
      }

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
          importLibrary("geocoding") as Promise<google.maps.GeocodingLibrary>,
        ]);

        if (!mapRef.current || !originInputRef.current || !destInputRef.current)
          return;

        const map = new mapsLib.Map(mapRef.current, {
          center: { lat: 51.5072, lng: -0.1276 },
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const directionsService = new routesLib.DirectionsService();
        const directionsRenderer = new routesLib.DirectionsRenderer({
          map,
          suppressMarkers: false,
        });

        const originAutocomplete = new placesLib.Autocomplete(
          originInputRef.current,
          { fields: ["formatted_address", "geometry", "name"] }
        );
        const destAutocomplete = new placesLib.Autocomplete(
          destInputRef.current,
          { fields: ["formatted_address", "geometry", "name"] }
        );

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

        googleMapsRef.current = {
          map,
          directionsService,
          directionsRenderer,
          originAutocomplete,
          destAutocomplete,
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            map.setCenter(pos);

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
              logger.warn({
                message: "Failed to geocode current location",
                error: String(geocodeErr),
              });
            }
          });
        }
      } catch (err) {
        logger.error({
          message: "Failed to load Google Maps libraries",
          error: String(err),
        });
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

            route.legs.forEach((leg) => {
              if (leg.distance) totalDistanceMeters += leg.distance.value;
              if (leg.duration) totalDurationSeconds += leg.duration.value;
            });

            const distanceKm = totalDistanceMeters / 1000;
            const durationMinutes = Math.round(totalDurationSeconds / 60);

            if (mode === "walking" && distanceKm > WALKING_MAX_DISPLAY_KM) return;
            if (mode === "bicycling" && distanceKm > CYCLING_MAX_DISPLAY_KM) return;

            let emissionsKgCO2e = 0;
            if (mode === "driving")
              emissionsKgCO2e =
                distanceKm * (ROUTE_EMISSION_FACTORS.driving || 0.192);
            else if (mode === "transit")
              emissionsKgCO2e =
                distanceKm * (ROUTE_EMISSION_FACTORS.transit || 0.089);

            let cost = 0;
            if (mode === "driving") cost = distanceKm * DRIVING_COST_PER_KM;
            else if (mode === "transit") cost = TRANSIT_FLAT_FARE;

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
        } catch (err) {
          logger.warn({
            message: `No directions available for mode, skipping`,
            error: String(err),
          });
        }
      })
    );

    if (results.length > 0) {
      const carRoute = results.find((r) => r.mode === "driving");

      const viableGreenRoutes = results.filter((r) => {
        if (r.mode === "driving") return false;

        if (r.mode === "walking" && r.distanceKm > WALKING_RECOMMEND_MAX_KM)
          return false;
        if (r.mode === "bicycling" && r.distanceKm > CYCLING_RECOMMEND_MAX_KM)
          return false;

        if (r.mode === "transit" && carRoute) {
          if (
            r.durationMinutes >
            carRoute.durationMinutes * TRANSIT_MAX_DRIVING_TIME_RATIO
          )
            return false;
        }

        return true;
      });

      const bestGreen =
        viableGreenRoutes.sort(
          (a, b) => a.emissionsKgCO2e - b.emissionsKgCO2e
        )[0] || null;

      if (bestGreen) {
        bestGreen.recommended = true;
      }

      if (
        carRoute &&
        bestGreen &&
        carRoute.emissionsKgCO2e > bestGreen.emissionsKgCO2e
      ) {
        setAiRecommendation(
          `✨ Taking ${bestGreen.displayName} instead of driving saves ${formatCO2(
            carRoute.emissionsKgCO2e - bestGreen.emissionsKgCO2e
          )} of CO₂ for this journey!`
        );
      } else if (carRoute && !bestGreen) {
        setAiRecommendation(
          `🚗 For a journey of this distance (${carRoute.distanceKm.toFixed(
            1
          )} km), driving is currently the most practical option.`
        );
      }

      setRoutes(results);

      const renderMode = bestGreen ? bestGreen.mode : results[0]!.mode;
      setActiveMode(renderMode);
      directionsRenderer.setMap(googleMapsRef.current.map);
      directionsRenderer.setDirections(routeResponsesRef.current[renderMode]!);
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: MODE_CONFIG[renderMode].color,
          strokeWeight: 6,
        },
      });
    } else {
      directionsRenderer.setMap(null);
      setAiRecommendation("✨ Asking AI for smart multi-modal alternatives...");

      try {
        const geocodingLib = (await importLibrary(
          "geocoding"
        )) as google.maps.GeocodingLibrary;
        const geocoder = new geocodingLib.Geocoder();

        const [originRes, destRes] = await Promise.all([
          geocoder.geocode({ address: searchOrigin }),
          geocoder.geocode({ address: searchDest }),
        ]);

        if (originRes.results[0] && destRes.results[0]) {
          const oLoc = originRes.results[0].geometry.location;
          const dLoc = destRes.results[0].geometry.location;

          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(oLoc);
          bounds.extend(dLoc);
          googleMapsRef.current.map.fitBounds(bounds, {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          });

          const flightPath = new window.google.maps.Polyline({
            path: [oLoc, dLoc],
            geodesic: true,
            strokeColor: "#3b82f6",
            strokeOpacity: 0,
            strokeWeight: 4,
            icons: [
              {
                icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 },
                offset: "0",
                repeat: "20px",
              },
            ],
          });
          flightPath.setMap(googleMapsRef.current.map);

          googleMapsRef.current.flightPolyline = flightPath;
        }
      } catch (err) {
        logger.warn({
          message: "Failed to draw flight path polyline",
          error: String(err),
        });
      }

      try {
        const aiRes = await fetch("/api/ai/route-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: searchOrigin,
            destination: searchDest,
          }),
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
        logger.error({
          message: "AI route advisor fetch failed",
          error: String(err),
        });
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
      googleMapsRef.current.directionsRenderer.setMap(
        googleMapsRef.current.map
      );
      googleMapsRef.current.directionsRenderer.setDirections(response);
      googleMapsRef.current.directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: MODE_CONFIG[mode].color,
          strokeWeight: 6,
        },
      });
    }
  };

  return {
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
  };
}
