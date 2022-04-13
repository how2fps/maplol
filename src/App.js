import "react-sortable-tree/style.css";

import { Route, Routes } from "react-router-dom";

import DeviceManagement from "./Map/JSONFile";
import JSONStuff from "./Map/JSONFile";
import Map from "./Map/Map";
import SingaporeMap from "./Map/SingaporeMap";

function App() {
  return (
    <div>
      <div>Header</div>
      <Routes>
        <Route path="/DeviceManagement" element={<SingaporeMap />} />
        <Route path="/DeviceManagement/:schoolName" element={<Map />} />
        <Route path="/" element={<DeviceManagement />} />
      </Routes>
    </div>
  );
}
export default App;
