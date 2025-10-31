import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, Gift, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Rewards {
  points: number;
  total_earned: number;
  level: number;
}

interface RewardHistory {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

const RewardsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [history, setHistory] = useState<RewardHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchRewards();
    }
  }, [user, authLoading, navigate]);

  const fetchRewards = async () => {
    const { data: rewardsData } = await supabase
      .from('user_rewards')
      .select('*')
      .single();

    if (rewardsData) {
      setRewards(rewardsData);
    } else {
      // Initialize rewards for new users
      setRewards({ points: 0, total_earned: 0, level: 1 });
    }

    const { data: historyData } = await supabase
      .from('rewards_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (historyData) {
      setHistory(historyData);
    }

    setLoading(false);
  };

  const getNextLevelPoints = (level: number) => level * 1000;
  const getLevelProgress = () => {
    if (!rewards) return 0;
    const currentLevelBase = (rewards.level - 1) * 1000;
    const nextLevelPoints = getNextLevelPoints(rewards.level);
    const progress = ((rewards.total_earned - currentLevelBase) / 1000) * 100;
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Rewards</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-warning" />
        <h1 className="text-3xl font-bold">My Rewards</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="gradient-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Points</p>
              <Star className="w-5 h-5 text-warning fill-warning" />
            </div>
            <p className="text-3xl font-bold">{rewards?.points || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Redeem for discounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold">{rewards?.total_earned || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Level</p>
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <p className="text-3xl font-bold">{rewards?.level || 1}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {getNextLevelPoints(rewards?.level || 1) - (rewards?.total_earned || 0)} points to next level
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {rewards?.level || 1}</span>
              <span>Level {(rewards?.level || 1) + 1}</span>
            </div>
            <Progress value={getLevelProgress()} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(getLevelProgress())}% to next level
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Badge variant="secondary">+1pt</Badge>
              <div>
                <p className="font-medium">Shop with us</p>
                <p className="text-sm text-muted-foreground">Earn 1 point for every KES 100 spent</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Badge variant="secondary">Bonus</Badge>
              <div>
                <p className="font-medium">Level up rewards</p>
                <p className="text-sm text-muted-foreground">Unlock exclusive perks as you level up</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Badge variant={item.points > 0 ? 'default' : 'secondary'}>
                    {item.points > 0 ? '+' : ''}{item.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RewardsPage;
