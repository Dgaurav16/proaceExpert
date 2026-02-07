import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Medal } from 'lucide-react';

interface LeaderboardUser {
  id: number;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  points: number;
  rank: number;
}

export default function EmbedLeaderboardWidget() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
  });

  const topUsers = leaderboard?.slice(0, 5) || [];

  const getRankIcon = (rank: number, points: number) => {
    if (points === 0) return null;
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-3">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-2 border-b">
          <div className="flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary mr-2" />
            <h3 className="text-sm font-bold text-neutral-800">Top Predictors</h3>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="divide-y">
          {topUsers.length > 0 ? (
            topUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-6">
                    {getRankIcon(user.rank, user.points) || (
                      <span className="text-xs font-semibold text-neutral-600">
                        {user.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-gray-200">
                      <span className="text-xs font-bold text-primary">
                        {user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">
                      {user.displayName}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {user.points}
                    </p>
                    <p className="text-xs text-neutral-500">pts</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-6 text-center text-sm text-neutral-500">
              No predictions yet
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t text-center">
          <a 
            href={`${window.location.origin}/leaderboard`} 
            target="_parent"
            className="text-xs text-primary hover:underline font-semibold"
          >
            View Full Leaderboard →
          </a>
        </div>
      </div>
    </div>
  );
}
