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
const Controls = () => {
  useState();
  useEffect(() => {}, []);
  return (
    <div style={{ height: "100vh", width: "40%" }}>
      <h2>Controls</h2>
      <form>
        <select name="" id=""></select>
      </form>
    </div>
  );
};
const Map = () => {
  const DUMMY_LIST = [
    { Type: "Light Sensor", Longtitude: 250, Latitude: 250 },
    { Type: "Fire Sensor", Longtitude: 0, Latitude: 0 },
  ];
  const imgSrc = process.env.PUBLIC_URL + "/RVPS - FP01.png";
  const [initialPosition, setInitialPosition] = useState([0, 0]);
  const [selectedPosition, setSelectedPosition] = useState([0, 0]);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [amountOfFloors, setAmountOfFloors] = useState(0);

  useEffect(() => {
    //fetch db
    setAmountOfFloors(5);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = imgSrc;
    setImageWidth(img.width);
    setImageHeight(img.height);
  }, [imgSrc]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  // const Markers = () => {
  //   const map = useMapEvents({
  //     click(e) {
  //       setSelectedPosition([e.latlng.lat, e.latlng.lng]);
  //     },
  //   });

  //   return selectedPosition ? (
  //     <Marker
  //       key={selectedPosition[0]}
  //       position={selectedPosition}
  //       interactive={false}
  //     />
  //   ) : null;
  // };

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div style={{ height: "100vh", width: "40%" }}>
        <h2>Controls</h2>
        <form>
          <select name="" id="">
            {amountOfFloors.map(floorNumber => )}
          </select>
        </form>
      </div>
      <MapContainer
        maxZoom={7}
        minZoom={0.5}
        zoom={1}
        crs={CRS.Simple}
        center={[0, 0]}
        style={{ height: "100vh", width: "60%" }}
        maxBounds={
          new LatLngBounds([
            [0, 500],
            [500, 0],
          ])
        }>
        <ImageOverlay
          url={imgSrc}
          bounds={[
            [500, 0],
            [0, 500],
          ]}
          center={[0, 0]}
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
