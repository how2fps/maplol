import "leaflet/dist/leaflet.css";
import "react-sortable-tree/style.css";

import L, { CRS, Icon, LatLngBounds } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Marker, Popup, Rectangle, useMapEvents } from "react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

import { computeToPixels } from "./computeToPixels";
import DeviceManagement from "./JSONFile";
import data from "./rivervale.json";

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
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [amountOfFloors, setAmountOfFloors] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zonesList, setZonesList] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    setSchools(SCHOOL_DUMMY_LIST);
    setSchoolData(data);
    const arrayOfDifferentBuildings = data[0].ns0__islocationof;
    // const updatedListOfZones = listOfZones.map((x) => {
    //   const updatedCoordinates = computeToPixels({
    //     lat: x.lat,
    //     long: x.long,
    //   });
    //   x.lat = updatedCoordinates[0];
    //   x.long = updatedCoordinates[1];
    //   return x;
    // });
    // setZonesList(updatedListOfZones);

    //

    // const list = [
    //   { name: "Test 1", long: 103.904698, lat: 1.393119 },
    //   { name: "Test 2", long: 103.904764, lat: 1.392965 },
    // ].map((x) => {
    //   const updatedCoordinates = computeToPixels({
    //     lat: x.lat,
    //     long: x.long,
    //   });
    //   // console.log(updatedCoordinates);
    //   x.lat = updatedCoordinates[0];
    //   x.long = updatedCoordinates[1];
    //   return x;
    // });
    // setZonesList(list);

    //

    const floorBuildings = arrayOfDifferentBuildings
      .map((x) => {
        if (x.ns0__islocationof) {
          return x.ns0__islocationof;
        }
      })
      .filter((x) => x !== undefined);

    const lengths = floorBuildings.map((a) => a.length);
    setAmountOfFloors(Math.max(...lengths));
    if (state) {
      setSelectedSchool(state);
    }
    window.history.replaceState({}, document.title);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    //Main useEffect to find out all the different zones each floor with updated coords
    //and the devices each zones have
    const arrayOfDifferentBuildings = data[0].ns0__islocationof;
    const floorBuildings = arrayOfDifferentBuildings.map((x) => {
      if (x.ns0__islocationof) {
        return x.ns0__islocationof.filter((y) => {
          return y.uri.includes(`floor_${selectedFloor}`);
        });
      }
    });
    const filteredUndefineFloorBuilding = floorBuildings.filter(
      (x) => x !== undefined
    );
    let floorBuildingsFixed = filteredUndefineFloorBuilding.map((x) => x[0]);

    let roomsOnFloor = floorBuildingsFixed.map((x) => {
      if (x.ns0__islocationof) {
        return x.ns0__islocationof[0].ns0__islocationof;
      }
    });
    roomsOnFloor = roomsOnFloor.filter((x) => x !== undefined);
    roomsOnFloor = roomsOnFloor.flat();

    const locationObjects = roomsOnFloor.map((x) => {
      const locationObject = JSON.parse(
        x.ns0__hasassociatedtag[0].ns0__hasValue[0].split("'").join('"')
      );
      locationObject.title = x.uri;

      //fixing json for devices
      if (map !== null) {
        locationObject.devices = x.ns0__haslocation.map((device) => {
          device.description = JSON.parse(
            device.ns0__hasTag[0].split("'").join('"')
          );
          device.description = device.description.Description;
          device.location = JSON.parse(
            device.ns0__hasassociatedtag[0].ns0__hasValue[0]
              .split("'")
              .join('"')
          );
          // console.log(device);
          return device;
        });
      }
      return locationObject;
    });

    const updatedCoordsObjects = locationObjects.map((x) => {
      const updatedUpperLeftCoords = computeToPixels({
        long: x.UpperLeftLong,
        lat: x.UpperLeftLat,
      });
      x.UpperLeftLat = updatedUpperLeftCoords[0];
      x.UpperLeftLong = updatedUpperLeftCoords[1];
      const updatedBottomRightCoords = computeToPixels({
        long: x.BottomRightLong,
        lat: x.BottomRightLat,
      });
      x.BottomRightLat = updatedBottomRightCoords[0];
      x.BottomRightLong = updatedBottomRightCoords[1];
      let newTitle = x.title.split("/")[x.title.split("/").length - 1];
      newTitle = newTitle.replaceAll("_", " ");
      x.title = newTitle;
      return x;
    });

    console.log(updatedCoordsObjects);
    // updatedCoordsObjects.map((x) => {
    //   if (map) {
    //     L.rectangle([
    //       [x.UpperLeftLat, x.UpperLeftLong],
    //       [x.BottomRightLat, x.BottomRightLong],
    //       { color: "Red", weight: 1 },
    //     ]).addTo(map);
    //   }
    // });
    setZonesList(updatedCoordsObjects);
  }, [selectedFloor]);

  useEffect(() => {
    const img = new Image();
    // const imgSrc = process.env.PUBLIC_URL + `/RVPS - FP0${selectedFloor}.png`;
    const imgSrc =
      process.env.PUBLIC_URL + `/rvv-floor${selectedFloor}_rotated.png`;
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
    // window.history.replaceState({}, document.title);
  }, [selectedFloor]);

  const onSearchHandler = (e) => {
    navigate("../DeviceManagement", { state: e });
  };

  const onFloorChange = (e) => {
    setSelectedFloor(e.value.key);
  };

  const plotMarkerOnClick = (ulLat, ulLong, blLat, blLong) => {
    const newUpperCoords = computeToPixels({ lat: ulLat, long: ulLong });
    const newBottomCoords = computeToPixels({ lat: blLat, long: blLong });
    L.rectangle([
      newUpperCoords,
      newBottomCoords,
      { color: "Red", weight: 1 },
    ]).addTo(map);
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
    <>
      {!isLoading && schoolData && zonesList ? (
        <div style={{ display: "flex", flex: "row", width: "100%" }}>
          <div style={{ padding: "20px", width: "40%" }}>
            <h1>Schools</h1>
            <Select
              style={{ width: "100%" }}
              options={schools.map((school) => {
                return { value: school.latLng, label: school.name };
              })}
              onChange={onSearchHandler}
              value={selectedSchool}
              isOptionSelected={true}
            />
            <h2>Floors</h2>
            <Select
              style={{ width: "100%" }}
              options={FloorControls.map((floor) => {
                return { value: floor, label: floor };
              })}
              defaultValue={
                FloorControls.map((floor) => {
                  return { value: floor, label: floor };
                })[0]
              }
              onChange={onFloorChange}
              isOptionSelected={true}
            />
            <h2 style={{ marginTop: "20px" }}>Locations and Devices</h2>
            <DeviceManagement
              plotMarkerOnClick={plotMarkerOnClick}
              selectedFloor={selectedFloor}
              schoolData={schoolData}
            />
          </div>
          <MapContainer
            maxZoom={7}
            zoom={1}
            minZoom={1}
            crs={CRS.Simple}
            center={[0, 0]}
            style={{
              height: "90vh",
              width: "60%",
              background: "grey",
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
            {zonesList.map((x, index) => {
              return (
                <Rectangle
                  key={index}
                  bounds={[
                    [x.UpperLeftLat, x.UpperLeftLong],
                    [x.BottomRightLat, x.BottomRightLong],
                  ]}
                />
              );
            })}

            <MyComponent />
            {zonesList.map((x, index) => (
              <Marker
                key={index}
                position={[
                  (x.UpperLeftLat + x.BottomRightLat) / 2,
                  (x.BottomRightLong + x.UpperLeftLong) / 2,
                ]}
                icon={
                  new Icon({
                    iconUrl: markerIconPng,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })
                }>
                <Popup>
                  {x.title} <br></br>
                  <button>More Info</button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};
export default Map;
