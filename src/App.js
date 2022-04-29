import "antd/dist/antd.css";
import "react-sortable-tree/style.css";

import { Redirect, Route } from "react-router-dom";

import Map from "./DeviceManagement/Map";
import SingaporeMap from "./DeviceManagement/SingaporeMap";

// import DeviceManagement from "./DeviceManagement/JSONFile";
function App() {
  return (
    <div>
      <Route path="/DeviceManagement/:schoolname">
        <Map />
      </Route>
      <Route exact path="/DeviceManagement">
        <SingaporeMap />
      </Route>
      <Route exact path="/">
        <Redirect to={{ pathname: "/DeviceManagement" }} />
      </Route>
    </div>
  );
}
export default App;
