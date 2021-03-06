import React, { useState } from "react";

import CreateSchedule from "./CreateSchedule";
import CreateSpecialDay from "./CreateSpecialDay";
import ScheduleList from "./ScheduleList";
import { TabArea, TabHeader } from "./styled";

function SceneMain(props) {
  const {
    scheduleClipboard,
    addToScheduleClipboard,
    pasteScheduleClipboard,
    selectedMap,
  } = props;
  const [showSpecialDay, setShowSpecialDay] = useState(false);
  const [scheduleList, setScheduleList] = useState([]);
  const addToScheduleList = (schedule) => {
    setScheduleList([schedule, ...scheduleList]);
  };

  const removeFromScheduleList = (schedule) => {
    setScheduleList(scheduleList.filter((item) => item.id !== schedule.id));
  };
  const showNormal = () => {
    setShowSpecialDay(false);
  };

  const showSpecial = () => {
    setShowSpecialDay(true);
  };

  return (
    <div>
      <TabArea>
        <TabHeader highlight={showSpecialDay === false} onClick={showNormal}>
          Normal Schedule
        </TabHeader>
        <TabHeader highlight={showSpecialDay === true} onClick={showSpecial}>
          Special Day
        </TabHeader>
      </TabArea>
      {!showSpecialDay ? (
        <CreateSchedule
          selectedMap={selectedMap}
          scheduleList={scheduleList}
          removeFromScheduleList={removeFromScheduleList}
          addToScheduleList={addToScheduleList}
        />
      ) : (
        <CreateSpecialDay
          selectedMap={selectedMap}
          scheduleList={scheduleList}
          removeFromScheduleList={removeFromScheduleList}
          addToScheduleList={addToScheduleList}
        />
      )}
      <ScheduleList
        scheduleClipboard={scheduleClipboard}
        addToScheduleClipboard={addToScheduleClipboard}
        pasteScheduleClipboard={pasteScheduleClipboard}
        showSpecialDay={showSpecialDay}
        selectedMap={selectedMap}
        scheduleList={scheduleList}
        removeFromScheduleList={removeFromScheduleList}
        addToScheduleList={addToScheduleList}
      />
    </div>
  );
}
export default SceneMain;
