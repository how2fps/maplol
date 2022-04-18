import "leaflet-boundary-canvas";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

import { SCHOOL_DUMMY_LIST } from "./Map";
import singaporeGSON from "./SingaporeGSON.json";

export default function SingaporeMap() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const position = [1.352083, 103.819839]; //center of SG
  const [map, setMap] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    setSchools(SCHOOL_DUMMY_LIST);
    if (!map) return;
    const fetchGeoJSON = async () => {
      const osm = L.TileLayer.boundaryCanvas(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          // boundary: singaporeGSON,
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
        }
      );
      map.addLayer(osm);
      const sgLayer = L.geoJSON(singaporeGSON);
      map.fitBounds(sgLayer.getBounds());
    };
    fetchGeoJSON();
    if (state) onSearchHandler(state);
    window.history.replaceState({}, document.title);
  }, [map]);

  const toDetailsHandler = (schoolName, school) => {
    navigate(schoolName, {
      state: {
        value: school.latLng,
        label: school.name,
      },
    });
  };

  const onSearchHandler = (e) => {
    map.closePopup();
    setSelectedSchool(e);
    var latLng = e.value;
    var markerBounds = L.latLngBounds([latLng]);
    map.flyTo(latLng, 15);
    // map.fitBounds([[0, 0]]); //to reset map or close by schools fitBounds act weird
    // map.fitBounds(markerBounds);
  };

  return (
    <div style={{ display: "flex", flex: "row", width: "100%" }}>
      <div style={{ padding: "20px", width: "40%" }}>
        <Select
          style={{ width: "100%" }}
          options={schools.map((school) => {
            return { value: school.latLng, label: school.name };
          })}
          onChange={onSearchHandler}
          value={selectedSchool}
          menuIsOpen
          minMenuHeight={"10vh"}
          maxMenuHeight={"40vh"}
        />
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
        maxBoundsViscosity={0.2}>
        {SCHOOL_DUMMY_LIST.map((school, index) => (
          <Marker
            key={index}
            position={school.latLng}
            icon={
              new L.Icon({
                iconUrl: markerIconPng,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }>
            <Popup>
              {school.name} <br></br>
              <button
                onClick={() =>
                  toDetailsHandler(school.name.split(" ").join(""), school)
                }>
                More Info
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
