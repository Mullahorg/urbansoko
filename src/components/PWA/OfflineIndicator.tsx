import { RefreshCw, Cloud, Check, Download, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const OfflineIndicator = () => {
  const { 
    isOnline, 
    isSyncing, 
    pendingCount, 
    syncPendingActions, 
    lastSyncTime,
    cacheProgress,
    storageUsage
  } = useOfflineSync();

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const isCaching = cacheProgress.total > 0;
  const cachePercent = isCaching ? Math.round((cacheProgress.current / cacheProgress.total) * 100) : 0;

  return (
    <AnimatePresence>
      {/* Caching progress indicator */}
      {isCaching && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 safe-x"
        >
          <motion.div 
            className="flex items-center gap-3 bg-gradient-to-r from-blue-500/95 to-blue-600/85 text-white px-5 py-3 rounded-full shadow-xl backdrop-blur-md border border-blue-500/20 min-w-[280px]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Download className="h-5 w-5" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">Caching for offline</span>
                <span className="text-xs opacity-80">{cachePercent}%</span>
              </div>
              <Progress value={cachePercent} className="h-1.5 bg-white/20" />
              <span className="text-xs opacity-70 mt-1 block">
                {cacheProgress.current} / {cacheProgress.total} images
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {(!isOnline || pendingCount > 0) && !isCaching && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 safe-x"
        >
          {!isOnline ? (
            <motion.div 
              className="flex items-center gap-3 bg-gradient-to-r from-amber-500/95 to-amber-600/85 text-white px-5 py-3 rounded-full shadow-xl backdrop-blur-md border border-amber-500/20"
              animate={{ 
                boxShadow: ['0 10px 40px -10px rgba(245, 158, 11, 0.4)', '0 10px 40px -10px rgba(245, 158, 11, 0.6)', '0 10px 40px -10px rgba(245, 158, 11, 0.4)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <HardDrive className="h-5 w-5" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Offline Mode</span>
                <span className="text-xs opacity-80">
                  {storageUsage ? `${formatBytes(storageUsage.used)} cached` : 'Browsing cached products'}
                </span>
              </div>
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-none">
                  {pendingCount} pending
                </Badge>
              )}
            </motion.div>
          ) : pendingCount > 0 ? (
            <motion.div 
              className="flex items-center gap-3 bg-gradient-to-r from-primary/95 to-primary/85 text-primary-foreground px-5 py-3 rounded-full shadow-xl backdrop-blur-md border border-primary/20"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={syncPendingActions}
                disabled={isSyncing}
                className="h-auto p-0 text-primary-foreground hover:bg-transparent hover:text-primary-foreground/80 gap-2 touch-target"
              >
                <motion.div
                  animate={isSyncing ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: 'linear' }}
                >
                  {isSyncing ? (
                    <RefreshCw className="h-5 w-5" />
                  ) : (
                    <Cloud className="h-5 w-5" />
                  )}
                </motion.div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">
                    {isSyncing ? 'Syncing...' : `Sync ${pendingCount} change${pendingCount > 1 ? 's' : ''}`}
                  </span>
                  {lastSyncTime && (
                    <span className="text-xs opacity-70">Last sync: {formatLastSync()}</span>
                  )}
                </div>
              </Button>
            </motion.div>
          ) : null}
        </motion.div>
      )}
      
      {/* Sync success toast */}
      {isOnline && pendingCount === 0 && lastSyncTime && !isCaching && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 right-4 z-40 safe-right safe-bottom"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-green-500/20"
          >
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">All synced</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;