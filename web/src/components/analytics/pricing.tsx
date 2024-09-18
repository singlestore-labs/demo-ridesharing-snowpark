import { BACKEND_URL } from "@/consts/config";
import { Card } from "@/components/ui/card";
import { useCity, useDatabase, useRefreshInterval } from "@/lib/store";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DatabaseResultLabel } from "@/components/ui/database-result-label";

interface PricingStats {
  multiplier: number;
  last_minute_requests: number;
  avg_requests_per_minute: number;
  percent_change: number;
}

export default function Pricing() {
  const database = useDatabase();
  const city = useCity();
  const refreshInterval = useRefreshInterval();

  const [pricingStats, setPricingStats] = useState<PricingStats | null>(null);
  const [latency, setLatency] = useState(0);

  const getPricingStats = useCallback(async () => {
    if (database !== "both") return;
    const cityParam = city === "All" ? "" : city;
    if (cityParam === "") return;
    setLatency(0);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/pricing?city=${cityParam}`,
      );
      setPricingStats(response.data);
      // Set the percent change in the pricing stats
      setPricingStats({
        ...response.data,
        percent_change:
          (response.data.last_minute_requests /
            response.data.avg_requests_per_minute) *
          100,
      });
      const latencyHeader = response.headers["x-query-latency"];
      if (latencyHeader) {
        setLatency(parseInt(latencyHeader));
      }
    } catch (error) {
      console.error("Error fetching trip statistics:", error);
    }
  }, [city, database]);

  useEffect(() => {
    getPricingStats();
    const intervalId = setInterval(getPricingStats, refreshInterval);
    return () => clearInterval(intervalId);
  }, [getPricingStats, refreshInterval]);

  if (database !== "both")
    return (
      <div>
        <div className="flex flex-row items-center justify-between">
          <h4>Pricing Recommendation</h4>
        </div>
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-row flex-wrap gap-4">
            <Card className="flex flex-col items-center justify-center p-4">
              <p>
                Enable both SingleStore and Snowflake to view real-time pricing
                recommendations
              </p>
            </Card>
          </div>
        </div>
      </div>
    );

  if (city === "All")
    return (
      <div>
        <div className="flex flex-row items-center justify-between">
          <h4>Pricing Recommendation</h4>
        </div>
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-row flex-wrap gap-4">
            <Card className="flex flex-col items-center justify-center p-4">
              <p>Select a city to view real-time pricing recommendations</p>
            </Card>
          </div>
        </div>
      </div>
    );

  if (!pricingStats)
    return (
      <div>
        <div className="flex flex-row items-center justify-between">
          <h4>Pricing Recommendation</h4>
          <DatabaseResultLabel database={"singlestore"} latency={latency} />
        </div>
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-row flex-wrap gap-4">
            <Card className="flex flex-col items-center justify-center p-4">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col items-center justify-center">
                  <Skeleton className="h-[20px] w-[100px] rounded-full" />
                  <Skeleton className="mt-4 h-[20px] w-[130px] rounded-full" />
                </div>
                <div className="ml-4 flex flex-col items-start justify-center gap-2">
                  <Skeleton className="h-[20px] w-[200px] rounded-full" />
                  <Skeleton className="h-[20px] w-[300px] rounded-full" />
                  <Skeleton className="h-[20px] w-[250px] rounded-full" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <h4>Pricing Recommendation</h4>
        <DatabaseResultLabel database={"singlestore"} latency={latency} />
      </div>
      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-row flex-wrap gap-4">
          <Card className="flex flex-col items-center justify-center p-4">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col items-center justify-center">
                <h1 className="font-bold">x{pricingStats?.multiplier}</h1>
                <p
                  className="mt-2 font-medium"
                  style={{
                    color:
                      pricingStats?.percent_change <= 115
                        ? "#4CAF50"
                        : pricingStats?.percent_change <= 150
                          ? "#FFA500"
                          : pricingStats?.percent_change <= 225
                            ? "#FF4500"
                            : "#FF0000",
                  }}
                >
                  {pricingStats?.percent_change <= 115
                    ? "Normal Demand"
                    : pricingStats?.percent_change <= 150
                      ? "Moderate Demand"
                      : pricingStats?.percent_change <= 225
                        ? "High Demand"
                        : "Extreme Demand"}
                </p>
              </div>
              <div className="ml-4 flex flex-col items-start justify-center">
                <p>
                  <span className="text-lg font-bold text-singlestore-purple">
                    {pricingStats.last_minute_requests}
                  </span>{" "}
                  ride requests in the last minute
                </p>
                <p>
                  <span className="text-lg font-bold text-snowflake-blue">
                    {pricingStats.avg_requests_per_minute.toFixed(0)}
                  </span>{" "}
                  average requests per minute this week
                </p>
                <p>
                  <span
                    className={`font-bold ${pricingStats.percent_change > 100 ? "text-green-500" : "text-red-500"}`}
                  >
                    {pricingStats.percent_change > 100 ? "+" : "-"}
                    {Math.abs(pricingStats.percent_change - 100).toFixed(1)}%
                  </span>{" "}
                  {pricingStats.percent_change > 100 ? "increase" : "decrease"}{" "}
                  in demand
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
