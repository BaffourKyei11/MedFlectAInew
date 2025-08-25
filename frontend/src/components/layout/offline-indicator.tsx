import { useOffline } from "@/hooks/use-offline";
import { WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OfflineIndicator() {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white border-none rounded-none">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        Working offline - Data will sync when connection is restored
      </AlertDescription>
    </Alert>
  );
}
