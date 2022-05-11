import "./Map.css";
import "antd/dist/antd.css";
import "leaflet/dist/leaflet.css";
import "react-sliding-side-panel/src/index.css";
import "react-sortable-tree/style.css";

import { Icon } from "@material-ui/core";
import L, { LatLngBounds } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import React, { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Marker, Rectangle, useMapEvents } from "react-leaflet";
import { useParams } from "react-router-dom";
import SlidingPanel from "react-sliding-side-panel";

import { computeToPixels } from "./computeToPixels";
import { useWindowSize } from "./hooks/useWindowSize";
import floor1 from "./RVPSFloorplans/rvv-floor1_rotated.png";
import floor2 from "./RVPSFloorplans/rvv-floor2_rotated.png";
import floor3 from "./RVPSFloorplans/rvv-floor3_rotated.png";
import floor4 from "./RVPSFloorplans/rvv-floor4_rotated.png";
import floor5 from "./RVPSFloorplans/rvv-floor5_rotated.png";
import SceneMain from "./SceneMain";
import {
  Button,
  Container,
  Controls,
  FloorArea,
  FloorBox,
  Header1,
  Header2,
  MainContainer,
  SidePaneItem,
  SidePaneList,
} from "./styled";
import TreeView, { getTitleFromJSON } from "./TreeView";
import data from "./xinmin_and_rivervale.json";

//component that logs out latlng when map is clicked
//z-index issues if it is present so only turn it on when needed
function ShowCoordsOnClick() {
  useMapEvents({
    click: (e) => {},
  });
  return null;
}

