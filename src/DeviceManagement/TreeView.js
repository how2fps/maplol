import "react-sortable-tree/style.css";

import { Icon } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import useScrollOnDrag from "react-scroll-ondrag";

import { MySortableTree, TreeContainer, TreeNodeIcon, TreeNodeSensorCounter } from "./styled.js";

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
    let newGraphQL = props.schoolData;
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL).split('"uri"').join('"title"')
    );
    newGraphQL = JSON.parse(
      JSON.stringify(newGraphQL).split('"ns0__islocationof"').join('"children"')
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
    const arrayOfDifferentBuildings = props.schoolData[0].ns0__islocationof;
    console.log(arrayOfDifferentBuildings);
    const floorBuildings = arrayOfDifferentBuildings.map((x) => {
      if (x.ns0__islocationof) {
        return x.ns0__islocationof.filter((y) => {
          return y.uri.includes(`floor_${props.selectedFloor}`);
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
    if (clickedInfo._type === "Resource:ns0__Equipment") {
      props.openPane(clickedInfo, "device");
    } else {
      props.openPane(clickedInfo, "tree");
    }
  };

  const getFullPath = (path) => {
    let pathTitleArray = [];
    let pathObject = treeData;
    for (let i = 0; i < path.length; i++) {
      if (i === 0) {
        pathTitleArray.push(pathObject[i].title);
        if (pathObject[i].children) {
          pathObject = pathObject[i].children;
        }
      } else {
        let offSet = 1;
        if (path[i - 1] + 1 > 0) {
          offSet = path[i - 1] + 1;
        }
        const newIndex = path[i] - offSet;
        pathTitleArray.push(pathObject[newIndex].title);
        if (pathObject[newIndex].children) {
          pathObject = pathObject[newIndex].children;
        }
      }
    }
    return pathTitleArray;
  };

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

  const conditionNotEqualCounter = (obj, conditionKey, conditionValue) => {
    Object.keys(obj).forEach((key) => {
      if (key === conditionKey && obj[key] !== conditionValue) {
        countHolder++;
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        conditionNotEqualCounter(obj[key], conditionKey, conditionValue);
      }
    });
  };

  const getTotalCountByLevel = (node) => {
    return countEqualCondition(node, "_type", "Resource:ns0__Equipment");
  };

  const getGraphObjectType = (node) => {
    const objType = node._type.split("__")[node._type.split("__").length - 1];
    switch (objType) {
      case "Equipment":
        return objType;
      case "Point":
        return objType;
      default:
        return "Location";
    }
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
          title: getTitleFromJSON(nodeInfo.node),
          onClick: () => onNodeClick(nodeInfo),
          buttons: [
            getGraphObjectType(nodeInfo.node) === "Location" && (
              <TreeNodeSensorCounter>
                {getTotalCountByLevel(nodeInfo.node)}
              </TreeNodeSensorCounter>
            ),
            getGraphObjectType(nodeInfo.node) === "Equipment"
              ? [
                  <TreeNodeIcon>
                    <Icon style={{ color: "#31C3FF" }}>sensors</Icon>
                  </TreeNodeIcon>,
                ]
              : [],
            getGraphObjectType(nodeInfo.node) === "Point"
              ? [
                  <TreeNodeIcon>
                    <Icon style={{ color: "#FFC74D" }}>speed</Icon>
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
