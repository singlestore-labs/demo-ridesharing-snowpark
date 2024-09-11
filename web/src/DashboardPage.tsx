import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import {
  BACKEND_URL,
  CITY_COORDINATES,
  EN_ROUTE_COLOR,
  MAPBOX_TOKEN,
  SINGLESTORE_PURPLE_500,
  SINGLESTORE_PURPLE_700,
  WAITING_FOR_PICKUP_COLOR,
} from "@/consts/config";
import axios from "axios";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import Header from "./components/header";
import {
  setDriverLatency,
  setDrivers,
  setRiderLatency,
  setRiders,
  useCity,
  useDatabase,
  useRefreshInterval,
} from "@/lib/store";
import { Toolbar } from "./components/toolbar";
import { CurrentTripStatus } from "./components/dashboard/current-trip-status";
import MapLegend from "./components/dashboard/map-legend";
mapboxgl.accessToken = MAPBOX_TOKEN;

function DashboardPage() {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const initialLat = 50;
  const initialLong = 50;

  const refreshInterval = useRefreshInterval();
  const selectedCity = useCity();
  const selectedDatabase = useDatabase();
  const { theme } = useTheme();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        theme === "dark"
          ? "mapbox://styles/mapbox/dark-v10"
          : "mapbox://styles/mapbox/light-v10",
      center: [initialLat, initialLong],
      zoom: 0,
      attributionControl: false,
    });
  });

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(
        theme === "dark"
          ? "mapbox://styles/mapbox/dark-v10"
          : "mapbox://styles/mapbox/light-v10",
      );
    }
  }, [theme]);

  useEffect(() => {
    flyTo(selectedCity);
  }, [selectedCity]);

  const flyTo = (city: string) => {
    let coordinates = [0, 0];
    let zoom = 12;

    if (city in CITY_COORDINATES) {
      coordinates =
        CITY_COORDINATES[city as keyof typeof CITY_COORDINATES].coordinates;
      zoom = CITY_COORDINATES[city as keyof typeof CITY_COORDINATES].zoom;
    } else {
      coordinates = [-122.18963, 37.56951];
      zoom = 9.5;
    }

    if (map.current) {
      map.current.flyTo({
        center: [coordinates[0], coordinates[1]],
        zoom: zoom,
        duration: 2000,
      });
    }
  };

  const refreshData = useCallback(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getRiders(), getDrivers()]);
      } catch (error) {
        toast.error("Error refreshing data");
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, selectedCity, selectedDatabase]);

  useEffect(() => {
    const cleanup = refreshData();
    return cleanup;
  }, [refreshData]);

  const getData = async (endpoint: string) => {
    const cityParam = selectedCity === "All" ? "" : selectedCity;
    try {
      const response = await axios.get(
        `${BACKEND_URL}/${endpoint}?db=${selectedDatabase}&city=${cityParam}`,
      );
      const latencyHeader = response.headers["x-query-latency"];
      if (latencyHeader) {
        if (endpoint === "riders") {
          setRiderLatency(parseInt(latencyHeader));
        } else if (endpoint === "drivers") {
          setDriverLatency(parseInt(latencyHeader));
        }
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    }
  };

  const createGeoJSON = (data: any[], status: string) => ({
    type: "FeatureCollection",
    features: data
      .filter((item) => item.status === status)
      .map((item) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.location_long, item.location_lat],
        },
        properties: {
          id: item.id,
          name: `${item.first_name} ${item.last_name}`,
        },
      })),
  });

  const updateMapLayer = (
    map: mapboxgl.Map,
    layerId: string,
    geojson: any,
    color: string,
  ) => {
    if (map.getSource(layerId)) {
      // Update existing source
      (map.getSource(layerId) as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      // Add new source and layer
      map.addSource(layerId, {
        type: "geojson",
        data: geojson as mapboxgl.GeoJSONSourceOptions["data"],
      });

      map.addLayer({
        id: layerId,
        type: "circle",
        source: layerId,
        paint: {
          "circle-radius": 6,
          "circle-color": color,
        },
      });
    }
  };

  const getRiders = async () => {
    if (!map.current) return;

    const riders = (await getData("riders")) || [];
    setRiders(riders);

    const requestedRiders = createGeoJSON(riders, "requested");
    updateMapLayer(
      map.current,
      "riders-requested",
      requestedRiders,
      SINGLESTORE_PURPLE_500,
    );

    const waitingRiders = createGeoJSON(riders, "waiting");
    updateMapLayer(
      map.current,
      "riders-waiting",
      waitingRiders,
      WAITING_FOR_PICKUP_COLOR,
    );
  };

  const getDrivers = async () => {
    if (!map.current) return;

    const drivers = (await getData("drivers")) || [];
    setDrivers(drivers);

    const availableDrivers = createGeoJSON(drivers, "available");
    updateMapLayer(
      map.current,
      "drivers-available",
      availableDrivers,
      SINGLESTORE_PURPLE_700,
    );

    const inProgressDrivers = createGeoJSON(drivers, "in_progress");
    updateMapLayer(
      map.current,
      "drivers-in-progress",
      inProgressDrivers,
      EN_ROUTE_COLOR,
    );
  };

  return (
    <div className="relative h-screen w-screen">
      <div className="absolute left-0 top-0 z-10 flex w-full flex-col items-start gap-4 p-4">
        <Header currentPage="dashboard" />
        <CurrentTripStatus refreshInterval={refreshInterval} />
      </div>
      <div className="absolute bottom-4 left-4 z-10">
        <MapLegend />
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <Toolbar />
      </div>
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}

export default DashboardPage;
