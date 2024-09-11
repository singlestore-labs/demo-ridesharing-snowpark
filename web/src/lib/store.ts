import { Driver } from "@/models/driver";
import { Rider } from "@/models/rider";
import createStore from "react-superstore";

export const [useCity, setCity, getCity] = createStore("San Francisco");
export const [useDatabase, setDatabase, getDatabase] =
  createStore("snowflake");
export const [useRefreshInterval, setRefreshInterval, getRefreshInterval] =
  createStore(5000);

export const [useRiders, setRiders, getRiders] = createStore<Rider[]>([]);
export const [useRiderLatency, setRiderLatency, getRiderLatency] =
  createStore(0);
export const [useDrivers, setDrivers, getDrivers] = createStore<Driver[]>([]);
export const [useDriverLatency, setDriverLatency, getDriverLatency] =
  createStore(0);
