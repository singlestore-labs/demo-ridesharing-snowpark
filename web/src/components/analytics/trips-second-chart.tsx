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

export default function TripsSecondChart() {
  const database = useDatabase();
  const [databaseParam, setDatabaseParam] = useState("snowflake");
  const city = useCity();
  const [latency, setLatency] = useState(0);
  const [chartData, setChartData] = useState([]);
  const refreshInterval = useRefreshInterval();

  const chartInterval = 5;

  useEffect(() => {
    setDatabaseParam(database === "both" ? "singlestore" : database);
  }, [database]);

  const getData = useCallback(async () => {
    setLatency(0);
    const databaseParam = database === "both" ? "singlestore" : database;
    const cityParam = city === "All" ? "" : city;
    try {
      const response = await axios.get(
        `${BACKEND_URL}/trips/last/interval?db=${databaseParam}&city=${cityParam}&interval=${chartInterval}`,
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
      console.log(data);
      const intervalData: { [interval: string]: number } = {};
      // Calculate the start of the current interval
      const currentIntervalStart = new Date(
        Math.floor(now.getTime() / (chartInterval * 1000)) *
          (chartInterval * 1000),
      );

      for (let i = 1; i < 30; i++) {
        const date = new Date(
          currentIntervalStart.getTime() - i * chartInterval * 1000,
        );
        const intervalKey = format(date, "yyyy-MM-dd HH:mm:ss");
        intervalData[intervalKey] = 0;
      }

      console.log(intervalData);

      data.forEach((item: any) => {
        const localDate = fromZonedTime(new Date(item.interval_start), "UTC");
        const intervalKey = format(localDate, "yyyy-MM-dd HH:mm:ss");
        if (intervalKey in intervalData) {
          intervalData[intervalKey] = item.trip_count;
        }
      });

      const formattedData = Object.entries(intervalData).map(
        ([intervalKey, trips]) => ({
          interval_start: intervalKey,
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

  const getYAxisDomain = useCallback(() => {
    const maxTime = Math.max(...chartData.map((item: any) => item.trips));
    return [0, Math.ceil(maxTime * 1.1)];
  }, [chartData]);

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
        <h4>Ride requests per {chartInterval} second interval</h4>
        <DatabaseResultLabel database={databaseParam} latency={latency} />
      </div>
      <ChartContainer config={chartConfig} className="h-full w-full pb-10 pr-4">
        <BarChart data={chartData}>
          <XAxis
            dataKey="interval_start"
            label={{ value: "Minute", position: "bottom" }}
            tickFormatter={(tick) => format(new Date(tick), "h:mm:ss a")}
          />
          <YAxis
            dataKey="trips"
            tickFormatter={(tick) => {
              return tick.toLocaleString();
            }}
            domain={getYAxisDomain()}
          />
          <Bar dataKey="trips" fill="var(--color-trips)" radius={4} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => format(new Date(value), "h:mm:ss a")}
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
