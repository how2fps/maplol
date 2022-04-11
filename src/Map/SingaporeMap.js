import "leaflet-boundary-canvas";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import React, { useEffect, useState } from "react";
import { MapContainer } from "react-leaflet";

import singaporeGSON from "./SGPGSON.json";

const DUMMY_LIST = [
  { id: 1, name: "Rivervale Primary School" },
  { id: 2, name: "St Hilda's Secondary School" },
  { id: 3, name: "Temasek Polytechnic" },
  { id: 4, name: "Admiralty Secondary School" },
];

export default function SingaporeMap() {
  const [schools, setSchools] = useState([]);
  const [schoolsFiltered, setSchoolsFiltered] = useState([]);
  const position = [1.352083, 103.819839];
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!map) return;
    const fetchGeoJSON = async () => {
      const osm = L.TileLayer.boundaryCanvas(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          boundary: singaporeGSON,
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, UK shape <a href="https://github.com/johan/world.geo.json">johan/word.geo.json</a>',
        }
      );
      map.addLayer(osm);
      const sgLayer = L.geoJSON(singaporeGSON);
      map.fitBounds(sgLayer.getBounds());
    };
    fetchGeoJSON();
  }, [map]);

  useEffect(() => {
    setSchools(DUMMY_LIST);
  }, []);

  const onSearchHandler = (e) => {
    const searchValue = e.target.value;
    setSchoolsFiltered([
      ...schools.filter((x) => x.name.toLowerCase().includes(searchValue)),
    ]);
  };
  return (
    <div style={{ display: "flex", flex: "row" }}>
      <div>
        <form action="">
          <input type="text" onChange={onSearchHandler} />
        </form>
        {schoolsFiltered.map((school) => {
          return <div key={school.id}>{school.name}</div>;
        })}
      </div>
      <MapContainer
        center={position}
        maxZoom={18}
        minZoom={11}
        zoom={11}
        style={{
          height: "100vh",
          width: "60%",
          background: "white",
          border: "2px solid black",
        }}
        whenCreated={setMap}
        maxBounds={L.geoJSON(singaporeGSON).getBounds()}
        maxBoundsViscosity={0.7}></MapContainer>
      {/* <TileLayer
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
      {/* </MapContainer> */}
    </div>
  );
}
