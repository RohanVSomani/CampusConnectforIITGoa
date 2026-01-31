import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CampusMapView from "@/components/CampusMapView";

export default function CampusMap() {
  const [heatmap, setHeatmap] = useState({ points: [] });
  const [pois, setPois] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [hmRes, poisRes] = await Promise.all([
        api.get("/map/heatmap"),
        api.get("/map/pois")
      ]);
      setHeatmap(hmRes.data);
      setPois(poisRes.data);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Campus Smart Map</h1>
      <p className="text-muted-foreground">
        Live movement • SOS tracking • Smart navigation
      </p>

      <CampusMapView
        points={heatmap.points || []}
        pois={pois || []}
      />
    </div>
  );
}
