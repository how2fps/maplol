import "./Map.css";
import "antd/dist/antd.css";
import "leaflet/dist/leaflet.css";
import "react-sliding-side-panel/src/index.css";
import "react-sortable-tree/style.css";

import { Icon } from "@material-ui/core";
import ArrowBack from "@mui/icons-material/ArrowBackIosNew";
import CloseIcon from "@mui/icons-material/Close";
import L, { CRS, LatLngBounds } from "leaflet";
import { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Marker, Rectangle, useMapEvents } from "react-leaflet";
import { useHistory, useLocation } from "react-router-dom";
import Select from "react-select";
import SlidingPanel from "react-sliding-side-panel";

import { computeToPixels } from "./computeToPixels";
import DeviceManagement, { getTitleFromJSON } from "./JSONFile";
import data from "./rivervale.json";
import SceneMain from "./SceneMain";
import { Container, Controls, SidePane, SidePaneDevice, SidePaneDeviceList } from "./styled";

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
function MyComponent() {
  useMapEvents({
    click: (e) => {
      console.log(e.latlng);
    },
  });
  return null;
}

const Map = () => {
  const history = useHistory();
  const { state } = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [amountOfFloors, setAmountOfFloors] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [zonesList, setZonesList] = useState([]);
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
    if (state) {
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
          device.ns0__hasassociatedtag[0].ns0__hasValue[0].split("'").join('"')
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

    //Loading image "dynamically"
    const img = new Image();
    // const imgSrc = process.env.PUBLIC_URL + `/RVPS - FP0${selectedFloor}.png`;
    const imgSrc =
      process.env.PUBLIC_URL + `/rvv-floor${selectedFloor}_rotated.png`;
    img.src = imgSrc;
    setImageWidth(img.width);
    setImageHeight(img.height);
    setImageSrc(imgSrc);
    if (!map) {
      setIsLoading(false);
      return;
    } else {
      setIsLoading(false);
      L.map.imageSrc = imgSrc;
      // if (state) onSearchHandler(state);
      // window.history.replaceState({}, document.title);
      setZonesList(updatedCoordsObjects);
    }
  }, [selectedFloor, map]);

  //to send data after redirecting
  const onSearchHandler = (e) => {
    history.push("../DeviceManagement", { state: e });
  };

  //floor change after user selects
  const onFloorChange = (e) => {
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
    setPane({ ...state, open: true, info: clickedInfo, from: "map" });
  };

  //open side panel when clicked on device
  //saved prevState to go back to zone
  const openPaneFromDevice = (clickedInfo) => {
    setPane((prevState) => {
      return {
        open: true,
        info: clickedInfo,
        from: "device",
        previousState: prevState,
      };
    });
  };

  //back option to zone side pane from device side pane
  const backFromDevice = () => {
    setPane((prevState) => {
      const previousState = prevState.previousState;
      return {
        ...prevState,
        from: previousState.from,
        info: previousState.info,
        open: true,
      };
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
          size="30">
          <button onClick={backFromDevice}>
            <ArrowBack />
          </button>
          <button onClick={closeSidePanel}>
            <CloseIcon />
          </button>
          <h1>{getTitleFromJSON(convertedDeviceInfo)}</h1>
          <h2>Status</h2>
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
          size="30">
          <button onClick={closeSidePanel}>
            <CloseIcon />
          </button>
          <h1>
            {pane.from === "tree"
              ? getTitleFromJSON(pane.info)
              : capitalize(pane.info.title)}
          </h1>
          {pane.from === "tree" ? (
            pane.info._type === "Resource:ns0__Zone" && <SceneMain />
          ) : (
            <SceneMain />
          )}
          {pane.info && (pane.info.children || pane.info.devices) && (
            <>
              <h2>Devices</h2>
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
    <>
      <DetailsSlider />
      {!isLoading && schoolData && zonesList && (
        <Container>
          <Controls>
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
              openPane={openPaneFromTree}
              plotMarkerOnClick={plotMarkerOnClick}
              selectedFloor={selectedFloor}
              schoolData={schoolData}
            />
          </Controls>
          <MapContainer
            maxZoom={7}
            zoom={1}
            minZoom={1}
            crs={L.CRS.XY}
            center={[250, 250]}
            style={{
              height: "90vh",
              width: "60%",
              background: "grey",
              border: "2px solid black",
            }}
            maxBounds={
              new LatLngBounds([
                [750, -250],
                [-250, 750],
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
              style={{
                position: "absolute",
                background: "white",
                border: "2px solid black",
              }}
            />
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
            {/* <MyComponent /> */}
          </MapContainer>
        </Container>
      )}
    </>
  );
};
export default Map;
