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

export default function TripsDailyChart() {
  const database = useDatabase();
  const [databaseParam, setDatabaseParam] = useState("snowflake");
  const city = useCity();
  const [latency, setLatency] = useState(0);
  const [chartData, setChartData] = useState([]);
  const refreshInterval = useRefreshInterval();

  useEffect(() => {
    setDatabaseParam(database === "both" ? "snowflake" : database);
  }, [database]);

  const getData = useCallback(async () => {
    setLatency(0);
    const databaseParam = database === "both" ? "snowflake" : database;
    const cityParam = city === "All" ? "" : city;
    try {
      const response = await axios.get(
        `${BACKEND_URL}/trips/last/week?db=${databaseParam}&city=${cityParam}`,
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
      const dailyData: { [day: string]: number } = {};
      for (let i = 0; i <= 7; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = format(date, "yyyy-MM-dd");
        dailyData[dayKey] = 0;
      }

      data.forEach((item: any) => {
        if (item.daily_interval in dailyData) {
          dailyData[item.daily_interval] = item.trip_count;
        }
      });

      const formattedData = Object.entries(dailyData).map(
        ([dayKey, trips]) => ({
          day: dayKey,
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
        databaseParam === "snowflake" ? SNOWFLAKE_BLUE : SINGLESTORE_PURPLE_700,
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-[400px] w-[600px]">
      <div className="flex flex-row items-center justify-between p-2">
        <h4>Ride requests per day</h4>
        <DatabaseResultLabel database={databaseParam} latency={latency} />
      </div>
      <ChartContainer config={chartConfig} className="h-full w-full pb-10 pr-4">
        <BarChart data={chartData}>
          <XAxis
            dataKey="day"
            label={{ value: "Day", position: "bottom" }}
            tickFormatter={(tick) => {
              const [year, month, day] = tick.split("-");
              return format(
                new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
                "M/d",
              );
            }}
            interval={0}
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
                labelFormatter={(value) => {
                  const [year, month, day] = value.split("-");
                  return format(
                    new Date(
                      parseInt(year),
                      parseInt(month) - 1,
                      parseInt(day),
                    ),
                    "M/d",
                  );
                }}
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
