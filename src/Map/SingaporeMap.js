import "leaflet-boundary-canvas";
import "leaflet/dist/leaflet.css";

import L, { latLng } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import singaporeGSON from "./SingaporeGSON.json";

const DUMMY_LIST = [
  {
    id: 1,
    name: "Rivervale Primary School",
    latLng: [1.3933354326156981, 103.90432935346726],
  },
  {
    id: 2,
    name: "St Hilda's Secondary School",
    latLng: [1.350392486863309, 103.9361580344195],
  },
  {
    id: 3,
    name: "Temasek Polytechnic",
    latLng: [1.3454239941475783, 103.93249097861609],
  },
  {
    id: 4,
    name: "Admiralty Secondary School",
    latLng: [1.4466534139615155, 103.80259746881106],
  },
];

export default function SingaporeMap() {
  const [schools, setSchools] = useState([]);
  const position = [1.352083, 103.819839]; //center of SG
  const [map, setMap] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSchools(DUMMY_LIST);
  }, []);

  useEffect(() => {
    if (!map) return;
    const fetchGeoJSON = async () => {
      const osm = L.TileLayer.boundaryCanvas(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          boundary: singaporeGSON,
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
        }
      );
      map.addLayer(osm);
      const sgLayer = L.geoJSON(singaporeGSON);
      map.fitBounds(sgLayer.getBounds());
    };
    fetchGeoJSON();
  }, [map]);

  // const onSearchHandler = (e) => {
  //   e.preventDefault();
  //   const searchValue = e.target.value;
  //   console.log(searchValue);
  //   setSchoolsFiltered([
  //     ...schools.filter((x) => x.name.toLowerCase().includes(searchValue)),
  //   ]);
  // };
  const toDetailsHandler = (schoolName) => {
    navigate(schoolName);
  };

  const onSearchHandler = (e) => {
    var latLng = e.value;
    var markerBounds = L.latLngBounds([latLng]);
    map.fitBounds([[0, 0]]); //to reset map or close by schools fitBounds act weird
    map.fitBounds(markerBounds);
    // var latlngPoint = new L.LatLng(
    //   parseFloat(latLng[0]),
    //   parseFloat(latLng[1])
    // );
    // L.popup().setLatLng(latlngPoint).setContent(popupContent(e)).openOn(map);
  };

  return (
    <div style={{ display: "flex", flex: "row", width: "100%" }}>
      <div style={{ padding: "20px", width: "40%" }}>
        {/* <form onSubmit={onSearchHandler}>
          <input type="text" onChange={onSearchHandler} />
        </form>
        {schoolsFiltered.map((school) => {
          return (
            <div
              onClick={onClickHandler}
              style={{ border: "2px solid black", cursor: "pointer" }}
              key={school.id}>
              {school.name}
            </div>
          );
        })} */}
        <Select
          style={{ width: "100%" }}
          options={schools.map((school) => {
            return { value: school.latLng, label: school.name };
          })}
          onChange={onSearchHandler}
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
        {DUMMY_LIST.map((x, index) => (
          <Marker
            key={index}
            position={x.latLng}
            icon={
              new L.Icon({
                iconUrl: markerIconPng,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }>
            <Popup>
              {x.name} <br></br>
              <button
                onClick={() => toDetailsHandler(x.name.split(" ").join(""))}>
                More Info
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
