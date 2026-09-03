"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTripDetail } from "@/app/provider";
import { Activity, Itinerary } from "./ChatBox";
import {
  MapPin,
  Globe,
  Play,
  Pause,
  RotateCw,
  Compass,
  Layers,
  Sparkles,
  Navigation,
  ExternalLink,
} from "lucide-react";

type PinData = {
  name: string;
  lng: number;
  lat: number;
  type: "hotel" | "activity";
  day?: number;
  activityIndex?: number;
  address?: string;
  price?: string;
  time?: string;
  details?: string;
};

const FallbackMap = () => {
  const { tripDetailInfo, targetPlace } = useTripDetail();
  const [selectedPin, setSelectedPin] = useState<number | null>(null);

  const pins = useMemo(() => {
    const items: PinData[] = [];
    tripDetailInfo?.hotels?.forEach((h) => {
      const lng = h?.geo_coordinates?.longitude;
      const lat = h?.geo_coordinates?.latitude;
      if (typeof lng === "number" && typeof lat === "number") {
        items.push({
          name: h.hotel_name,
          lng,
          lat,
          type: "hotel",
          address: h.hotel_address,
          price: h.price_per_night,
          details: h.description,
        });
      }
    });

    tripDetailInfo?.itinerary?.forEach((it: Itinerary) => {
      it.activities?.forEach((a: Activity, aIdx) => {
        const lng = a?.geo_coordinates?.longitude;
        const lat = a?.geo_coordinates?.latitude;
        if (typeof lng === "number" && typeof lat === "number") {
          items.push({
            name: a.place_name,
            lng,
            lat,
            type: "activity",
            day: it.day,
            activityIndex: aIdx + 1,
            address: a.place_address,
            price: a.ticket_pricing,
            time: a.best_time_to_visit,
            details: a.place_details,
          });
        }
      });
    });
    return items;
  }, [tripDetailInfo]);

  useEffect(() => {
    if (targetPlace) {
      const idx = pins.findIndex((p) => p.name === targetPlace.name);
      if (idx !== -1) setSelectedPin(idx);
    }
  }, [targetPlace, pins]);

  return (
    <div
      className="relative overflow-hidden border shadow-2xl rounded-2xl"
      style={{
        width: "95%",
        height: "85vh",
        background:
          "radial-gradient(ellipse at 20% 10%, #0f172a 0%, #020617 100%)",
      }}
    >
      {/* Animated Glowing Grid lines */}
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="1000" height="600" fill="url(#grid)" />
      </svg>

      {/* Flight Route Path */}
      {pins.length > 1 && (
        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <path
            d={pins.reduce((acc, p, i) => {
              const x = ((p.lng + 180) / 360) * 1000;
              const y = ((85 - p.lat) / 170) * 600;
              return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
            }, "")}
            fill="none"
            stroke="url(#routeGlow)"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Header Overlay */}
      <div className="absolute left-5 top-5 flex items-center gap-3 rounded-full bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur border border-sky-500/30 shadow-lg">
        <Sparkles className="h-4 w-4 text-sky-400 animate-spin" />
        <span>{tripDetailInfo?.destination ?? "Interactive Expedition Map"}</span>
        {pins.length > 0 && (
          <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            {pins.length} Locations
          </span>
        )}
      </div>

      {/* Interactive Neon Pins */}
      {pins.map((p, i) => {
        const xPct = ((p.lng + 180) / 360) * 100;
        const yPct = ((85 - p.lat) / 170) * 100;
        const isSelected = selectedPin === i;

        return (
          <div
            key={`${p.lng}-${p.lat}-${i}`}
            className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-10"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
            onClick={() => setSelectedPin(i)}
          >
            <div className={`relative flex flex-col items-center transition-transform duration-300 ${isSelected ? "scale-125" : "hover:scale-110"}`}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-xl ${
                  p.type === "hotel"
                    ? "bg-gradient-to-tr from-amber-500 to-yellow-300 ring-2 ring-yellow-300"
                    : "bg-gradient-to-tr from-sky-500 to-indigo-600 ring-2 ring-sky-300"
                }`}
              >
                {p.type === "hotel" ? "🏨" : p.day ? `D${p.day}` : i + 1}
              </div>
              <span className={`absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 animate-ping rounded-full opacity-75 ${
                p.type === "hotel" ? "bg-amber-400" : "bg-sky-400"
              }`} />
            </div>
          </div>
        );
      })}

      {/* Selected Place Popup Card */}
      {selectedPin !== null && pins[selectedPin] && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[90%] w-96 rounded-2xl bg-slate-900/90 p-4 text-white backdrop-blur border border-sky-500/40 shadow-2xl z-20 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-base text-sky-300 line-clamp-1">{pins[selectedPin].name}</h3>
            <span className="text-[10px] uppercase font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">
              {pins[selectedPin].type === "hotel" ? "Hotel" : `Day ${pins[selectedPin].day}`}
            </span>
          </div>
          {pins[selectedPin].address && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{pins[selectedPin].address}</p>
          )}
          {pins[selectedPin].details && (
            <p className="text-xs text-slate-300 mt-2 line-clamp-2">{pins[selectedPin].details}</p>
          )}
          <div className="mt-3 flex justify-between items-center text-xs">
            {pins[selectedPin].price && (
              <span className="text-emerald-400 font-semibold">{pins[selectedPin].price}</span>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pins[selectedPin].name)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
            >
              Open Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const GlobalMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const popupsRef = useRef<any[]>([]);
  const mapboxModuleRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const tourIndexRef = useRef(0);
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { tripDetailInfo, targetPlace } = useTripDetail();
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
  const hasToken = Boolean(accessToken);

  // Extract all pins (hotels + activities)
  const pins = useMemo(() => {
    const items: PinData[] = [];
    if (!tripDetailInfo) return items;

    tripDetailInfo?.hotels?.forEach((h) => {
      const lng = h?.geo_coordinates?.longitude;
      const lat = h?.geo_coordinates?.latitude;
      if (typeof lng === "number" && typeof lat === "number") {
        items.push({
          name: h.hotel_name,
          lng,
          lat,
          type: "hotel",
          address: h.hotel_address,
          price: h.price_per_night,
          details: h.description,
        });
      }
    });

    tripDetailInfo?.itinerary?.forEach((it: Itinerary) => {
      it.activities?.forEach((a: Activity, aIdx) => {
        const lng = a?.geo_coordinates?.longitude;
        const lat = a?.geo_coordinates?.latitude;
        if (typeof lng === "number" && typeof lat === "number") {
          items.push({
            name: a.place_name,
            lng,
            lat,
            type: "activity",
            day: it.day,
            activityIndex: aIdx + 1,
            address: a.place_address,
            price: a.ticket_pricing,
            time: a.best_time_to_visit,
            details: a.place_details,
          });
        }
      });
    });

    return items;
  }, [tripDetailInfo]);

  // Crazy 3D Cinematic Fly-In to coordinate
  const triggerCrazyFlyTo = useCallback(
    (coords: [number, number], zoom = 14.5, pitch = 65, bearing = 45, duration = 3000) => {
      const map = mapRef.current;
      if (!map) return;

      // Stage 1: High speed 3D swoop
      map.flyTo({
        center: coords,
        zoom,
        pitch,
        bearing,
        speed: 1.4,
        curve: 1.7,
        essential: true,
        duration,
        easing: (t: number) => t * (2 - t),
      });
    },
    [],
  );

  // Initialize Mapbox with 3D Globe projection & Atmosphere
  useEffect(() => {
    if (!hasToken) return;
    if (initializedRef.current) return;
    if (!mapContainerRef.current) return;

    let cancelled = false;
    let Cleanup: (() => void) | undefined;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxModuleRef.current = mapboxgl;
      if (cancelled || !mapContainerRef.current) return;

      initializedRef.current = true;
      (mapboxgl as any).accessToken = accessToken;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [2.3522, 48.8566],
        zoom: 1.5,
        pitch: 0,
        bearing: 0,
        projection: "globe",
        interactive: true,
      });

      mapRef.current = map;

      map.on("style.load", () => {
        // Set starry atmosphere & space glow
        map.setFog({
          color: "rgb(15, 23, 42)",
          "high-color": "rgb(30, 41, 59)",
          "horizon-blend": 0.2,
          "space-color": "rgb(2, 6, 23)",
          "star-intensity": 0.8,
        });

        // Add 3D Building Extrusions for crazy 3D depth
        const layers = map.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer: any) => layer.type === "symbol" && layer.layout?.["text-field"],
        )?.id;

        if (!map.getSource("composite")) return;

        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 12,
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["get", "height"],
                0,
                "#1e293b",
                50,
                "#334155",
                100,
                "#0284c7",
              ],
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.8,
            },
          },
          labelLayerId,
        );
      });

      Cleanup = () => {
        markersRef.current.forEach((m: any) => m.remove());
        markersRef.current = [];
        popupsRef.current.forEach((p: any) => p.remove());
        popupsRef.current = [];
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        initializedRef.current = false;
      };
    })();

    return () => {
      cancelled = true;
      if (Cleanup) Cleanup();
    };
  }, [hasToken, accessToken]);

  // Update Markers, Route Trail, and Trigger Cinematic Fly-In when Trip Details Awake
  useEffect(() => {
    if (!hasToken || !mapRef.current || pins.length === 0) return;

    const map = mapRef.current;
    const mapboxgl = mapboxModuleRef.current;
    if (!mapboxgl) return;

    // Clear old markers & popups
    markersRef.current.forEach((m: any) => m.remove());
    markersRef.current = [];
    popupsRef.current.forEach((p: any) => p.remove());
    popupsRef.current = [];

    // Calculate center coordinates
    const coordinates = pins.map((p) => [p.lng, p.lat] as [number, number]);
    const avgLng = coordinates.reduce((a, b) => a + b[0], 0) / coordinates.length;
    const avgLat = coordinates.reduce((a, b) => a + b[1], 0) / coordinates.length;
    const centerPoint: [number, number] = [avgLng, avgLat];

    // Create Custom Animated Neon Marker Elements
    pins.forEach((pin, i) => {
      const el = document.createElement("div");
      el.className = "group relative cursor-pointer z-10";

      const isHotel = pin.type === "hotel";
      const iconText = isHotel ? "🏨" : pin.day ? `D${pin.day}` : `${i + 1}`;
      const bgGradient = isHotel
        ? "background: linear-gradient(135deg, #f59e0b, #fbbf24);"
        : "background: linear-gradient(135deg, #0ea5e9, #6366f1);";

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <div style="width: 38px; height: 38px; border-radius: 9999px; ${bgGradient} display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px; box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.5), 0 0 15px ${isHotel ? "rgba(245, 158, 11, 0.6)" : "rgba(14, 165, 233, 0.6)"}; border: 2px solid white;">
            ${iconText}
          </div>
          <div style="position: absolute; top: -4px; width: 12px; height: 12px; border-radius: 9999px; background: ${isHotel ? "#fbbf24" : "#38bdf8"}; opacity: 0.8; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        </div>
      `;

      // Interactive Popup
      const popupContent = `
        <div style="padding: 10px; font-family: ui-sans-serif, system-ui; max-width: 240px; color: #0f172a;">
          <div style="font-size: 10px; font-weight: 800; color: ${isHotel ? "#d97706" : "#0284c7"}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
            ${isHotel ? "⭐ Recommended Hotel" : `Day ${pin.day} Activity #${pin.activityIndex}`}
          </div>
          <h4 style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0; color: #0f172a; line-height: 1.2;">${pin.name}</h4>
          ${pin.address ? `<p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">${pin.address}</p>` : ""}
          ${pin.details ? `<p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; line-height: 1.3;">${pin.details.slice(0, 100)}...</p>` : ""}
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: #059669;">${pin.price || ""}</span>
            <span style="font-size: 11px; color: #f59e0b; font-weight: 600;">${pin.time || ""}</span>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, maxWidth: "260px" }).setHTML(popupContent);
      popupsRef.current.push(popup);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => {
        triggerCrazyFlyTo([pin.lng, pin.lat], 15.5, 65, Math.floor(Math.random() * 60) - 30, 2000);
      });

      markersRef.current.push(marker);
    });

    // Add Glowing Neon Flight Trajectory Line String
    if (coordinates.length > 1) {
      const geojsonRoute = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      };

      if (map.getSource("trip-route")) {
        map.getSource("trip-route").setData(geojsonRoute);
      } else if (map.isStyleLoaded()) {
        map.addSource("trip-route", {
          type: "geojson",
          data: geojsonRoute,
        });

        // Outer glow
        map.addLayer({
          id: "route-glow",
          type: "line",
          source: "trip-route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#38bdf8",
            "line-width": 8,
            "line-opacity": 0.4,
            "line-blur": 4,
          },
        });

        // Core pulsating neon line
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "trip-route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#06b6d4",
            "line-width": 3.5,
            "line-dasharray": [2, 1],
          },
        });
      }
    }

    // CRAZY ANIMATION 1: Initial Globe-to-City Hyper-Speed Dive
    const timer = setTimeout(() => {
      triggerCrazyFlyTo(centerPoint, 13.8, 65, 35, 3500);
      // Auto open first marker popup after arriving
      setTimeout(() => {
        if (markersRef.current[0]) {
          markersRef.current[0].togglePopup();
        }
      }, 3600);
    }, 400);

    return () => clearTimeout(timer);
  }, [pins, hasToken, triggerCrazyFlyTo]);

  // CRAZY ANIMATION 2: Focus Target Place from Itinerary Click
  useEffect(() => {
    if (!targetPlace || !mapRef.current) return;
    const { lng, lat } = targetPlace;
    if (typeof lng === "number" && typeof lat === "number") {
      triggerCrazyFlyTo([lng, lat], 16, 68, Math.floor(Math.random() * 80) - 40, 2200);

      // Open matching popup
      const matchingIdx = pins.findIndex((p) => p.name === targetPlace.name);
      if (matchingIdx !== -1 && markersRef.current[matchingIdx]) {
        setTimeout(() => {
          markersRef.current[matchingIdx].togglePopup();
        }, 2300);
      }
    }
  }, [targetPlace, pins, triggerCrazyFlyTo]);

  // CRAZY ANIMATION 3: 3D Tour Mode (Cinematic Sequential Fly-Through)
  const toggleTour = () => {
    if (isPlayingTour) {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
      setIsPlayingTour(false);
      return;
    }

    if (pins.length === 0 || !mapRef.current) return;
    setIsPlayingTour(true);
    tourIndexRef.current = 0;

    const playNextStop = () => {
      const curIndex = tourIndexRef.current;
      const targetPin = pins[curIndex];

      if (targetPin) {
        triggerCrazyFlyTo(
          [targetPin.lng, targetPin.lat],
          15.8,
          65,
          (curIndex * 45) % 360,
          2500,
        );

        setTimeout(() => {
          if (markersRef.current[curIndex]) {
            markersRef.current[curIndex].togglePopup();
          }
        }, 2600);
      }

      tourIndexRef.current = (curIndex + 1) % pins.length;
    };

    playNextStop();
    tourTimerRef.current = setInterval(playNextStop, 5500);
  };

  useEffect(() => {
    return () => {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    };
  }, []);

  if (!hasToken) return <FallbackMap />;

  return (
    <div className="relative w-full h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating HUD Controls Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-full bg-slate-900/80 p-1.5 backdrop-blur-md border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white">
          <Globe className="h-4 w-4 text-sky-400" />
          <span>{tripDetailInfo?.destination ?? "Live 3D Map"}</span>
        </div>

        {/* 3D Fly-Through Tour Button */}
        {pins.length > 0 && (
          <button
            onClick={toggleTour}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition shadow-lg ${
              isPlayingTour
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:opacity-90"
            }`}
          >
            {isPlayingTour ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlayingTour ? "Pause Tour" : "🎬 3D Fly Tour"}</span>
          </button>
        )}

        {/* Reset / Overview Button */}
        {pins.length > 0 && (
          <button
            onClick={() => {
              if (pins.length > 0) {
                const avgLng = pins.reduce((a, b) => a + b.lng, 0) / pins.length;
                const avgLat = pins.reduce((a, b) => a + b.lat, 0) / pins.length;
                triggerCrazyFlyTo([avgLng, avgLat], 13.5, 60, 20, 2500);
              }
            }}
            className="flex items-center gap-1 rounded-full bg-slate-800/90 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-200 transition"
            title="Reset 3D Overview"
          >
            <Compass className="h-3.5 w-3.5 text-sky-400" />
          </button>
        )}
      </div>

      {/* Bottom Summary Pill */}
      {pins.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[90%] flex items-center gap-2 rounded-full bg-slate-900/85 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur border border-slate-700/60 shadow-lg">
          <Navigation className="h-3.5 w-3.5 text-sky-400 animate-bounce" />
          <span className="text-white font-bold">{pins.length} Stops Connected</span>
          <span className="hidden sm:inline text-slate-400">· Click any pin or card to fly in 3D</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(GlobalMap);