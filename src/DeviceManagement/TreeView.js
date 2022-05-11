import "react-sortable-tree/style.css";

import { Icon } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import useScrollOnDrag from "react-scroll-ondrag";

import { MySortableTree, ScaffoldBlock, TreeContainer, TreeNodeIcon, TreeNodeSensorCounter } from "./styled.js";

let countHolder = 0;

export const getTitleFromJSON = (node) => {
  let title = node.title;
  let newTitle = title.split("/")[title.split("/").length - 1];
  // newTitle = splitProperCase(newTitle);
  newTitle = newTitle.replaceAll("_", " ");
  if (node._type === "Resource:ns0__Equipment") {
    newTitle += " (Device)";
    if (node.ns0__hasTag !== undefined) {
      newTitle +=
        " (" +
        JSON.parse(node.ns0__hasTag[0].replace(/'/g, '"')).Description +
        ")";
    }
    if (node.ns0__hasassociatedtag !== undefined) {
      const coord = JSON.parse(
        node.ns0__hasassociatedtag[0].ns0__hasValue[0].replace(/'/g, '"')
      );
      newTitle +=
        " (Long:" + coord.Longtitude + " Lat: " + coord.Latitude + ")";
    }
  }
  if (node._type === "Resource:ns0__Point") {
    newTitle += " (Point)";
    if (node.ns0__hasunit !== undefined) {
      newTitle +=
        " (" +
        node.ns0__hasunit[0].title.split("/")[
          node.ns0__hasunit[0].title.split("/").length - 1
        ] +
        ")";
    }
    if (node.ns0__timeseries !== undefined) {
      newTitle +=
        " (TimeSeriesId: " + node.ns0__timeseries[0].ns0__hasTimeseriesId + ")";
    }
  }
  return newTitle
    .split(" ")
    .map((word) => {
      return word[0].toUpperCase() + word.substring(1);
    })
    .join(" ");
};

function TreeView(props) {
  const ref = useRef();
  const { events } = useScrollOnDrag(ref);

  const [treeData, setTreeData] = useState([]);
  const [totalDevices, setTotalDevices] = useState(0);

  useEffect(() => {
    let newGraphQL = props.schoolData[1];
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL).split('"uri"').join('"title"')
    );
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL).split('"ns0__islocationof"').join('"children"')
    );
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL).split('"ns0__haspart"').join('"children"')
    );
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL).split('"ns0__haslocation"').join('"children"')
    );
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL).split('"ns0__haspoint"').join('"children"')
    );
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL)
        .split('"ns0__hasassociatedtag"')
        .join('"location"')
    );
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL).split('"ns0__hasValue"').join('"coordinates"')
    );
    setTotalDevices(getTotalCountByLevel(newGraphQL));
    setTreeData(newGraphQL);
  }, []);

  useEffect(() => {
    const arrayOfDifferentBuildings = props.schoolData[1].ns0__islocationof;
    console.log(arrayOfDifferentBuildings);
    const floorBuildings = arrayOfDifferentBuildings.map((x) => {
      if (x._type === "Resource:ns0__Building") {
        if (x.ns0__haspart) {
          return x.ns0__haspart.filter((y) => {
            return y.uri.includes(`_${props.selectedFloor}`);
          });
        }
      }
      if (x._type === "Resource:ns0__Equipment") {
        if (props.selectedFloor === "1" || 1) {
          return x;
        }
      }
    });
    const filteredUndefineFloorBuilding = floorBuildings.filter((x) => {
      return x !== undefined;
    });
    console.log(filteredUndefineFloorBuilding);
    let floorBuildingsFixed = filteredUndefineFloorBuilding.map((x) => {
      if (Array.isArray(x)) {
        return x[0];
      } else {
        return x;
      }
    });
    floorBuildingsFixed = floorBuildingsFixed.filter((x) => {
      return x !== undefined;
    });
    console.log(floorBuildingsFixed);
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
        .split('"ns0__haspart"')
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
        .split('"ns0__hasassociatedtag"')
        .join('"location"')
    );
    floorBuildingsFixed = JSON.parse(
      JSON.stringify(floorBuildingsFixed)
        .split('"ns0__hasValue"')
        .join('"coordinates"')
    );
    setTotalDevices(getTotalCountByLevel(floorBuildingsFixed));
    setTreeData(floorBuildingsFixed);
  }, [props.selectedFloor]);

  const onNodeClick = (nodeInfo) => {
    const clickedInfo = nodeInfo.node;
    console.log(clickedInfo);
    if (clickedInfo._type === "Resource:ns0__Equipment") {
      props.openPane(clickedInfo, "device");
    } else {
      props.openPane(clickedInfo, "tree");
    }
  };

  // const getFullPath = (path) => {
  //   let pathTitleArray = [];
  //   let pathObject = treeData;
  //   for (let i = 0; i < path.length; i++) {
  //     if (i === 0) {
  //       pathTitleArray.push(pathObject[i].title);
  //       if (pathObject[i].children) {
  //         pathObject = pathObject[i].children;
  //       }
  //     } else {
  //       let offSet = 1;
  //       if (path[i - 1] + 1 > 0) {
  //         offSet = path[i - 1] + 1;
  //       }
  //       const newIndex = path[i] - offSet;
  //       pathTitleArray.push(pathObject[newIndex].title);
  //       if (pathObject[newIndex].children) {
  //         pathObject = pathObject[newIndex].children;
  //       }
  //     }
  //   }
  //   return pathTitleArray;
  // };

  const countEqualCondition = (obj, conditionKey, conditionValue) => {
    let localCount = 0;
    countHolder = 0;
    conditionEqualCounter(obj, conditionKey, conditionValue);
    localCount = countHolder;
    countHolder = 0;
    return localCount;
  };

  const conditionEqualCounter = (obj, conditionKey, conditionValue) => {
    Object.keys(obj).forEach((key) => {
      if (key === conditionKey && obj[key] === conditionValue) {
        countHolder++;
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        conditionEqualCounter(obj[key], conditionKey, conditionValue);
      }
    });
  };

  // const conditionNotEqualCounter = (obj, conditionKey, conditionValue) => {
  //   Object.keys(obj).forEach((key) => {
  //     if (key === conditionKey && obj[key] !== conditionValue) {
  //       countHolder++;
  //     }
  //     if (typeof obj[key] === "object" && obj[key] !== null) {
  //       conditionNotEqualCounter(obj[key], conditionKey, conditionValue);
  //     }
  //   });
  // };

  const getTotalCountByLevel = (node) => {
    return countEqualCondition(node, "_type", "Resource:ns0__Equipment");
  };

  const getGraphObjectType = (node) => {
    const objType = node._type.split("__")[node._type.split("__").length - 1];
    switch (objType) {
      case "Equipment":
        return objType;
      case "Floor":
        return objType;
      case "Zone":
        return objType;
      case "Point":
        return objType;
      case "Room":
        return objType;
      default:
        return "Location";
    }
  };

  const titleComponent = (nodeInfo) => {
    let component;
    const title = getTitleFromJSON(nodeInfo.node);
    switch (getGraphObjectType(nodeInfo.node)) {
      case "Location":
        component = (
          <ScaffoldBlock>
            <Icon style={{ color: "#31C3FF", marginRight: "0.5rem" }}>
              sensors
            </Icon>
            <span>{title}</span>
          </ScaffoldBlock>
        );
        break;
      case "Floor":
        component = (
          <ScaffoldBlock>
            <Icon style={{ color: "#31C3FF", marginRight: "0.5rem" }}>
              my_location
            </Icon>
            <span>{title}</span>
          </ScaffoldBlock>
        );
        break;
      case "Zone":
        component = (
          <ScaffoldBlock>
            <Icon style={{ color: "#31C3FF", marginRight: "0.5rem" }}>
              my_location
            </Icon>
            <span>{title}</span>
          </ScaffoldBlock>
        );
        break;
      case "Room":
        component = (
          <ScaffoldBlock>
            <Icon style={{ color: "#31C3FF", marginRight: "0.5rem" }}>
              meeting_room
            </Icon>
            <span>{title}</span>
          </ScaffoldBlock>
        );
        break;
      case "Equipment":
        component = (
          <ScaffoldBlock>
            <Icon style={{ color: "#31C3FF", marginRight: "0.5rem" }}>
              sensors
            </Icon>
            <span>{title}</span>
          </ScaffoldBlock>
        );
        break;
      case "Point":
        component = (
          <ScaffoldBlock>
            <Icon style={{ color: "#31C3FF", marginRight: "0.5rem" }}>
              speed
            </Icon>
            <span>{title}</span>
          </ScaffoldBlock>
        );
        break;
      default:
        component = <div>{title}</div>;
    }
    return component;
  };

  return (
    <TreeContainer {...events} ref={ref}>
      <MySortableTree
        canDrag={false}
        isVirtualized={false}
        treeData={treeData}
        onChange={(treeData) => setTreeData(treeData)}
        scaffoldBlockPxWidth={44}
        generateNodeProps={(nodeInfo) => ({
          title: titleComponent(nodeInfo),
          onClick: () => onNodeClick(nodeInfo),
          buttons: [
            getGraphObjectType(nodeInfo.node) === "Floor" ||
            getGraphObjectType(nodeInfo.node) === "Zone" ||
            getGraphObjectType(nodeInfo.node) === "Room" ||
            getGraphObjectType(nodeInfo.node) === "Location"
              ? [
                  <TreeNodeIcon>
                    <TreeNodeSensorCounter>
                      {getTotalCountByLevel(nodeInfo.node)}
                    </TreeNodeSensorCounter>
                  </TreeNodeIcon>,
                ]
              : [],
          ],
        })}
      />
    </TreeContainer>
  );
}

export default TreeView;
