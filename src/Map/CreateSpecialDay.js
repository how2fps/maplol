import React, { useState } from "react";
import {
  CreateSpecialDayBody,
  CreateSpecialDayRoot,
  CreateSpecialDayFooter,
  CreateSpecialDayButton,
  CreateSpecialDayHeader,
  FormInputRow,
  FormInputRowInput,
  FormInputRowLabel,
  CustomSelect,
} from "./styled";
import { DatePicker, Input, Select } from "antd";
import { TimePicker } from "antd";
import { Icon } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";

const { Option } = Select;

function CreateSpecialDay(props) {
  const {
    selectedMap,
    scheduleList,
    addToScheduleList,
    removeFromScheduleList,
  } = props;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [selectScene, setSelectScene] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const onTitleChange = (value) => {
    setTitle(value.target.value);
  };

  const onDateSelect = (value) => {
    setDate(value);
  };

  const onStartTimeSelect = (value) => {
    setStartTime(value);
  };

  const onEndTimeSelect = (value) => {
    setEndTime(value);
  };

  const onSceneSelect = (value) => {
    setSelectScene(value);
  };

  const clearForm = () => {
    setTitle("");
    setDate();
    setStartTime();
    setEndTime();
    setSelectScene();
  };

  const toggleShowForm = () => {
    setShowForm(!showForm);
  };

  const onCreate = () => {
    const eventObject = {
      id: uuidv4(),
      title,
      date,
      startTime,
      endTime,
      selectScene,
      map: selectedMap.Name,
      type: "SPECIAL",
    };
    addToScheduleList(eventObject);
    clearForm();
    toggleShowForm();
  };

  return (
    <CreateSpecialDayRoot>
      <CreateSpecialDayHeader>
        <div>Create Special Day</div>
        <Icon style={{ cursor: "pointer" }} onClick={toggleShowForm}>
          {showForm ? "remove" : "add"}
        </Icon>
      </CreateSpecialDayHeader>
      {showForm && (
        <div>
          <CreateSpecialDayBody>
            <FormInputRow>
              <FormInputRowLabel>Title :</FormInputRowLabel>
              <FormInputRowInput>
                <Input
                  placeholder=""
                  value={title}
                  style={{ width: "100%" }}
                  onChange={onTitleChange}
                />
              </FormInputRowInput>
            </FormInputRow>
            <FormInputRow>
              <FormInputRowLabel>Date :</FormInputRowLabel>
              <FormInputRowInput>
                <DatePicker
                  placeholder=""
                  value={date}
                  style={{ width: "100%" }}
                  onSelect={onDateSelect}
                />
              </FormInputRowInput>
            </FormInputRow>
            <FormInputRow>
              <FormInputRowLabel>Start Time :</FormInputRowLabel>
              <FormInputRowInput>
                <TimePicker
                  placeholder=""
                  value={startTime}
                  style={{ width: "100%" }}
                  onSelect={onStartTimeSelect}
                  use12Hours
                  showNow
                  format="hh:mm a"
                  minuteStep={10}
                />
              </FormInputRowInput>
            </FormInputRow>
            <FormInputRow>
              <FormInputRowLabel>End Time :</FormInputRowLabel>
              <FormInputRowInput>
                <TimePicker
                  placeholder=""
                  value={endTime}
                  style={{ width: "100%" }}
                  onSelect={onEndTimeSelect}
                  use12Hours
                  showNow
                  format="hh:mm a"
                  minuteStep={10}
                />
              </FormInputRowInput>
            </FormInputRow>
            <FormInputRow>
              <FormInputRowLabel>Scene :</FormInputRowLabel>
              <FormInputRowInput>
                <CustomSelect
                  placeholder=""
                  value={selectScene}
                  onChange={onSceneSelect}
                  stlye={{ color: "black" }}
                  style={{ width: "100%" }}>
                  <Option value="Scene 1" label="Scene 1" />
                  <Option value="Scene 2" label="Scene 1" />
                  <Option value="Scene 3" label="Scene 1" />
                  <Option value="Scene 4" label="Scene 1" />
                  <Option value="Scene 5" label="Scene 1" />
                </CustomSelect>
              </FormInputRowInput>
            </FormInputRow>
          </CreateSpecialDayBody>
          <CreateSpecialDayFooter>
            <CreateSpecialDayButton onClick={onCreate}>
              Create
            </CreateSpecialDayButton>
          </CreateSpecialDayFooter>
        </div>
      )}
    </CreateSpecialDayRoot>
  );
}
export default CreateSpecialDay;
