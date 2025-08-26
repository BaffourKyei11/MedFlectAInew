import { useQuery } from "@tanstack/react-query";

interface AIStatus {
  status: string;
  model: string;
  latency?: number;
}

export function useAIStatus() {
  return useQuery<AIStatus>({
    queryKey: ["/api/ai/status"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
