import "react-sortable-tree/style.css";

import SortableTree from "react-sortable-tree";
import styled from "styled-components";

export const MySortableTree = styled(SortableTree)`
  .rst__rowTitle {
    color: white !important;
  }
  .rst__rowContents {
    background-color: #3f4252 !important;
    border: none !important;
    box-shadow: none !important;
    cursor: pointer;
    user-select: none;
    padding: 0rem 0.5rem;
  }
  .rst__expandButton {
    color: red !important;
  }
  .rst__lineBlock {
    color: red !important;
  }
  .rst__lineHalfHorizontalRight::before,
  .rst__lineFullVertical::after,
  .rst__lineHalfVerticalTop::after,
  .rst__lineHalfVerticalBottom::after,
  .rst__lineChildren::after {
    background: white;
  }
  .rst__expandButton,
  .rst__collapseButton {
    color: red;
  }
`;

export const DeviceBarArea = styled.div`
  grid-area: device;
  background-color: #27293d;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  display: grid;
  grid-template-columns: 4rem auto 4rem;
  align-items: center;
  justify-items: center;
  cursor: pointer;
`;

export const DeviceBarLabel = styled.div`
  user-select: none;
  font-size: 1.25rem;
  display: grid;
  align-items: center;
  justify-items: center;
  grid-template-columns: 3rem auto;
`;

export const DeviceBarCounterArea = styled.div`
  transform: rotate(90deg);
`;

export const DeviceBarCounter = styled.div`
  background-color: ${(props) =>
    props.totalWarning > 0 ? "#D82148" : "green"};
  height: 2rem;
  width: 2rem;
  border-radius: 1rem;
  display: grid;
  align-items: center;
  justify-items: center;
  font-size: 1rem;
  font-weight: 600;
`;

export const DeviceArea = styled.div`
  grid-area: device;
  display: grid;
  grid-template-rows: 2rem 2rem 4rem auto;
  grid-gap: 1rem;
  background-color: #27293d;
  padding: 1rem;
`;
export const DeviceHeader = styled.div`
  display: grid;
  grid-template-columns: 2rem auto 3rem;
`;
export const DeviceHeaderIcon = styled.div`
  display: grid;
  align-items: center;
  justify-items: start;
`;
export const DeviceHeaderTitle = styled.div`
  display: grid;
  align-items: center;
  justify-items: start;
  font-size: 1.25rem;
`;
export const DeviceHeaderCollapse = styled.div`
  display: grid;
  align-items: center;
  justify-items: end;
  cursor: pointer;
`;
export const DeviceMessage = styled.div`
  font-size: 1rem;
  font-weight: 600;
  align-self: center;
`;
export const DeviceControlPanelArea = styled.div`
  align-self: center;
`;
export const DeviceControlPanelSearch = styled.div``;
export const DeviceControlPanelFilter = styled.div``;
export const DeviceTreeArea = styled.div`
  align-self: start;
  // border: 1px solid #666666;
`;

export const TreeNodeSensorCounter = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  background-color: #2c2e39;
  display: grid;
  align-items: center;
  justify-items: center;
  width: 2.5rem;
`;
export const TreeNodeWarningCounter = styled(TreeNodeSensorCounter)`
  background-color: #950101;
`;

export const TreeNodeIcon = styled.div`
  display: grid;
  align-items: center;
  justify-items: center;
  margin: 0rem 0.25rem;
`;
