import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const center = [12.9716, 77.5946];

const CAMPUS_BOUNDARY = [
  [12.9824, 77.5868],
  [12.9841, 77.5906],
  [12.9850, 77.5942],
  [12.9846, 77.5988],
  [12.9830, 77.6034],
  [12.9805, 77.6072],
  [12.9771, 77.6095],
  [12.9729, 77.6101],
  [12.9684, 77.6092],
  [12.9649, 77.6070],
  [12.9627, 77.6031],
  [12.9616, 77.5984],
  [12.9620, 77.5938],
  [12.9636, 77.5896],
  [12.9666, 77.5869],
  [12.9702, 77.5854],
  [12.9746, 77.5851],
  [12.9786, 77.5859],
];

const solidIcon = (emoji, bg) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        font-size:22px;
        width:34px;
        height:34px;
        border-radius:50%;
        background:${bg};
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });

const POI_ICONS = {
  gate: solidIcon("🚪", "#4f46e5"),
  building: solidIcon("🏢", "#0284c7"),
  hostel: solidIcon("🛏️", "#16a34a"),
  food: solidIcon("🍽️", "#ea580c"),
  parking: solidIcon("🅿️", "#7c3aed"),
  xerox: solidIcon("🖨️", "#db2777"),
};

const SOS_ICON = solidIcon("🚨", "#dc2626");

function HeatLayer({ points, enabled }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length || !enabled) return;

    const heat = L.heatLayer(
      points.map(p => [
        p.coordinates[1],
        p.coordinates[0],
        1
      ]),
      { radius: 45, blur: 30 }
    );

    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points, enabled]);

  return null;
}

export default function CampusMapView({ pois = [] }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [sosList, setSosList] = useState([]);
  const [onlySOS, setOnlySOS] = useState(false);
  const [hideResolved, setHideResolved] = useState(true);

  async function fetchSOS() {
    const res = await api.get("/sos");
    setSosList(res.data || []);
  }

  useEffect(() => {
    fetchSOS();
  }, []);

  async function resolveSOS(id) {
    await api.patch(`/sos/${id}`, { status: "resolved" });
    fetchSOS();
  }

  const activeSOS = sosList.filter(
    s => !hideResolved || s.status === "active"
  );

  const showHeatmap =
    activeSOS.filter(s => s.status === "active").length >= 2;

  return (
    <div className="space-y-4">
    
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Campus Safety & Navigation Command Map
        </h2>

        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg border text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={onlySOS}
              onChange={() => setOnlySOS(!onlySOS)}
              className="accent-red-600"
            />
            Show only emergencies
          </label>

          <label className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg border text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={hideResolved}
              onChange={() => setHideResolved(!hideResolved)}
              className="accent-green-600"
            />
            Hide addressed emergencies
          </label>
        </div>
      </div>

      <div className="w-full h-[600px] rounded-xl overflow-hidden border shadow">
        <MapContainer center={center} zoom={14} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <Polygon
            positions={CAMPUS_BOUNDARY}
            pathOptions={{
              color: "#16a34a",
              fillColor: "#16a34a",
              fillOpacity: 0.06,
              weight: 3,
            }}
          />

          <HeatLayer
            enabled={showHeatmap}
            points={activeSOS.map(s => ({
              coordinates: s.location.coordinates
            }))}
          />
          {activeSOS.map(s => (
            <Marker
              key={s._id}
              position={[
                s.location.coordinates[1],
                s.location.coordinates[0]
              ]}
              icon={SOS_ICON}
            >
              <Popup>
                🚨 <b>{s.message || "Emergency SOS"}</b><br />
                Status: <b>{s.status}</b><br />
                {new Date(s.createdAt).toLocaleString()}

                {isAdmin && s.status === "active" && (
                  <div className="mt-2">
                    <button
                      onClick={() => resolveSOS(s._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}

          {!onlySOS &&
            pois.map(p => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={POI_ICONS[p.type]}
              >
                <Popup>
                  <b>{p.name}</b><br />
                  <span className="capitalize">{p.type}</span>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* 🧭 LEGEND PANEL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 text-sm">
        <Legend icon="🚪" label="Gate" color="#4f46e5" />
        <Legend icon="🏢" label="Building" color="#0284c7" />
        <Legend icon="🛏️" label="Hostel" color="#16a34a" />
        <Legend icon="🍽️" label="Canteen" color="#ea580c" />
        <Legend icon="🅿️" label="Parking" color="#7c3aed" />
        <Legend icon="🖨️" label="Xerox Shop" color="#db2777" />
        <Legend icon="🚨" label="Emergency SOS" color="#dc2626" />
      </div>
    </div>
  );
}

function Legend({ icon, label, color }) {
  return (
    <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 border">
      <span
        className="flex items-center justify-center w-7 h-7 rounded-full text-white shadow"
        style={{ background: color }}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
