import Header from "@/components/header";
import TotalStatistics from "@/components/analytics/total-statistics";
import TodayStatistics from "@/components/analytics/today-statistics";
import TripsHourlyChart from "@/components/analytics/trips-hourly-chart";
import TripsDailyChart from "@/components/analytics/trips-daily-chart";
import TripsMinuteChart from "@/components/analytics/trips-minute-chart";
import WaitTimeDailyChart from "@/components/analytics/wait-time-daily-chart";
import WaitTimeHourlyChart from "@/components/analytics/wait-time-hourly-chart";
import WaitTimeMinuteChart from "@/components/analytics/wait-time-minute-chart";
import { Toolbar } from "@/components/toolbar";

const AnalyticsPage = () => {
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      <div className="flex w-full flex-col items-start gap-4 p-4">
        <Header currentPage="analytics" />
      </div>
      <div className="flex w-full flex-col items-start gap-4 px-4">
        <TodayStatistics />
        <TotalStatistics />
      </div>
      <div className="flex flex-col items-start p-4">
        <h4>Trends</h4>
      </div>
      <div className="flex flex-wrap items-center gap-4 px-4 pb-20">
        <TripsMinuteChart />
        <TripsHourlyChart />
        <TripsDailyChart />
        <WaitTimeMinuteChart />
        <WaitTimeHourlyChart />
        <WaitTimeDailyChart />
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <Toolbar />
      </div>
    </div>
  );
};

export default AnalyticsPage;
