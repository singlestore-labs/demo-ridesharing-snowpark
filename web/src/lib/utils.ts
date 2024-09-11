import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getLatencyString = (latency: number) => {
  const latencyMs = latency / 1000; // Convert microseconds to milliseconds
  if (latencyMs < 1) {
    return `${latency}µs`;
  } else if (latencyMs < 1000) {
    return `${latencyMs.toFixed(2)}ms`;
  } else if (latencyMs < 60000) {
    return `${(latencyMs / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(latencyMs / 60000);
    const seconds = ((latencyMs % 60000) / 1000).toFixed(2);
    return `${minutes}m ${seconds}s`;
  }
};
