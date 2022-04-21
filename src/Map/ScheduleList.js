import React from 'react';
import {
    ScheduleListBody,
    ScheduleListRoot,
    ScheduleListHeader,
    RecordRow,
    RecordDate,
    RecordScene,
    RecordTime,
    RecordTitle,
    RecordStatus,
    RecordControlArea,
    RecordControlButton,
} from './styled';
import { Switch } from 'antd';
import Icon from '@mui/material/Icon';
import { v4 as uuidv4 } from 'uuid';

function ScheduleList(props) {
    const { scheduleClipboard, addToScheduleClipboard, pasteScheduleClipboard, showSpecialDay, selectedMap, scheduleList, addToScheduleList, removeFromScheduleList } = props;

    const pasteFromClipboard = () => {
        pasteScheduleClipboard(selectedMap.Name, uuidv4());
    }

    const copyToClipboard = (schedule) => {
        addToScheduleClipboard(schedule);
    }

    return (
        <ScheduleListRoot>
            <ScheduleListHeader>
                <div>{showSpecialDay ? 'Special Day ' : 'Schedule '} List</div>
                {/* {(scheduleClipboard !== undefined && scheduleClipboard.map !== selectedMap.Name && scheduleClipboard.type === (showSpecialDay ? 'SPECIAL' : 'SCHEDULE')) &&
                    <RecordControlArea>
                        <RecordControlButton onClick={pasteFromClipboard}><Icon>content_paste</Icon></RecordControlButton>
                    </RecordControlArea>
                } */}
            </ScheduleListHeader>
            <ScheduleListBody>
                {scheduleList.filter(item => item.type === (showSpecialDay ? 'SPECIAL' : 'SCHEDULE') && item.map === selectedMap.Name).map((schedule, index) =>
                    <RecordRow key={index}>
                        <RecordTitle>
                            <div>{schedule.title}</div>
                            <RecordControlArea>
                                {/* <RecordControlButton onClick={() => copyToClipboard(Object.assign({}, schedule))}><Icon>content_copy</Icon></RecordControlButton> */}
                                <RecordControlButton onClick={() => removeFromScheduleList(schedule)}><Icon>delete</Icon></RecordControlButton>
                            </RecordControlArea>
                        </RecordTitle>
                        <RecordDate>{showSpecialDay ? schedule.date.format("DD/MM/YYYY") : schedule.date.join(", ")}</RecordDate>
                        <RecordTime>{schedule.startTime.format("hh:mm a")} - {schedule.endTime.format("hh:mm a")}</RecordTime>
                        <RecordScene>{schedule.selectScene}</RecordScene>
                        <RecordStatus><Switch checked /></RecordStatus>
                    </RecordRow>)}
            </ScheduleListBody>
            {(scheduleList.filter(item => item.type === (showSpecialDay ? 'SPECIAL' : 'SCHEDULE') && item.map === selectedMap.Name)).length === 0 && <div style={{ padding: "0 0 1rem 1rem" }}>No {showSpecialDay ? ' Special Day ' : ' Schedule '} Found</div>}
        </ScheduleListRoot>
    );
}
export default ScheduleList;