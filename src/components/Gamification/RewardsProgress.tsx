import { motion } from 'framer-motion';
import { Star, Gift, Crown, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RewardsProgressProps {
  points: number;
  level: number;
  totalEarned: number;
  className?: string;
}

const levels = [
  { name: 'Bronze', icon: Star, minPoints: 0, color: 'from-amber-600 to-amber-800' },
  { name: 'Silver', icon: Gift, minPoints: 500, color: 'from-gray-400 to-gray-600' },
  { name: 'Gold', icon: Crown, minPoints: 1500, color: 'from-yellow-400 to-yellow-600' },
  { name: 'Platinum', icon: Trophy, minPoints: 5000, color: 'from-purple-400 to-purple-600' },
];

const RewardsProgress = ({ points, level, totalEarned, className }: RewardsProgressProps) => {
  const currentLevel = levels[Math.min(level - 1, levels.length - 1)];
  const nextLevel = levels[Math.min(level, levels.length - 1)];
  const progress = nextLevel.minPoints > currentLevel.minPoints 
    ? ((totalEarned - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const LevelIcon = currentLevel.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-gradient-to-br from-card to-card/50 border rounded-xl p-6 space-y-4", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br",
              currentLevel.color
            )}
          >
            <LevelIcon className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-lg">{currentLevel.name} Member</h3>
            <p className="text-sm text-muted-foreground">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <motion.p 
            className="text-2xl font-bold text-primary"
            key={points}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {points.toLocaleString()}
          </motion.p>
          <p className="text-xs text-muted-foreground">Available Points</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress to {nextLevel.name}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3" />
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
            style={{ width: '30%' }}
            animate={{ x: ['0%', '333%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {nextLevel.minPoints - totalEarned > 0 
            ? `${(nextLevel.minPoints - totalEarned).toLocaleString()} points to ${nextLevel.name}`
            : `You've reached ${currentLevel.name}!`
          }
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2">
        {levels.map((lvl, i) => {
          const Icon = lvl.icon;
          const isUnlocked = level > i;
          return (
            <motion.div
              key={lvl.name}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                isUnlocked ? "bg-primary/10" : "bg-muted/50 opacity-50"
              )}
            >
              <Icon className={cn("h-5 w-5", isUnlocked ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-medium">{lvl.name}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RewardsProgress;
