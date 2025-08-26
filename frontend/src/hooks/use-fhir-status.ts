import { useQuery } from "@tanstack/react-query";

interface FHIRConnection {
  connected: boolean;
  latency?: number;
}

interface FHIRSyncStatus {
  patients: {
    total: number;
    synced: number;
    pending: number;
  };
  observations: {
    total: number;
    synced: number;
    pending: number;
  };
  encounters: {
    total: number;
    synced: number;
    pending: number;
  };
  lastSync: string;
}

interface FHIRStatus {
  connection: FHIRConnection;
  sync: FHIRSyncStatus;
}

export function useFHIRStatus() {
  return useQuery<FHIRStatus>({
    queryKey: ["/api/fhir/status"],
    refetchInterval: 60000, // Refetch every minute
  });
}
