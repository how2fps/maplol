import React, { useState } from "react";

import { TabArea, TabHeader } from "./styled";

export const DeviceStatus = () => {
  const [tab, setTab] = useState("temp");
  return (
    <TabArea>
      <TabHeader highlight={tab} onClick={() => setTab("temp")}>
        Temperature
      </TabHeader>
      <TabHeader highlight={tab} onClick={() => setTab("power")}>
        Power
      </TabHeader>
      <TabHeader highlight={tab} onClick={() => setTab("light")}>
        Light Level
      </TabHeader>
    </TabArea>
  );
};
