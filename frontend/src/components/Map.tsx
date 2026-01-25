import { useEffect, useRef, useState } from "react";
import maplibregl, { Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface GPSData {
  lat: number;
  lon: number;
  heading?: number | null;
}

interface MapProps {
  gps: GPSData | null;
  tilesAvailable?: boolean;
}

export default function Map({ gps, tilesAvailable = true }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const markerElementRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // 🚀 INITIALIZE MAP ONCE
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const style = tilesAvailable
      ? buildOnlineMapStyle()
      : buildGridOnlyStyle();

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: style as any,
      center: [0, 0],
      zoom: 15,
      attributionControl: false,
    });

    mapRef.current.on("load", () => {
      setMapReady(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [tilesAvailable]);


  // 🚀 CREATE MARKER ONLY ONCE
  useEffect(() => {
    if (!mapReady || !gps || markerRef.current) return;

    const container = createMarkerElement(gps.heading);
    markerElementRef.current = container;

    markerRef.current = new maplibregl.Marker({ element: container })
      .setLngLat([gps.lon, gps.lat])
      .addTo(mapRef.current!);
  }, [mapReady, gps]);


  // 🚀 UPDATE MARKER POSITION + ROTATION
  useEffect(() => {
    if (!gps || !markerRef.current || !markerElementRef.current) return;

    const { lat, lon, heading } = gps;

    // Update rotation
    const icon = markerElementRef.current?.querySelector(
      ".marker-icon"
    ) as HTMLElement | null;
    if (icon) {
      if (gps.heading != null) {
        icon.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;
      } else {
        icon.style.transform = `translate(-50%, -50%)`; // circle
      }
    }
    // Update marker position
    markerRef.current.setLngLat([lon, lat]);
  }, [gps]);


  // 🚀 GO TO MARKER BUTTON
  const goToMarker = () => {
    if (!gps || !mapRef.current) return;

    mapRef.current.flyTo({
      center: [gps.lon, gps.lat],
      zoom: 17,
      duration: 800,
    });
  };

  return (
    <>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", position: "relative" }}
      />
      <div style={{
        display: "grid",
        gap: "5px",
        position: "absolute",
        bottom: "20px",
        right: "15px",
        zIndex: 1,
      }}>
        {/* Go to marker button */}
        <button
          className="cursor-pointer"
          onClick={goToMarker}
          style={{ padding: "3px 3px", borderRadius: "8px", border: "none", background: "white", fontWeight: 600, boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}
        > 📍 </button>
        <button
          className="cursor-pointer"
          style={{ padding: "3px 3px", borderRadius: "8px", border: "none", background: "white", fontWeight: 600, boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}
        > 🧹 </button>
      </div>
    </>
  );
}

// 🎨 CUSTOM MARKER ELEMENT //
function createMarkerElement(heading?: number | null): HTMLDivElement {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = "20px";
  container.style.height = "20px";
  container.style.transform = "translate(-50%, -50%)"; // ALWAYS
  container.style.transformOrigin = "center center";

  const icon = document.createElement("div");
  icon.className = "marker-icon";

  if (heading == null) {
    // ROUND DOT
    icon.style.width = "18px";
    icon.style.height = "18px";
    icon.style.borderRadius = "50%";
    icon.style.background = "#00aaff";
    icon.style.border = "3px solid white";
    icon.style.boxShadow = "0 0 5px rgba(0,0,0,0.4)";
    icon.style.position = "absolute";
    icon.style.top = "50%";
    icon.style.left = "50%";
    icon.style.transform = "translate(-50%, -50%)"; // NO rotation
  } else {
    // ARROW / TRIANGLE
    icon.style.width = "0";
    icon.style.height = "0";
    icon.style.borderLeft = "10px solid transparent";
    icon.style.borderRight = "10px solid transparent";
    icon.style.borderBottom = "20px solid #ff4444";
    icon.style.position = "absolute";
    icon.style.top = "50%";
    icon.style.left = "50%";
    icon.style.transformOrigin = "center bottom";
    icon.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;
    icon.style.filter = "drop-shadow(0 1px 2px rgba(0,0,0,0.3))";
  }

  container.appendChild(icon);

  return container;
}

// MAP STYLES //
function buildOnlineMapStyle() {
  return {
    version: 8 as const,
    sources: {
      osmTiles: {
        type: "raster" as const,
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "osm-layer",
        type: "raster",
        source: "osmTiles",
        paint: {},
      },
    ],
  };
}


function buildGridOnlyStyle() {
  return {
    version: 8 as const,
    sources: {
      grid: {
        type: "raster",
        tiles: ["/fallback/grid.png"],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "grid-layer",
        type: "raster",
        source: "grid",
      },
    ],
  };
}
