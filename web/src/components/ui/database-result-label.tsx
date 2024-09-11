import { SINGLESTORE_PURPLE_500 } from "@/consts/config";
import { SnowflakeSmallLogo } from "../logo/snowflake-small";
import { SingleStoreSmallLogo } from "../logo/singlestore-small";
import { getLatencyString } from "@/lib/utils";

export interface DatabaseResultLabelProps {
  database: string;
  latency: number;
}

export function DatabaseResultLabel({
  database,
  latency,
}: DatabaseResultLabelProps) {
  // const getDatabaseString = (database: string) => {
  //   if (database === "snowflake") {
  //     return "Snowflake";
  //   } else if (database === "singlestore") {
  //     return "SingleStore";
  //   }
  // };

  const getDatabaseLogo = (database: string) => {
    if (database === "snowflake") {
      return <SnowflakeSmallLogo size={18} />;
    } else if (database === "singlestore") {
      return <SingleStoreSmallLogo size={18} />;
    }
  };

  const getDatabaseColor = (database: string) => {
    if (database === "snowflake") {
      return "#29B5E8";
    } else if (database === "singlestore") {
      return SINGLESTORE_PURPLE_500;
    }
  };

  const LoadingIndicator = () => {
    return (
      <div className="mx-1 inline-flex animate-spin items-center text-gray-400">
        {getDatabaseLogo(database)}
      </div>
    );
  };

  if (latency === 0) {
    return LoadingIndicator();
  }

  return (
    <p className="flex flex-row items-center text-sm text-gray-400">
      <div
        style={{ color: getDatabaseColor(database) }}
        className="mx-1 inline-flex items-center"
      >
        {getDatabaseLogo(database)}
      </div>
      {getLatencyString(latency)}
    </p>
  );
}
