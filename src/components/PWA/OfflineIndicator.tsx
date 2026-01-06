import { useState, useEffect } from 'react';
import { RefreshCw, Cloud, Check, HardDrive, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const OfflineIndicator = () => {
  const { 
    isOnline, 
    isSyncing, 
    pendingCount, 
    syncPendingActions, 
    lastSyncTime,
    cacheProgress,
  } = useOfflineSync();

  const [showCacheProgress, setShowCacheProgress] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const formatLastSync = () => {
    if (!lastSyncTime) return null;
    const diff = Date.now() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastSyncTime.toLocaleDateString();
  };

  const isCaching = cacheProgress.total > 0;
  const cachePercent = isCaching ? Math.round((cacheProgress.current / cacheProgress.total) * 100) : 0;

  // Auto-show cache progress only when it starts, auto-hide when complete
  useEffect(() => {
    if (isCaching && cacheProgress.current < cacheProgress.total) {
      setShowCacheProgress(true);
      setDismissed(false);
    } else if (!isCaching) {
      // Hide after completion with delay
      const timer = setTimeout(() => setShowCacheProgress(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isCaching, cacheProgress.current, cacheProgress.total]);

  // Auto-dismiss offline indicator after 5 seconds
  useEffect(() => {
    if (!isOnline && !dismissed) {
      const timer = setTimeout(() => setDismissed(true), 5000);
      return () => clearTimeout(timer);
    }
    if (isOnline) {
      setDismissed(false);
    }
  }, [isOnline, dismissed]);

  return (
    <AnimatePresence>
      {/* Minimal caching progress - small pill at top */}
      {showCacheProgress && isCaching && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-2 right-2 z-50 safe-right"
        >
          <motion.div 
            className="flex items-center gap-2 bg-blue-500/90 text-white px-3 py-1.5 rounded-full shadow-lg text-xs backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full"
            />
            <span className="font-medium">{cachePercent}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-white/20"
              onClick={() => setDismissed(true)}
            >
              <X className="h-3 w-3" />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Offline indicator - subtle and dismissible */}
      {!isOnline && !dismissed && !isCaching && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50"
        >
          <motion.div 
            className="flex items-center gap-2 bg-amber-500/90 text-white px-3 py-1.5 rounded-full shadow-lg text-xs backdrop-blur-sm"
          >
            <HardDrive className="h-3 w-3" />
            <span className="font-medium">Offline</span>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="h-4 bg-white/20 text-white border-none text-[10px] px-1.5">
                {pendingCount}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-white/20 ml-1"
              onClick={() => setDismissed(true)}
            >
              <X className="h-3 w-3" />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Sync button - only show when there are pending actions and online */}
      {isOnline && pendingCount > 0 && !isCaching && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-20 right-4 z-40 safe-right safe-bottom"
        >
          <Button
            size="sm"
            onClick={syncPendingActions}
            disabled={isSyncing}
            className="rounded-full shadow-lg gap-2 h-9 px-4"
          >
            <motion.div
              animate={isSyncing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: 'linear' }}
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
            </motion.div>
            <span className="text-xs">
              {isSyncing ? 'Syncing...' : `Sync (${pendingCount})`}
            </span>
          </Button>
        </motion.div>
      )}
      
      {/* Sync success - very subtle */}
      {isOnline && pendingCount === 0 && lastSyncTime && !isCaching && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="fixed bottom-20 right-4 z-40 safe-right safe-bottom"
        >
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full shadow-sm text-xs"
          >
            <Check className="h-3 w-3" />
            <span className="font-medium">Synced</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
