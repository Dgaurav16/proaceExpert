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

export default function EmbedMatchWidget() {
  const [, params] = useRoute('/embed/widget/match/:id');
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
      <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-pulse bg-white rounded-lg p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white rounded-lg p-4 text-center text-sm text-gray-600">
          Match not found
        </div>
      </div>
    );
  }

  const userPrediction = predictions?.find(p => p.matchId === match.id);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-3">
      <MatchCard match={match} userPrediction={userPrediction} />
    </div>
  );
}
