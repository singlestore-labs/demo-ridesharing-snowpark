import {
  getDriverLatency,
  getRiderLatency,
  useDatabase,
  useDrivers,
  useRiders,
} from "@/lib/store";
import { Card } from "../ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import {
  SINGLESTORE_PURPLE_500,
  SINGLESTORE_PURPLE_700,
} from "@/consts/config";
import { DatabaseResultLabel } from "../ui/database-result-label";
import { getLatencyString } from "@/lib/utils";

export default function MapLegend() {
  const database = useDatabase();

  const riders = useRiders();
  const drivers = useDrivers();

  const getActiveRiderCount = () => {
    return riders.filter((rider) => rider.status !== "idle").length;
  };

  const getMostRecentRider = () => {
    const sortedRiders = [...riders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const mostRecent = sortedRiders[0];

    return mostRecent;
  };

  const getMostRecentRiderLatency = () => {
    const mostRecentRider = getMostRecentRider();
    if (mostRecentRider) {
      const latency =
        (Date.now() - new Date(mostRecentRider.created_at).getTime()) * 1000;
      return latency;
    }
    return 0;
  };

  const getActiveDriverCount = () => {
    return drivers.filter((driver) => driver.status !== "idle").length;
  };

  const getMostRecentDriver = () => {
    const sortedDrivers = [...drivers].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const mostRecent = sortedDrivers[0];

    return mostRecent;
  };

  const getMostRecentDriverLatency = () => {
    const mostRecentDriver = getMostRecentDriver();
    if (mostRecentDriver) {
      const latency =
        (Date.now() - new Date(mostRecentDriver.created_at).getTime()) * 1000;
      return latency;
    }
    return 0;
  };

  if (riders.length === 0) {
    return <div>No riders</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-[300px] p-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <FontAwesomeIcon
              icon={faCircle}
              size="sm"
              color={SINGLESTORE_PURPLE_500}
            />
            <h4>{getActiveRiderCount()} Riders</h4>
          </div>
          <DatabaseResultLabel
            database={database}
            latency={getRiderLatency()}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <FontAwesomeIcon
            icon={faCircle}
            size="sm"
            className="text-transparent"
          />
          <p className="text-sm text-gray-400">
            Latest update: {getLatencyString(getMostRecentRiderLatency())} ago
          </p>
        </div>
      </Card>
      <Card className="w-[300px] p-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <FontAwesomeIcon
              icon={faCircle}
              size="sm"
              color={SINGLESTORE_PURPLE_700}
            />
            <h4>{getActiveDriverCount()} Drivers</h4>
          </div>
          <DatabaseResultLabel
            database={database}
            latency={getDriverLatency()}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <FontAwesomeIcon
            icon={faCircle}
            size="sm"
            className="text-transparent"
          />
          <p className="text-sm text-gray-400">
            Latest update: {getLatencyString(getMostRecentDriverLatency())} ago
          </p>
        </div>
      </Card>
    </div>
  );
}
