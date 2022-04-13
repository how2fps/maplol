import "react-sortable-tree/style.css";

import { Icon } from "@material-ui/core";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Scrollbars } from "react-custom-scrollbars";

import data from "./rivervale.json";
import { graphQL } from "./rivervale.json";
import {
  DeviceArea,
  DeviceBarArea,
  DeviceBarCounter,
  DeviceBarCounterArea,
  DeviceBarLabel,
  DeviceHeader,
  DeviceHeaderCollapse,
  DeviceHeaderIcon,
  DeviceHeaderTitle,
  DeviceMessage,
  DeviceTreeArea,
  MySortableTree,
  TreeNodeIcon,
  TreeNodeSensorCounter,
  TreeNodeWarningCounter,
} from "./styled.js";

let countHolder = 0;

function DeviceManagement(props) {
  const { showDevice, hideDevice, expandDevice } = props;
  const [treeData, setTreeData] = useState([]);
  const [totalWarning, setTotalWarning] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);

  useEffect(() => {
    let newGraphQL = data;
    console.log(data);
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
    console.log(newGraphQL);
    setTotalDevices(getTotalCountByLevel(newGraphQL));
    // setTotalWarning(getWarningCountByLevel(newGraphQL));
    setTreeData(newGraphQL);
  }, []);

  const onNodeClick = (nodeInfo) => {
    console.log(nodeInfo);
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

  const countNotEqualCondition = (obj, conditionKey, conditionValue) => {
    let localCount = 0;
    countHolder = 0;
    conditionNotEqualCounter(obj, conditionKey, conditionValue);
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

  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      backgroundColor: `#a8a9b1
            `,
      borderRadius: `0.5rem`,
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  const isCharacterALetter = (char) => {
    return /[a-zA-Z]/.test(char);
  };

  const splitProperCase = (data) => {
    if (data.length > 0) {
      let newData = data[0];
      for (let i = 1; i < data.length; i++) {
        if (isCharacterALetter(data[i])) {
          if (data[i] === data[i].toUpperCase()) {
            if (data[i + 1]) newData += " ";
          }
        }
        newData += data[i];
      }
      return newData;
    }
    return data;
  };

  const getTitleFromJSON = (node) => {
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
          " (TimeSeriesId: " +
          node.ns0__timeseries[0].ns0__hasTimeseriesId +
          ")";
      }
    }

    return newTitle;
  };

  return (
    <MySortableTree
      canDrag={false}
      style={{ color: "black" }}
      isVirtualized={false}
      treeData={treeData}
      onChange={(treeData) => setTreeData(treeData)}
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
  );
}

export default DeviceManagement;
