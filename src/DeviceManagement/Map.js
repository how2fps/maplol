import "./Map.css";
import "antd/dist/antd.css";
import "leaflet/dist/leaflet.css";
import "react-sliding-side-panel/src/index.css";
import "react-sortable-tree/style.css";

import CloseIcon from "@mui/icons-material/Close";
import L, { LatLngBounds } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Marker, Rectangle, useMapEvents } from "react-leaflet";
import { useHistory, useLocation } from "react-router-dom";
import Select from "react-select";
import SlidingPanel from "react-sliding-side-panel";

import { computeToPixels } from "./computeToPixels";
import { useWindowSize } from "./hooks/useWindowSize";
import data from "./rivervale.json";
import SceneMain from "./SceneMain";
import { Button, Container, Controls, Header1, Header2, MainContainer, SidePaneDevice, SidePaneDeviceList } from "./styled";
import TreeView, { getTitleFromJSON } from "./TreeView";

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

//component that console.logs out latlng when map is clicked
//z-index issues if it is present so only turn it on when needed
function ShowCoordsOnClick() {
  useMapEvents({
    click: (e) => {
      console.log(e.latlng);
    },
  });
  return null;
}

const Map = () => {
  const mapSizePercentage = 0.6;
  const sidePaneSizePercentage = 0.3;
  // const sidePaneRef = useRef(null);
  // const mapRef = useRef(null);

  const history = useHistory();
  const { state } = useLocation();

  const windowSize = useWindowSize();
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState(null);
  const [imageHeight, setImageHeight] = useState(null);
  const [amountOfFloors, setAmountOfFloors] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedFloorInput, setSelectedFloorInput] = useState();
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [zonesList, setZonesList] = useState([]);
  const [deviceMarker, setDeviceMarker] = useState(null);
  //error happens if title isn't intialised at state, due to slider library possibly
  //rendering before it's actually opened?
  const [pane, setPane] = useState({
    open: false,
    info: { title: "" },
    from: "",
    previousState: null,
  });

  useEffect(() => {
    setIsLoading(true);

    //to invert Y axis
    L.CRS.XY = L.Util.extend({}, L.CRS.Simple, {
      code: "XY",
      projection: L.Projection.LonLat,
      transformation: new L.Transformation(1, 0, 1, 0),
    });
    const arrayOfDifferentBuildings = data[0].ns0__islocationof;

    const floorBuildings = arrayOfDifferentBuildings
      .map((x) => {
        if (x.ns0__islocationof) {
          return x.ns0__islocationof;
        }
      })
      .filter((x) => x !== undefined);
    const lengths = floorBuildings.map((a) => a.length);

    setAmountOfFloors(Math.max(...lengths));
    console.log(state);
    if (state) {
      console.log(state);
      setSelectedSchool(state.state);
    }
    setSchools(SCHOOL_DUMMY_LIST);
    setSchoolData(data);
    window.history.replaceState({}, document.title);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    //Main useEffect to find out all the different zones each floor with updated coords
    //and the devices each zones have
    const setMapFunc = async () => {
      setIsLoading(true);
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

          return device;
        });
        return locationObject;
      });

      //updating latlng with computeToPixels function
      const updatedCoordsObjects = locationObjects.map((x) => {
        const updatedUpperLeftCoords = computeToPixels({
          long: x.UpperLeftLong,
          lat: x.UpperLeftLat,
        });
        x.UpperLeftLong = updatedUpperLeftCoords.updatedLong;
        x.UpperLeftLat = updatedUpperLeftCoords.updatedLat;
        const updatedBottomRightCoords = computeToPixels({
          long: x.BottomRightLong,
          lat: x.BottomRightLat,
        });
        x.BottomRightLong = updatedBottomRightCoords.updatedLong;
        x.BottomRightLat = updatedBottomRightCoords.updatedLat;
        let newTitle = x.title.split("/")[x.title.split("/").length - 1];
        newTitle = newTitle.replaceAll("_", " ");
        x.title = newTitle;
        return x;
      });

      //Loading image "dynamically"
      const img = new Image();
      // const imgSrc = process.env.PUBLIC_URL + `/RVPSFloorplans/RVPS - FP0${selectedFloor}.png`;
      const imgSrc =
        process.env.PUBLIC_URL +
        `/RVPSFloorplans/rvv-floor${selectedFloor}_rotated.png`;
      img.src = imgSrc;
      await img.decode();
      setImageWidth(img.width); //swap this 2 around
      setImageHeight(img.height);
      setImageSrc(imgSrc);
      setZonesList(updatedCoordsObjects);
      // if (!map) {
      //   setIsLoading(false);
      //   return;
      // } else {
      setIsLoading(false);
      // if (state) onSearchHandler(state);
      // window.history.replaceState({}, document.title);
      // }
    };
    setMapFunc();
  }, [selectedFloor]);

  //to send data after redirecting
  const onSearchHandler = (e) => {
    history.push("../DeviceManagement", { state: e });
  };

  //floor change after user selects
  const onFloorChange = (e) => {
    setDeviceMarker(null);
    setSelectedFloorInput(e);
    setSelectedFloor(e.value.key);
  };

  //not used atm, plots rectangle on map when tree node is clicked on
  //based on upper left and bottom right latlng
  const plotMarkerOnClick = (ulLat, ulLong, blLat, blLong) => {
    const newUpperCoords = computeToPixels({ lat: ulLat, long: ulLong });
    const newBottomCoords = computeToPixels({ lat: blLat, long: blLong });
    L.rectangle([
      newUpperCoords,
      newBottomCoords,
      { color: "Red", weight: 1 },
    ]).addTo(map);
  };

  //to display floor options in floor select input
  let FloorControls = [];
  for (var i = 1; i <= amountOfFloors; i++) {
    FloorControls.push(
      <option key={i} value={i}>
        Floor {i}
      </option>
    );
  }

  //CURRENTLY WORKING ON

  //open pane when click on tree
  const openPaneFromTree = (clickedInfo) => {
    if (clickedInfo._type !== "Resource:ns0__Zone") return;
    setPane({ ...state, open: true, info: clickedInfo, from: "tree" });
  };

  //open pane when click on map
  const openPaneFromMap = (clickedInfo) => {
    console.log(clickedInfo);
    setPane({ ...state, open: true, info: clickedInfo, from: "map" });
  };

  //open side panel of device status when clicked on device
  //saved prevState to go back to zone
  const openPaneFromDevice = (clickedInfo) => {
    console.log(clickedInfo);
    panToDeviceCoords(clickedInfo);
    setPane({
      open: true,
      info: clickedInfo,
      from: "device",
    });
  };

  //close side pane
  const closeSidePanel = () => {
    setPane((prevState) => {
      return { ...prevState, open: false };
    });
  };

  //convert the device json so that they are the same
  const convertDeviceJSON = (deviceJSON) => {
    let updatedDeviceJSON = deviceJSON;
    updatedDeviceJSON = JSON.parse(
      JSON.stringify(updatedDeviceJSON)
        .split('"ns0__haspoint"')
        .join('"children"')
    );
    updatedDeviceJSON = JSON.parse(
      JSON.stringify(updatedDeviceJSON).split('"uri"').join('"title"')
    );
    updatedDeviceJSON = JSON.parse(
      JSON.stringify(updatedDeviceJSON)
        .split('"ns0__hasassociatedtag"')
        .join('"location"')
    );
    delete updatedDeviceJSON["ns0__hasassociatedtag"];
    return updatedDeviceJSON;
  };

  //capitalize first letter of word
  const capitalize = (word) => {
    // console.log(word);
    if (word !== null && word.length > 0) {
      return word
        .split(" ")
        .map((word) => {
          return word[0].toUpperCase() + word.substring(1);
        })
        .join(" ");
    }
  };

  const nameOfZoneAsIcon = (zone) => {
    return L.divIcon({
      html:
        "<b class='icon-title'>" +
        zone.title
          .split(" ")
          .map((word) => {
            return word[0].toUpperCase() + word.substring(1);
          })
          .join(" ") +
        "</b>",
      className: "divIcon",
    });
  };

  const DeviceStatus = (x) => {
    return x.children.map((y) => {
      return <div>{y.ns0__timeseries[0]}</div>;
    });
  };

  const panToDeviceCoords = (deviceInfo) => {
    setDeviceMarker(null);
    const long = deviceInfo.location.Longtitude;
    const lat = deviceInfo.location.Latitude;
    const updatedLongLat = computeToPixels({ long, lat });
    console.log(updatedLongLat);
    setDeviceMarker([updatedLongLat.updatedLat, updatedLongLat.updatedLong]);
    //zoom level when finding devices
    const mapZoom = 2;
    const mapWidth = windowSize.width * mapSizePercentage;
    const paneWidth = windowSize.width * sidePaneSizePercentage;
    const offsetZoomMultipler = Math.pow(mapZoom, 2);
    console.log(offsetZoomMultipler);
    const offsetSize = (mapWidth - paneWidth) / 2 / offsetZoomMultipler;
    map.flyTo(
      [updatedLongLat.updatedLat, updatedLongLat.updatedLong + offsetSize],
      mapZoom
    );
  };

  const DetailsSlider = () => {
    if (!isLoading && pane.from === "device") {
      let convertedDeviceInfo = convertDeviceJSON(pane.info);
      console.log(convertedDeviceInfo);
      return (
        <SlidingPanel
          panelContainerClassName="sliding-panel-container"
          panelClassName="sliding-panel"
          SlidingPanel={true}
          noBackdrop={true}
          isOpen={pane.open}
          type="right"
          size={`${sidePaneSizePercentage * 100}`}>
          <Button onClick={closeSidePanel}>
            <CloseIcon fontSize="large" />
          </Button>
          <Header1>{getTitleFromJSON(convertedDeviceInfo)}</Header1>
          <Header2>Status</Header2>
          {convertedDeviceInfo.children.map((y) => {
            return <div style={{ width: "100%" }}>{y.title}</div>;
          })}
          <ul></ul>
        </SlidingPanel>
      );
    }
    if (!isLoading) {
      return (
        <SlidingPanel
          panelContainerClassName="sliding-panel-container"
          panelClassName="sliding-panel"
          SlidingPanel={true}
          noBackdrop={true}
          isOpen={pane.open}
          type="right"
          size={`${sidePaneSizePercentage * 100}`}>
          <Button onClick={closeSidePanel}>
            <CloseIcon fontSize="large" />
          </Button>
          <Header1>
            {pane.from === "tree"
              ? getTitleFromJSON(pane.info)
              : capitalize(pane.info.title)}
          </Header1>
          {pane.from === "tree" ? (
            pane.info._type === "Resource:ns0__Zone" && <SceneMain />
          ) : (
            <SceneMain />
          )}
          {pane.info && (pane.info.children || pane.info.devices) && (
            <>
              <Header2>Devices</Header2>
              <SidePaneDeviceList>
                {pane.from === "tree" &&
                  pane.info.children.map((x, index) => {
                    return (
                      <SidePaneDevice
                        key={index}
                        onClick={() => openPaneFromDevice(x)}>
                        {getTitleFromJSON(x)}
                      </SidePaneDevice>
                    );
                  })}
                {pane.from === "map" &&
                  pane.info.devices.map((x, index) => {
                    return (
                      <SidePaneDevice
                        key={index}
                        onClick={() => openPaneFromDevice(x)}>
                        {getTitleFromJSONDevice(x)}
                      </SidePaneDevice>
                    );
                  })}
              </SidePaneDeviceList>
            </>
          )}
        </SlidingPanel>
      );
    }
  };

  //changed x.title to x.uri to make it work for devices
  //when opened from map
  const getTitleFromJSONDevice = (x) => {
    let title = x.uri;
    let newTitle = title.split("/")[title.split("/").length - 1];
    newTitle = newTitle.replaceAll("_", " ");
    newTitle += " (Device)";
    if (x.ns0__hasTag !== undefined) {
      newTitle +=
        " (" +
        JSON.parse(x.ns0__hasTag[0].replace(/'/g, '"')).Description +
        ")";
    }
    return newTitle
      .split(" ")
      .map((word) => {
        return word[0].toUpperCase() + word.substring(1);
      })
      .join(" ");
  };

  //CURRENTLY WORKING ON

  return (
    <MainContainer>
      <DetailsSlider />
      {!isLoading && schoolData && zonesList && (
        <Container>
          <Controls>
            <Header1>Schools</Header1>
            <Select
              style={{ width: "100%" }}
              options={schools.map((school) => {
                return { value: school.latLng, label: school.name };
              })}
              onChange={onSearchHandler}
              value={selectedSchool}
              isOptionSelected={true}
            />
            <Header2 style={{ marginTop: "20px" }}>Floors</Header2>
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
              value={selectedFloorInput}
              onChange={onFloorChange}
              isOptionSelected={true}
            />
            <Header2 style={{ marginTop: "20px" }}>
              Locations and Devices
            </Header2>
            <TreeView
              openPaneFromDevice={openPaneFromDevice}
              openPane={openPaneFromTree}
              plotMarkerOnClick={plotMarkerOnClick}
              selectedFloor={selectedFloor}
              schoolData={schoolData}
            />
          </Controls>
          <MapContainer
            maxZoom={6}
            zoom={1}
            minZoom={0.1}
            crs={L.CRS.XY}
            center={[imageHeight / 10 / 2, imageWidth / 10 / 2]}
            style={{
              height: "100vh",
              width: `${mapSizePercentage * 100}%`,
              background: "grey",
              border: "2px solid black",
            }}
            maxBounds={
              new LatLngBounds([
                [(imageHeight / 10) * 2, -(imageHeight / 10) / 2],
                [-(imageWidth / 10) / 2, (imageWidth / 10) * 2],
              ])
            }
            whenCreated={setMap}>
            <ImageOverlay
              url={imageSrc}
              bounds={[
                [imageHeight / 10, 0],
                [0, imageWidth / 10],
              ]}
              center={[0, 0]}
              style={{
                position: "absolute",
                background: "white",
                border: "2px solid black",
              }}
            />
            {deviceMarker && (
              <Marker
                position={deviceMarker}
                icon={
                  new L.Icon({
                    iconUrl: markerIconPng,
                    iconSize: [30, 46],
                    iconAnchor: [15, 46],
                  })
                }
              />
            )}
            {zonesList.map((x, index) => {
              return (
                <Rectangle
                  key={index}
                  eventHandlers={{
                    click: () => {
                      openPaneFromMap(x);
                    },
                  }}
                  stroke={false}
                  bounds={[
                    [x.UpperLeftLat, x.UpperLeftLong],
                    [x.BottomRightLat, x.BottomRightLong],
                  ]}>
                  <Marker
                    key={index}
                    position={[
                      (x.UpperLeftLat + x.BottomRightLat) / 2,
                      (x.BottomRightLong + x.UpperLeftLong) / 2,
                    ]}
                    eventHandlers={{
                      click: () => {
                        openPaneFromMap(x);
                      },
                    }}
                    icon={nameOfZoneAsIcon(x)}></Marker>
                </Rectangle>
              );
            })}
            {/* <ShowCoordsOnClick /> */}
          </MapContainer>
        </Container>
      )}
    </MainContainer>
  );
};
export default Map;
