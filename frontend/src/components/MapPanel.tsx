import { useState, useEffect } from "react";
import Map from "./Map";

export default function MapPanel() {
  const [gps, setGps] = useState<any>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setGps({
        lat: 41.123 + Math.random() * 0.001,
        lon: 19.812 + Math.random() * 0.001,
        heading: Math.random() * 360,
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Map gps={gps} tilesAvailable={true} />
    </div>
  );
}
