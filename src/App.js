import { Route, Routes } from "react-router-dom";

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
      </Routes>
    </div>
  );
}
export default App;
