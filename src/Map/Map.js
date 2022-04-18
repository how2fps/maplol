import "leaflet/dist/leaflet.css";
import "react-sortable-tree/style.css";

import L, { CRS, Icon, LatLngBounds } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

import DeviceManagement from "./JSONFile";
import RivervaleJSON from "./rivervale.json";

export const SCHOOL_DUMMY_LIST = [
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
  {
    id: 5,
    name: "Jurong Primary School",
    latLng: [1.3486575472899138, 103.73291689579524],
  },
];

const DUMMY_LIST = [
  { Type: "Light Sensor", Longtitude: 250, Latitude: 250 },
  { Type: "Fire Sensor", Longtitude: 0, Latitude: 0 },
];

function MyComponent() {
  useMapEvents({
    click: (e) => {
      console.log(e.latlng);
    },
  });
  return null;
}

const Map = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [map, setMap] = useState(null);
  const [json, setJson] = useState(RivervaleJSON);
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [amountOfFloors, setAmountOfFloors] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    console.log(RivervaleJSON);
    setSchools(SCHOOL_DUMMY_LIST);
    setAmountOfFloors(5);
    if (state) {
      console.log(state);
      setSelectedSchool(state);
    }
    window.history.replaceState({}, document.title);
  }, []);

  useEffect(() => {
    const img = new Image();
    const imgSrc = process.env.PUBLIC_URL + `/RVPS - FP0${selectedFloor}.png`;
    img.src = imgSrc;
    setImageWidth(img.width);
    setImageHeight(img.height);
    setImageSrc(imgSrc);
    if (!map) return;
    const fetchGeoJSON = async () => {
      // const osm = L.TileLayer.boundaryCanvas();
      L.map.imageSrc = imgSrc;
    };

    fetchGeoJSON();
    // if (state) onSearchHandler(state);
    window.history.replaceState({}, document.title);
  }, [selectedFloor]);

  const onSearchHandler = (e) => {
    navigate("../DeviceManagement", { state: e });
  };

  const onFloorChange = (e) => {
    setSelectedFloor(e.target.value);
  };

  let FloorControls = [];
  for (var i = 1; i <= amountOfFloors; i++) {
    FloorControls.push(
      <option key={i} value={i}>
        Floor {i}
      </option>
    );
  }

  const plotMarkerOnClick = (ulLat, ulLong, blLat, blLong) => {
    L.rectangle([
      [ulLat, ulLong],
      [blLat, blLong],
      { color: "Red", weight: 1 },
    ]).addTo(map);
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
          isOptionSelected={true}
        />
        <h2>Controls</h2>
        <form>
          <select name="" id="" onChange={onFloorChange}>
            {FloorControls.map((x) => x)}
          </select>
        </form>
        <DeviceManagement
          plotMarkerOnClick={plotMarkerOnClick}
          selectedFloor={selectedFloor}
        />
      </div>
      <MapContainer
        maxZoom={7}
        minZoom={0.5}
        zoom={1}
        crs={CRS.Simple}
        center={[0, 0]}
        style={{
          height: "100vh",
          width: "60%",
          background: "white",
          border: "2px solid black",
        }}
        maxBounds={
          new LatLngBounds([
            [0, 500],
            [500, 0],
          ])
        }
        whenCreated={setMap}>
        <ImageOverlay
          url={imageSrc}
          bounds={[
            [500, 0],
            [0, 500],
          ]}
          center={[0, 0]}
          style={{ background: "white", border: "2px solid black" }}
        />
        <MyComponent />
        {DUMMY_LIST.map((x, index) => (
          <Marker
            key={index}
            position={[x.Longtitude, x.Latitude]}
            icon={
              new Icon({
                iconUrl: markerIconPng,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }>
            <Popup>
              {x.Type} <br></br>
              <button>More Info</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
export default Map;
