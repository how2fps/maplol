import "react-sortable-tree/style.css";

import SortableTree from "react-sortable-tree";
import styled from "styled-components";
import { Select } from "antd";

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

export const AdHocRoot = styled.div`
  border: 1px solid #555555;
  user-select: none;
  margin: 0 0 1rem 0;
`;

export const AdHocHeader = styled.div`
  font-size: 1rem;
  background-color: #555555;
  padding: 0.5rem;
`;

export const AdHocBody = styled.div`
  padding: 1rem;
`;

export const TimeControl = styled.div`
  display: grid;
  grid-template-columns: auto 3rem 3rem;
  align-items: center;
`;

export const TimeMessage = styled.div`
  justify-self: start;
  z-index: 999;
`;

export const ControlButtonArea = styled.div`
  justify-self: center;
  cursor: pointer;
`;

export const ControlButton = styled.div`
  background-color: #555555;
  display: grid;
  justify-items: center;
  align-items: center;
  &:hover {
    background-color: #777777;
  }
`;

export const AdHocFooter = styled.div`
  padding: 0.5rem;
`;

export const SetAdHocButton = styled.div`
  padding: 0.5rem;
  text-align: center;
  width: 100%;
  background-color: #555555;
  cursor: pointer;
  &:hover {
    background-color: #777777;
  }
`;

export const CreateScheduleRoot = styled.div`
  border: 1px solid #555555;
  user-select: none;
  margin: 0 0 1rem 0;
`;

export const CreateScheduleHeader = styled.div`
  font-size: 1rem;
  background-color: #555555;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
`;

export const CreateScheduleBody = styled.div`
  padding: 0.5rem;
  display: grid;
  grid-gap: 0.5rem;
`;

export const CreateScheduleFooter = styled.div`
  padding: 0 0.5rem 0.5rem 0.5rem;
`;

export const CreateScheduleButton = styled.div`
  padding: 0.5rem;
  text-align: center;
  width: 100%;
  background-color: #555555;
  cursor: pointer;
  &:hover {
    background-color: #777777;
  }
`;

export const CreateSpecialDayRoot = styled.div`
  border: 1px solid #555555;
  user-select: none;
  margin: 0 0 1rem 0;
`;

export const CreateSpecialDayHeader = styled.div`
  font-size: 1rem;
  background-color: #555555;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
`;

export const CreateSpecialDayBody = styled.div`
  padding: 0.5rem;
  display: grid;
  grid-gap: 0.5rem;
`;

export const CreateSpecialDayFooter = styled.div`
  padding: 0rem 0.5rem 0.5rem 0.5rem;
`;

export const CreateSpecialDayButton = styled.div`
  padding: 0.5rem;
  text-align: center;
  width: 100%;
  background-color: #555555;
  cursor: pointer;
  &:hover {
    background-color: #777777;
  }
`;

export const FormInputRow = styled.div`
  display: grid;
  grid-template-columns: 6rem auto;
`;
export const FormInputRowLabel = styled.div`
  align-self: center;
`;
export const FormInputRowInput = styled.div``;

export const CustomSelect = styled(Select)`
  span .ant-select-selection-item-content {
    color: black !important;
  }

  span .anticon.anticon-close {
    color: black !important;
  }

  span .ant-select-selection-placeholder {
    color: #bfbfbf;
  }
`;

export const RecordRow = styled.div`
  display: grid;
  grid-template-areas:
    "title title"
    "date time"
    "scene status";
  align-items: center;
  border: 1px solid #525363;
`;
export const RecordStatus = styled.div`
  grid-area: status;
  justify-self: end;
  padding: 0 0.5rem 0.5rem 0rem;
`;
export const RecordTitle = styled.div`
  font-size: 1rem;
  grid-area: title;
  justify-self: start;
  background-color: #525363;
  width: 100%;
  padding: 0.25rem;
  display: flex;
  justify-content: space-between;
`;

export const RecordControlArea = styled.div`
  display: flex;
`;
export const RecordControlButton = styled.div`
  display: grid;
  align-items: center;
  justify-items: center;
  cursor: pointer;
  margin: 0 0.25rem;
`;

export const RecordDate = styled.div`
  grid-area: date;
  justify-self: start;
  padding: 0.5rem;
`;
export const RecordTime = styled.div`
  grid-area: time;
  justify-self: end;
  padding: 0.5rem;
`;
export const RecordScene = styled.div`
  grid-area: scene;
  justify-self: start;
  padding: 0 0 0.5rem 0.5rem;
`;

export const TabArea = styled.div`
  display: flex;
  user-select: none;
  width: 100%;
`;

export const TabHeader = styled.div`
  width: 10rem;
  justify-self: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: ${(props) => (props.highlight ? "#3c3e50" : "#676977")};
  &:hover {
    background-color: #525363;
  }
`;

export const ScheduleListRoot = styled.div`
  border: 1px solid #555555;
  user-select: none;
  margin: 0 0 1rem 0;
`;

export const ScheduleListHeader = styled.div`
  font-size: 1rem;
  background-color: #555555;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
`;

export const ScheduleListBody = styled.div`
  padding: 0.5rem;
  display: grid;
  grid-gap: 0.5rem;
`;
