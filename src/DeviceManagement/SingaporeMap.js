import "leaflet-boundary-canvas";
import "leaflet/dist/leaflet.css";

import { Icon } from "@material-ui/core";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Tooltip } from "react-leaflet";
import { useHistory, useLocation } from "react-router-dom";
import Select, { components } from "react-select";

import singaporeGSON from "./SingaporeGSON.json";
import { Header1, MainContainer, SchoolBox } from "./styled";

const SCHOOL_DUMMY_LIST = [
  {
    id: 1,
    name: "Rivervale's Secondary School",
    latLng: [1.3931973396927921, 103.9043809859905],
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
  {
    id: 5,
    name: "Jurong Primary School",
    latLng: [1.3486575472899138, 103.73291689579524],
  },
];

export default function SingaporeMap() {
  const { Option } = components;
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const position = [1.352083, 103.819839]; //center of SG
  const [map, setMap] = useState(null);
  const history = useHistory();
  const { state } = useLocation();

  const IconOption = (props) => (
    <Option {...props}>
      <Icon fontSize="large">apartment</Icon>
      {props.data.label}
    </Option>
  );

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

  const toDetailsHandler = (school) => {
    console.log(school);
    history.push(`/DeviceManagement/${school.name}`, {
      state: {
        value: school.latLng,
        label: school.name,
      },
    });
  };

  const onSearchHandler = (e) => {
    console.log(e);
    //close popup before panning because there's
    //weird interaction if popup is open and it pans to another place
    map.closePopup();
    setSelectedSchool(e);
    let latLng;
    if (e.value) latLng = e.value;
    else latLng = e;
    map.flyTo(latLng, 18, {
      animate: true,
      duration: 2,
    });

    //flyTo can be laggy, code below instantly pans without animation
    // var markerBounds = L.latLngBounds([latLng]);
    // map.fitBounds([[0, 0]]); //to reset map or close by schools fitBounds act weird
    // map.fitBounds(markerBounds);
  };

  return (
    <MainContainer>
      <div style={{ display: "flex", flex: "row", width: "100%" }}>
        <div style={{ padding: "20px", width: "30%" }}>
          <Header1>List of Schools</Header1>
          <Select
            style={{ width: "100%", color: "black" }}
            options={schools.map((school) => {
              return { value: school.latLng, label: school.name };
            })}
            onChange={(e) => onSearchHandler(e)}
            value={selectedSchool}
            minMenuHeight={"10vh"}
            maxMenuHeight={"40vh"}
            defaultMenuIsOpen
            menuIsOpen
            components={{
              Option: IconOption,
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            placeholder="Search for a school..."
            styles={{
              control: (provided, state) => ({
                ...provided,
                cursor: "text",
                fontSize: "18px",
              }),
              menuList: (provided, state) => ({
                ...provided,
                padding: "0",
                background: "#121524",
              }),
              option: (provided, state) => ({
                ...provided,
                cursor: "pointer",
                padding: "0.5rem",
                marginBottom: "0.2rem",
                fontSize: "1.2rem",
                border: "1px solid #676977",
                userSelect: "none",
                display: "flex",
                background: "#121524",
              }),
            }}
          />
        </div>
        <MapContainer
          center={position}
          maxZoom={18}
          minZoom={11}
          zoom={11}
          style={{
            height: "90vh",
            width: "70%",
            background: "white",
            border: "2px solid black",
          }}
          zoomControl={false}
          whenCreated={setMap}
          maxBounds={L.geoJSON(singaporeGSON).getBounds()}
          maxBoundsViscosity={0.2}>
          {SCHOOL_DUMMY_LIST.map((school, index) => (
            <Marker
              eventHandlers={{
                click: () => toDetailsHandler(school),
              }}
              key={index}
              position={school.latLng}
              icon={
                new L.Icon({
                  iconUrl: markerIconPng,
                  iconSize: [25, 41],
                  iconAnchor: [12.5, 41],
                })
              }>
              <Tooltip direction="bottom" opacity={1} permanent>
                {school.name}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </MainContainer>
  );
}
