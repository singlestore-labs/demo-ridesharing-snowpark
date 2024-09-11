import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import {
  BACKEND_URL,
  EN_ROUTE_COLOR,
  SINGLESTORE_PURPLE_500,
  SINGLESTORE_PURPLE_700,
  WAITING_FOR_PICKUP_COLOR,
} from "@/consts/config";
import { toast } from "sonner";
import { useCity, useDatabase } from "@/lib/store";
import { DatabaseResultLabel } from "../ui/database-result-label";
import { Skeleton } from "../ui/skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

interface TripStats {
  drivers_available: number;
  drivers_in_progress: number;
  riders_idle: number;
  riders_in_progress: number;
  riders_requested: number;
  riders_waiting: number;
  trips_accepted: number;
  trips_en_route: number;
  trips_requested: number;
}

interface CurrentTripStatusProps {
  refreshInterval: number;
}

export function CurrentTripStatus({ refreshInterval }: CurrentTripStatusProps) {
  const database = useDatabase();
  const city = useCity();

  const [tripStats, setTripStats] = useState<TripStats | null>(null);
  const [latency, setLatency] = useState(0);

  const refreshData = useCallback(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getTripStats()]);
      } catch (error) {
        toast.error("Error refreshing trip stats");
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, database, city]);

  useEffect(() => {
    const cleanup = refreshData();
    return cleanup;
  }, [refreshData]);

  const getTripStats = async () => {
    setLatency(0);
    const cityParam = city === "All" ? "" : city;
    const response = await axios.get(
      `${BACKEND_URL}/trips/current/status?db=${database}&city=${cityParam}`,
    );
    setTripStats(response.data);
    const latencyHeader = response.headers["x-query-latency"];
    if (latencyHeader) {
      setLatency(parseInt(latencyHeader));
    }
  };

  if (!tripStats)
    return (
      <div>
        <div className="flex flex-row items-center justify-between">
          <h4>Lifetime Statistics</h4>
          <DatabaseResultLabel database={database} latency={latency} />
        </div>
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-row flex-wrap gap-4">
            {[1, 2, 3, 4].map((_, index) => (
              <Card
                key={index}
                className="flex flex-col items-center justify-center p-4"
              >
                <Skeleton className="h-[20px] w-[100px] rounded-full" />
                <Skeleton className="mt-4 h-[20px] w-[130px] rounded-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-row items-center gap-2">
          <FontAwesomeIcon
            icon={faCircle}
            size="sm"
            className="animate-pulse text-red-400"
          />
          <h4>Live Ride Status</h4>
        </div>
        <DatabaseResultLabel database={database} latency={latency} />
      </div>
      <div className="flex flex-wrap gap-4">
        <Card className="flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-bold">{tripStats.drivers_available}</h1>
          <p
            className="mt-2 font-medium"
            style={{ color: SINGLESTORE_PURPLE_700 }}
          >
            Drivers Available
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-bold">{tripStats.trips_requested}</h1>
          <p
            className="mt-2 font-medium"
            style={{ color: SINGLESTORE_PURPLE_500 }}
          >
            Rides Requested
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-bold">{tripStats.trips_accepted}</h1>
          <p
            className="mt-2 font-medium"
            style={{ color: WAITING_FOR_PICKUP_COLOR }}
          >
            Waiting for Pickup
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-bold">
            {tripStats.drivers_in_progress}
          </h1>
          <p className="mt-2 font-medium" style={{ color: EN_ROUTE_COLOR }}>
            In Progress
          </p>
        </Card>
      </div>
    </div>
  );
}
