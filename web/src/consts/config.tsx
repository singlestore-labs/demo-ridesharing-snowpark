export const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiYmhhcmF0MTAzMSIsImEiOiJja3JtbGM0eTM3dXZnMnZtZjFudW5rbGF0In0.tt92RoFtBcmGqoQOchCoag";

export const BACKEND_URL = (() => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  const currentUrl = new URL(window.location.href);
  return `${currentUrl.protocol}//${currentUrl.host}/api`;
})();

export const SINGLESTORE_PURPLE_500 = "#D199FF";
export const SINGLESTORE_PURPLE_700 = "#820DDF";
export const SINGLESTORE_PURPLE_900 = "#360061";

export const WAITING_FOR_PICKUP_COLOR = "#aaa0ad";
export const EN_ROUTE_COLOR = "#5ccc7a";

export const SNOWFLAKE_BLUE = "#29B5E8";

export const CITY_COORDINATES = {
  "San Francisco": {
    coordinates: [-122.44489106138639, 37.7655327257536],
    zoom: 12,
  },
  "San Jose": {
    coordinates: [-121.8854, 37.3382],
    zoom: 11,
  },
  Hayward: {
    coordinates: [-122.07408030954923, 37.643414311082054],
    zoom: 12,
  },
  Oakland: {
    coordinates: [-122.2256858256691, 37.788278490903224],
    zoom: 12,
  },
  Fremont: {
    coordinates: [-121.97896721277118, 37.53033995465623],
    zoom: 11.7,
  },
  "Mountain View": {
    coordinates: [-122.09290022033113, 37.402090374420396],
    zoom: 12,
  },
  "Union City": {
    coordinates: [-122.04946512596284, 37.593300408226284],
    zoom: 12.5,
  },
  "San Mateo": {
    coordinates: [-122.34422952423972, 37.566941906560615],
    zoom: 12,
  },
  Cupertino: {
    coordinates: [-122.03527620881187, 37.323443146952],
    zoom: 12.7,
  },
  Sunnyvale: {
    coordinates: [-122.02780065498258, 37.386647381843744],
    zoom: 12.3,
  },
  "Daly City": {
    coordinates: [-122.44878092119208, 37.68046279468608],
    zoom: 12,
  },
  "San Bruno": {
    coordinates: [-122.41188417340938, 37.618034499597115],
    zoom: 12.7,
  },
  "San Leandro": {
    coordinates: [-122.14540897056455, 37.70300059923535],
    zoom: 12.3,
  },
  Milpitas: {
    coordinates: [-121.89982992178821, 37.438325995677],
    zoom: 12.9,
  },
  "Palo Alto": {
    coordinates: [-122.15255349997172, 37.453244796379764],
    zoom: 12,
  },
  "Redwood City": {
    coordinates: [-122.25641966956695, 37.495867739922744],
    zoom: 12,
  },
  "Santa Clara": {
    coordinates: [-121.97311247661523, 37.37618105669968],
    zoom: 12.3,
  },
};
