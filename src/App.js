import "leaflet/dist/leaflet.css";

import { CRS, LatLngBounds, map, tileLayer } from "leaflet";
import { useEffect } from "react";
import {
  Circle,
  FeatureGroup,
  ImageOverlay,
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
} from "react-leaflet";

import Map from "./Map/Map";

function App() {
  return (
    <div>
      <div>Header</div>
      <Map />
    </div>
  );
}
export default App;
