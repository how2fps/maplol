import "leaflet/dist/leaflet.css";

import { CRS, Icon, LatLngBounds } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Marker, Popup, useMapEvents } from "react-leaflet";

function MyComponent() {
  useMapEvents({
    click: (e) => {
      console.log(e.latlng);
    },
  });
  return null;
}

const Map = () => {
  const DUMMY_LIST = [
    { Type: "Light Sensor", Longtitude: 250, Latitude: 250 },
    { Type: "Fire Sensor", Longtitude: 0, Latitude: 0 },
  ];
  const [initialPosition, setInitialPosition] = useState([0, 0]);
  const [selectedPosition, setSelectedPosition] = useState([0, 0]);
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [amountOfFloors, setAmountOfFloors] = useState(0);
  const [selectedFloor, setSelectedFloor] = useState(1);

  useEffect(() => {
    setAmountOfFloors(5);
  }, []);

  useEffect(() => {
    const img = new Image();
    const imgSrc = process.env.PUBLIC_URL + `/RVPS - FP0${selectedFloor}.png`;
    img.src = imgSrc;
    setImageWidth(img.width);
    setImageHeight(img.height);
    setImageSrc(imgSrc);
  }, [selectedFloor]);

  useEffect(() => {}, [imageSrc]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

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
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div style={{ height: "100vh", width: "40%" }}>
        <h2>Controls</h2>
        <form>
          <select name="" id="" onChange={onFloorChange}>
            {FloorControls.map((x) => x)}
          </select>
        </form>
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
        }>
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
