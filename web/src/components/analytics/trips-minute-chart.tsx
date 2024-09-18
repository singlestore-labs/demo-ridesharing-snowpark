import {
  BACKEND_URL,
  SINGLESTORE_PURPLE_700,
  SNOWFLAKE_BLUE,
} from "@/consts/config";
import { useCity, useDatabase, useRefreshInterval } from "@/lib/store";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { XAxis, YAxis, Bar, BarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { DatabaseResultLabel } from "@/components/ui/database-result-label";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export default function TripsMinuteChart() {
  const database = useDatabase();
  const [databaseParam, setDatabaseParam] = useState("snowflake");
  const city = useCity();
  const [latency, setLatency] = useState(0);
  const [chartData, setChartData] = useState([]);
  const refreshInterval = useRefreshInterval();

  useEffect(() => {
    setDatabaseParam(database === "both" ? "singlestore" : database);
  }, [database]);

  const getData = useCallback(async () => {
    setLatency(0);
    const databaseParam = database === "both" ? "singlestore" : database;
    const cityParam = city === "All" ? "" : city;
    try {
      const response = await axios.get(
        `${BACKEND_URL}/trips/last/hour?db=${databaseParam}&city=${cityParam}`,
      );
      const latencyHeader = response.headers["x-query-latency"];
      if (latencyHeader) {
        setLatency(parseInt(latencyHeader));
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching trip data:", error);
      return [];
    }
  }, [database, city]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();
      const now = new Date();
      const hourlyData: { [hour: string]: number } = {};
      for (let i = 0; i <= 60; i++) {
        const date = new Date(now.getTime() - i * 60 * 1000);
        date.setSeconds(0);
        date.setMilliseconds(0);
        const minuteKey = format(date, "yyyy-MM-dd HH:mm:ss");
        hourlyData[minuteKey] = 0;
      }

      data.forEach((item: any) => {
        const localDate = fromZonedTime(new Date(item.minute_interval), "UTC");
        const minuteKey = format(localDate, "yyyy-MM-dd HH:mm:ss");
        if (minuteKey in hourlyData) {
          hourlyData[minuteKey] = item.trip_count;
        }
      });

      const formattedData = Object.entries(hourlyData).map(
        ([minuteKey, trips]) => ({
          minute: minuteKey,
          trips: trips,
        }),
      );
      formattedData.reverse();
      setChartData(formattedData as any);
    };

    fetchData();
    const intervalId = setInterval(fetchData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [getData, refreshInterval]);

  const chartConfig = {
    trips: {
      label: "Trips",
      color:
        databaseParam === "singlestore"
          ? SINGLESTORE_PURPLE_700
          : SNOWFLAKE_BLUE,
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-[400px] w-[600px]">
      <div className="flex flex-row items-center justify-between p-2">
        <h4>Ride requests per minute</h4>
        <DatabaseResultLabel database={databaseParam} latency={latency} />
      </div>
      <ChartContainer config={chartConfig} className="h-full w-full pb-10 pr-4">
        <BarChart data={chartData}>
          <XAxis
            dataKey="minute"
            label={{ value: "Minute", position: "bottom" }}
            tickFormatter={(tick) => format(new Date(tick), "h:mm a")}
            interval={9}
          />
          <YAxis
            dataKey="trips"
            tickFormatter={(tick) => {
              return tick.toLocaleString();
            }}
          />
          <Bar dataKey="trips" fill="var(--color-trips)" radius={4} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  format(new Date(value), "M/d/yy h:mm a")
                }
              />
            }
            cursor={false}
            defaultIndex={1}
          />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
