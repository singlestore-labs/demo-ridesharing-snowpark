import { SingleStoreLogo } from "@/components/logo/singlestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BACKEND_URL } from "@/consts/config";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { setCity, setDatabase, useCity, useDatabase } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { SnowflakeSmallLogo } from "./logo/snowflake-small";
import { SingleStoreSmallLogo } from "./logo/singlestore-small";

interface HeaderProps {
  currentPage: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const [cities, setCities] = useState(["San Francisco"]);
  const selectedCity = useCity();
  const database = useDatabase();

  const navigate = useNavigate();

  const getCities = async () => {
    const response = await axios.get(`${BACKEND_URL}/cities?db=${database}`);
    setCities(response.data);
  };

  useEffect(() => {
    getCities();
  }, [database]);

  return (
    <Card className="w-full p-2">
      <div className="flex items-center justify-between gap-2">
        <SingleStoreLogo size={40} />
        <div className="flex items-center gap-2">
          <Button
            variant={currentPage === "dashboard" ? "default" : "ghost"}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant={currentPage === "analytics" ? "default" : "ghost"}
            onClick={() => navigate("/analytics")}
          >
            Analytics
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Card>
            <div className="flex items-center">
              <Button
                className={`rounded-r-none hover:bg-singlestore-purple/50 hover:text-white ${database == "singlestore" ? "bg-singlestore-purple text-white" : "bg-transparent text-gray-400"}`}
                onClick={() => setDatabase("singlestore")}
              >
                <SingleStoreSmallLogo size={24} />
              </Button>
              <Button
                className={`rounded-l-none hover:bg-snowflake-blue/50 hover:text-white ${database === "snowflake" ? "bg-snowflake-blue text-white" : "bg-transparent text-gray-400"}`}
                onClick={() => setDatabase("snowflake")}
              >
                <SnowflakeSmallLogo size={24} />
              </Button>
            </div>
          </Card>
          <Select
            onValueChange={(value) => setCity(value)}
            value={selectedCity}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
