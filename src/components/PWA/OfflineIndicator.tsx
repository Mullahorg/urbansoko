import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const OfflineIndicator = () => {
  const { isOnline, isSyncing, pendingCount, syncPendingActions } = useOfflineSync();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
      {!isOnline ? (
        <div className="flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're offline</span>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-background/20">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      ) : pendingCount > 0 ? (
        <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={syncPendingActions}
            disabled={isSyncing}
            className="h-auto p-0 text-primary-foreground hover:bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isSyncing ? 'Syncing...' : `Sync ${pendingCount} changes`}
            </span>
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default OfflineIndicator;