const Map = (props) => {
  const mapSizePercentage = 0.6;
  const sidePaneSizePercentage = 0.3;
  // const sidePaneRef = useRef(null);
  // const mapRef = useRef(null);

  const { schoolname } = useParams();

  const windowSize = useWindowSize();
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState(null);
  const [imageHeight, setImageHeight] = useState(null);
  const [amountOfFloors, setAmountOfFloors] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState("1");
  const [sidePaneDetails, setSidePaneDetails] = useState("");
  const [schoolData, setSchoolData] = useState(null);
  const [zonesList, setZonesList] = useState([]);
  const [deviceMarker, setDeviceMarker] = useState(null);
  //error happens if title isn't intialised at state, due to slider library possibly
  //rendering before it's actually opened?
  const [pane, setPane] = useState({
    open: false,
    info: { title: "" },
    from: "",
    type: "",
  });

  useEffect(() => {
    setIsLoading(true);

    //to invert Y axis
    L.CRS.XY = L.Util.extend({}, L.CRS.Simple, {
      code: "XY",
      projection: L.Projection.LonLat,
      transformation: new L.Transformation(1, 0, 1, 0),
    });
    const arrayOfDifferentBuildings = data[1].ns0__islocationof;

    const floorBuildings = arrayOfDifferentBuildings
      .map((x) => {
        if (x.ns0__haspart) {
          return x.ns0__haspart;
        }
      })
      .filter((x) => x !== undefined);
    const lengths = floorBuildings.map((a) => a.length);

    setAmountOfFloors(Math.max(...lengths));
    setSchoolData(data);
    setIsLoading(false);
  }, [map]);

  useEffect(() => {
    //Main useEffect to find out all the different zones each floor with updated coords
    //and the devices each zones have
    const setMapFunc = async () => {
      setIsLoading(true);

      const graphqlData = await data;
      const school = graphqlData[1];
      const arrayOfDifferentBuildings = school.ns0__islocationof;
      const floorBuildings = arrayOfDifferentBuildings.map((x) => {
        if (x._type === "Resource:ns0__Building" && x.ns0__haspart) {
          return x.ns0__haspart.filter((y) => {
            return y.uri.includes(`level_${selectedFloor}`);
          });
        }
      });
      const filteredUndefineFloorBuilding = floorBuildings.filter(
        (x) => x !== undefined
      );
      let floorBuildingsFixed = filteredUndefineFloorBuilding.map((x) => x[0]);

      floorBuildingsFixed = JSON.parse(
        JSON.stringify(floorBuildingsFixed).split('"uri"').join('"title"')
      );
      floorBuildingsFixed = JSON.parse(
        JSON.stringify(floorBuildingsFixed)
          .split('"ns0__islocationof"')
          .join('"children"')
      );
      floorBuildingsFixed = JSON.parse(
        JSON.stringify(floorBuildingsFixed)
          .split('"ns0__haslocation"')
          .join('"children"')
      );
      floorBuildingsFixed = JSON.parse(
        JSON.stringify(floorBuildingsFixed)
          .split('"ns0__haspoint"')
          .join('"children"')
      );
      floorBuildingsFixed = JSON.parse(
        JSON.stringify(floorBuildingsFixed)
          .split('"ns0__haspart"')
          .join('"children"')
      );
      floorBuildingsFixed = JSON.parse(
        JSON.stringify(floorBuildingsFixed)
          .split('"ns0__hasassociatedtag"')
          .join('"location"')
      );
      floorBuildingsFixed = JSON.parse(
        JSON.stringify(floorBuildingsFixed)
          .split('"ns0__hasValue"')
          .join('"coordinates"')
      );
      let roomsOnFloor = floorBuildingsFixed.map((x) => {
        if (x && x.children) {
          return x.children;
        }
      });
      roomsOnFloor = roomsOnFloor.filter((x) => x !== undefined);
      roomsOnFloor = roomsOnFloor.flat();

      const locationObjects = roomsOnFloor.map((x) => {
        //where the zone json gets transformed for easier plotting on map
        const locationObject = JSON.parse(
          x.location[0].coordinates[0].split("'").join('"')
        );
        locationObject.title = x.title;

        //added all this fields to allow functions like panToCoords to work
        //with less checking
        locationObject._type = x._type;
        locationObject.location = x.location;
        //fixing json for devices
        if (x.children && x.children.length > 0) {
          locationObject.children = x.children.map((device) => {
            if (device && device._type === "Resource:ns0__Equipment") {
              device.description = JSON.parse(
                device.ns0__hasTag[0].split("'").join('"')
              );
              device.description = device.description.Description;
              if (device.location) {
                device.location = JSON.parse(
                  device.location[0].coordinates[0].split("'").join('"')
                );
              }
            }
            return device;
          });
        }
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
        x.title = capitalize(newTitle);
        return x;
      });

      const img = new Image();
      let imgSrc;
      switch (selectedFloor) {
        case "1":
          imgSrc = floor1;
          break;
        case "2":
          imgSrc = floor2;
          break;
        case "3":
          imgSrc = floor3;
          break;
        case "4":
          imgSrc = floor4;
          break;
        case "5":
          imgSrc = floor5;
          break;
        default:
          break;
      }
      img.src = imgSrc;
      await img.decode();
      setImageWidth(img.width); //swap this 2 around
      setImageHeight(img.height);
      setImageSrc(imgSrc);
      setZonesList(updatedCoordsObjects);
      setIsLoading(false);
    };
    setMapFunc();
  }, [selectedFloor]);

  //to display floor options in floor select input
  let FloorControls = [];
  for (var i = 1; i <= amountOfFloors; i++) {
    FloorControls.push(
      <option key={i} value={i}>
        Floor {i}
      </option>
    );
  }

  //floor change after user selects
  const onFloorChange = (e) => {
    setDeviceMarker(null);
    setPane((prevState) => {
      return { ...prevState, open: false };
    });
    setSelectedFloor(e.value.key);
  };

  //CURRENTLY WORKING ON

  const openPane = (clickedInfo, from) => {
    setDeviceMarker(null);
    if (
      clickedInfo._type === "Resource:ns0__Room" ||
      clickedInfo._type === "Resource:ns0__Equipment"
    ) {
      panToCoords(clickedInfo);
      setPane((prevState) => {
        return { ...prevState, open: true, info: clickedInfo, from };
      });
    } else {
      setPane((prevState) => {
        return { ...prevState, open: true, info: clickedInfo, from };
      });
    }
  };

  const closePane = () => {
    if (deviceMarker) {
      console.log(deviceMarker);
      map.flyTo(deviceMarker, 1.5);
    }
    setPane((prevState) => {
      return { ...prevState, open: false };
    });
  };

  // const DeviceStatus = (x) => {
  //   return x.children.map((y) => {
  //     return <div>{y.ns0__timeseries[0]}</div>;
  //   });
  // };

  const panToCoords = (deviceInfo) => {
    setDeviceMarker(null);
    let location = deviceInfo.location;
    if (Array.isArray(location) && location[0].hasOwnProperty("coordinates")) {
      location = location[0].coordinates[0];
      //to solve errors found in JSON so it's parseable
      location = location.split("'BottomRightLat: ").join("'BottomRightLat': ");
      location = location.split(", ,").join(",");
      location = location.split(",}").join("}");
      location = JSON.parse(location.split("'").join('"'));
      deviceInfo.location = location;
    }
    let long;
    let lat;
    let updatedLongLat;
    if (location.Type === "AreaCoordinate") {
      long = (location.UpperLeftLong + location.BottomRightLong) / 2;
      lat = (location.UpperLeftLat + location.BottomRightLat) / 2;
    } else {
      long = deviceInfo.location.Longtitude;
      lat = deviceInfo.location.Latitude;
    }
    updatedLongLat = computeToPixels({ long, lat });
    setDeviceMarker([updatedLongLat.updatedLat, updatedLongLat.updatedLong]);
    //zoom level when finding devices
    const mapZoom = 2;
    const mapWidth = windowSize.width * mapSizePercentage;
    const paneWidth = windowSize.width * sidePaneSizePercentage;
    const offsetZoomMultipler = Math.pow(mapZoom, 2);
    const offsetSize = (mapWidth - paneWidth) / 2 / offsetZoomMultipler;
    map.flyTo(
      [updatedLongLat.updatedLat, updatedLongLat.updatedLong + offsetSize],
      mapZoom
    );
  };

  //changed x.title to x.uri to make it work for devices
  //when opened from map
  // const getTitleFromJSONDevice = (x) => {
  //   let title = x.title;
  //   let newTitle = title.split("/")[title.split("/").length - 1];
  //   newTitle = newTitle.replaceAll("_", " ");
  //   newTitle += " (Device)";
  //   if (x.ns0__hasTag !== undefined) {
  //     newTitle +=
  //       " (" +
  //       JSON.parse(x.ns0__hasTag[0].replace(/'/g, '"')).Description +
  //       ")";
  //   }
  //   return newTitle
  //     .split(" ")
  //     .map((word) => {
  //       return word[0].toUpperCase() + word.substring(1);
  //     })
  //     .join(" ");
  // };

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

  useEffect(() => {
    //DEVICE SIDE PANE
    if (!isLoading && pane.info._type === "Resource:ns0__Equipment") {
      let convertedDeviceInfo = convertDeviceJSON(pane.info);
      setSidePaneDetails(
        <>
          <Header1>{getTitleFromJSON(convertedDeviceInfo)}</Header1>
          <Header2>Status</Header2>
          {convertedDeviceInfo.children.map((status, index) => {
            return (
              <div key={index} style={{ width: "100%" }}>
                {status.title}
              </div>
            );
          })}
          <ul></ul>
        </>
      );
    }
    //ROOM SIDE PANE
    // else if (!isLoading && pane.info._type === "Resource:ns0__Room") {
    //   let convertedDeviceInfo = convertDeviceJSON(pane.info);
    //   setSidePaneDetails(
    //     <>
    //       <Header1>{getTitleFromJSON(convertedDeviceInfo)}</Header1>
    //       <Header2>Zones</Header2>
    //       {convertedDeviceInfo.children
    //         ? convertedDeviceInfo.children.map((x, index) => {
    //             return (
    //               <SidePaneList key={index} style={{ width: "100%" }}>
    //                 <SidePaneItem
    //                   key={index}
    //                   onClick={() => openPane(x, "tree")}>
    //                   <i
    //                     style={{
    //                       margin: "0 1rem 0 0",
    //                       display: "grid",
    //                       alignItems: "center",
    //                     }}>
    //                     <Icon fontSize="medium">my_location</Icon>
    //                   </i>
    //                   {getTitleFromJSON(x)}
    //                 </SidePaneItem>
    //               </SidePaneList>
    //             );
    //           })
    //         : ""}
    //     </>
    //   );
    // }
    //FLOOR SIDE PANE
    else if (!isLoading && pane.info._type === "Resource:ns0__Floor") {
      setSidePaneDetails(
        <>
          <Header1>
            {pane.from === "tree"
              ? getTitleFromJSON(pane.info)
              : capitalize(pane.info.title)}
          </Header1>
          <Header2>Rooms</Header2>
          <SidePaneList>
            {pane.info.children
              ? pane.info.children.map((x, index) => {
                  return (
                    <SidePaneItem
                      key={index}
                      onClick={() => openPane(x, "device")}>
                      <i
                        style={{
                          margin: "0 1rem 0 0",
                          display: "grid",
                          alignItems: "center",
                        }}>
                        <Icon fontSize="medium">meeting_room</Icon>
                      </i>
                      {getTitleFromJSON(x)}
                    </SidePaneItem>
                  );
                })
              : ""}
          </SidePaneList>
        </>
      );
    }
    //ZONE SIDE PANE
    else if (!isLoading) {
      setSidePaneDetails(
        <>
          <Header1>
            {pane.from === "tree"
              ? getTitleFromJSON(pane.info)
              : pane.info.title}
          </Header1>

          {pane.from === "tree" ? (
            pane.info._type === "Resource:ns0__Room" ? (
              <SceneMain />
            ) : (
              ""
            )
          ) : (
            <SceneMain />
          )}

          {pane.info && (pane.info.children || pane.info.devices) ? (
            <>
              <Header2>Devices</Header2>
              <SidePaneList>
                {pane.info.children &&
                  pane.info.children.map((x, index) => {
                    return (
                      <SidePaneItem
                        key={index}
                        onClick={() => openPane(x, "device")}>
                        <div
                          style={{
                            margin: "0 1rem 0 0",
                            display: "grid",
                            alignItems: "center",
                          }}>
                          <Icon fontSize="medium">sensors</Icon>
                        </div>
                        {getTitleFromJSON(x)}
                      </SidePaneItem>
                    );
                  })}
              </SidePaneList>
            </>
          ) : (
            ""
          )}
        </>
      );
    }
  }, [isLoading, pane]);

  //CURRENTLY WORKING ON

  return (
    <MainContainer>
      <SlidingPanel
        panelContainerClassName="sliding-panel-container"
        panelClassName="sliding-panel"
        SlidingPanel={true}
        noBackdrop={true}
        isOpen={pane.open}
        type="right"
        size={`${sidePaneSizePercentage * 100}`}>
        <Button onClick={closePane}>
          <Icon fontSize="large">close</Icon>
        </Button>
        {sidePaneDetails}
      </SlidingPanel>
      <Container>
        <Controls>
          <Header1>{schoolname}</Header1>
          <hr />
          <Header2 style={{ marginTop: "20px" }}>List of Floors</Header2>
          <FloorArea>
            {FloorControls.map((floor) => (
              <FloorBox
                selected={selectedFloor === floor.key}
                onClick={() => onFloorChange({ value: floor, label: floor })}>
                {floor}
              </FloorBox>
            ))}
          </FloorArea>
          <Header2 style={{ marginTop: "20px" }}>Device Tree</Header2>
          {schoolData && zonesList ? (
            <TreeView
              openPane={openPane}
              selectedFloor={selectedFloor}
              schoolData={schoolData}
            />
          ) : (
            ""
          )}
        </Controls>
        <div
          style={{
            height: "90vh",
            width: `${mapSizePercentage * 100}%`,
            background: "white",
          }}>
          {!isLoading && schoolData && zonesList ? (
            <MapContainer
              maxZoom={6}
              zoom={1}
              minZoom={0.1}
              crs={L.CRS.XY}
              center={[imageHeight / 10 / 2, imageWidth / 10 / 2]}
              style={{
                height: "90vh",
                background: "white",
              }}
              maxBounds={
                new LatLngBounds([
                  [(imageHeight / 10) * 2, -(imageHeight / 10) / 2],
                  [-(imageWidth / 10) / 2, (imageWidth / 10) * 2],
                ])
              }
              zoomControl={false}
              whenCreated={setMap}>
              <ImageOverlay
                url={imageSrc}
                bounds={[
                  [imageHeight / 10, 0],
                  [0, imageWidth / 10],
                ]}
              />
              {!!deviceMarker ? (
                <Marker
                  position={[deviceMarker[0], deviceMarker[1]]}
                  icon={
                    new L.Icon({
                      iconUrl: markerIconPng,
                      iconSize: [25, 41],
                      iconAnchor: [12.5, 41],
                    })
                  }
                />
              ) : (
                ""
              )}
              {zonesList.map((x, index) => {
                return (
                  <Rectangle
                    key={index}
                    eventHandlers={{
                      click: () => {
                        openPane(x, "map");
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
                          openPane(x, "map");
                        },
                      }}
                      icon={nameOfZoneAsIcon(x)}></Marker>
                  </Rectangle>
                );
              })}
            </MapContainer>
          ) : (
            ""
          )}
        </div>
      </Container>
    </MainContainer>
  );
};
export default Map;
