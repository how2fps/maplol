export const computeToPixels = (map) => {
  const StartLAT = 1.3945;
  const StartLONG = 103.904352;
  const EndLAT = 1.393899;
  const EndLONG = 103.905355;
  const TEndLONG = map.long;
  const TEndLAT = map.lat;

  const X1 =
    Math.cos((EndLAT * Math.PI) / 180) *
    Math.sin(((EndLONG - StartLONG) * Math.PI) / 180);
  const Y1 =
    Math.cos((StartLAT * Math.PI) / 180) * Math.sin((EndLAT * Math.PI) / 180) -
    Math.sin((StartLAT * Math.PI) / 180) *
      Math.cos((EndLAT * Math.PI) / 180) *
      Math.cos(((EndLONG - StartLONG) * Math.PI) / 180);
  const Angle1 = Math.atan2(X1, Y1);
  const Angle1N = Angle1 * 57;

  const X2 =
    Math.cos((TEndLAT * Math.PI) / 180) *
    Math.sin(((TEndLONG - StartLONG) * Math.PI) / 180);
  const Y2 =
    Math.cos((StartLAT * Math.PI) / 180) * Math.sin((TEndLAT * Math.PI) / 180) -
    Math.sin((StartLAT * Math.PI) / 180) *
      Math.cos((TEndLAT * Math.PI) / 180) *
      Math.cos(((TEndLONG - StartLONG) * Math.PI) / 180);
  const Angle2 = Math.atan2(X2, Y2);
  const Angle2N = Angle2 * 57;

  const AngleBetween = Angle2N - Angle1N;
  const AngleBetweenRad = (AngleBetween * Math.PI) / 180;
  const EarthRadius = 6371000;
  const Lat1 = (StartLAT * Math.PI) / 180;
  const Lat2 = (TEndLAT * Math.PI) / 180;
  const DeltaLat = Lat2 - Lat1;
  const DeltaLong = ((TEndLONG - StartLONG) * Math.PI) / 180;
  const a =
    Math.sin(DeltaLat / 2) * Math.sin(DeltaLat / 2) +
    Math.cos(Lat1) *
      Math.cos(Lat2) *
      Math.sin(DeltaLong / 2) *
      Math.sin(DeltaLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const Distance = c * EarthRadius;
  const scaleFactor = 26 / 10;

  let newLat = Distance * Math.cos(AngleBetweenRad) * scaleFactor;
  newLat = 500 - newLat;
  const newLong = Distance * Math.sin(AngleBetweenRad) * scaleFactor;

  return [newLat, newLong];
};

export const listOfZones = [
  { name: "Small Room", long: 103.904141, lat: 1.393211 },
  { name: "Sick Bay", long: 103.904131, lat: 1.393023 },
  { name: "HOD", long: 103.904131, lat: 1.393131 },
  { name: "VP Room", long: 103.904001, lat: 1.392993 },
  { name: "Principal Room", long: 103.90395, lat: 1.393053 },
  { name: "Conference Room", long: 103.904051, lat: 1.393191 },
];

// const bounds = new LatLngBounds([0, 500], [500, 0]);
