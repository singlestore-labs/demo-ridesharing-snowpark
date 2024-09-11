import { setRefreshInterval, useRefreshInterval } from "@/lib/store";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModeToggle } from "@/components/mode-toggle";

export const Toolbar = () => {
  const refreshInterval = useRefreshInterval();

  return (
    <div className="flex items-center gap-2">
      <Card className="p-2">
        <div className="flex items-center gap-2">
          <p>Refresh Interval:</p>
          <Select
            onValueChange={(value) => setRefreshInterval(Number(value))}
            value={refreshInterval.toString()}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Refresh Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1s</SelectItem>
              <SelectItem value="5000">5s</SelectItem>
              <SelectItem value="10000">10s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
      <ModeToggle />
    </div>
  );
};
