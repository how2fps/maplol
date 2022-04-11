import "leaflet/dist/leaflet.css";

import { useEffect } from "react";

import RivervaleDetails from "./rivervale.json";

function JSONStuff() {
  useEffect(() => {
    console.log(RivervaleDetails[0].ns0__islocationof);
  });
  return <div></div>;
}
export default JSONStuff;
