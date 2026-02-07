import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Match, Team, Prediction } from '@shared/schema';
import MatchCard from '@/components/match-card';

type MatchWithTeams = Match & {
  team1: Team;
  team2: Team;
  tossWinner?: Team;
  matchWinner?: Team;
  tournamentName?: string;
};

export default function EmbedMatchDetail() {
  const [, params] = useRoute('/embed/matches/:id');
  const matchId = params?.id ? parseInt(params.id) : null;

  const { data: match, isLoading } = useQuery<MatchWithTeams>({
    queryKey: ['/api/matches', matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}`);
      if (!res.ok) throw new Error('Failed to fetch match');
      return res.json();
    },
    enabled: !!matchId,
  });

  const { data: predictions } = useQuery<Prediction[]>({
    queryKey: ['/api/predictions'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="text-center">
          <p className="text-neutral-600 text-lg mb-2">Match not found</p>
          <p className="text-sm text-neutral-500">Please check the match ID</p>
        </div>
      </div>
    );
  }

  const userPrediction = predictions?.find(p => p.matchId === match.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <MatchCard match={match} userPrediction={userPrediction} />
        
        <div className="mt-4 text-center">
          <p className="text-xs text-neutral-500">
            Powered by{' '}
            <a 
              href={window.location.origin} 
              target="_parent" 
              className="text-primary hover:underline font-semibold"
            >
              ProAce Predictions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
