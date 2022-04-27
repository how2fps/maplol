import "leaflet-boundary-canvas";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import React, { component, useEffect, useState } from "react";
import { MapContainer, Marker, Tooltip } from "react-leaflet";
import { useHistory, useLocation } from "react-router-dom";
import Select from "react-select";

import { SCHOOL_DUMMY_LIST } from "./Map";
import singaporeGSON from "./SingaporeGSON.json";

export default function SingaporeMap() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const position = [1.352083, 103.819839]; //center of SG
  const [map, setMap] = useState(null);
  const history = useHistory();
  const { state } = useLocation();

  useEffect(() => {
    setSchools(SCHOOL_DUMMY_LIST);
    if (!map) return;
    const fetchGeoJSON = async () => {
      const osm = L.TileLayer.boundaryCanvas(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          //this boundary is to cut the map to only show singapore, disabled
          //because the cut is not accurate and clean
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

    console.log(state);
    //to search the school after redirected from floorplan
    if (state) onSearchHandler(state.state);
    window.history.replaceState({}, document.title);
  }, [map]);

  const toDetailsHandler = (schoolName, school, e) => {
    console.log(e);
    history.push(`/DeviceManagement/${schoolName}`, {
      state: {
        value: school.latLng,
        label: school.name,
      },
    });
  };

  const onSearchHandler = (e) => {
    //close popup before panning because there's
    //weird interaction if popup is open and it pans to another place
    map.closePopup();
    setSelectedSchool(e);
    let latLng;
    if (e.value) latLng = e.value;
    else latLng = e;
    map.flyTo(latLng, 15);

    //flyTo can be laggy, code below instantly pans without animation
    // var markerBounds = L.latLngBounds([latLng]);
    // map.fitBounds([[0, 0]]); //to reset map or close by schools fitBounds act weird
    // map.fitBounds(markerBounds);
  };

  return (
    <div style={{ display: "flex", flex: "row", width: "100%" }}>
      <div style={{ padding: "20px", width: "40%" }}>
        <h2>Schools</h2>
        <Select
          style={{ width: "100%" }}
          options={schools.map((school) => {
            return { value: school.latLng, label: school.name };
          })}
          onChange={(e) => onSearchHandler(e)}
          value={selectedSchool}
          menuIsOpen
          minMenuHeight={"10vh"}
          maxMenuHeight={"40vh"}
        />
      </div>
      <button onClick={() => history.push(`/DeviceManagement/hi`)}>yo</button>
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
            eventHandlers={{
              click: () => history.push(`/DeviceManagement/${school.name}`),
            }}
            key={index}
            position={school.latLng}
            icon={
              new L.Icon({
                iconUrl: markerIconPng,
                iconSize: [30, 46],
                iconAnchor: [15, 46],
              })
            }>
            <Tooltip direction="bottom" opacity={1} permanent>
              {school.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
