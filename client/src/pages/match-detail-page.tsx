import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Match, Team } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Trophy, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import VoteBand from '@/components/vote-band';

type MatchWithTeams = Match & {
  team1: Team;
  team2: Team;
  tossWinner?: Team;
  matchWinner?: Team;
  tournamentName?: string;
};

export default function MatchDetailPage() {
  const { user } = useAuth();
  const [, params] = useRoute('/matches/:id');
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


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-600 mb-4">Match not found</p>
              <Link href="/predict">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Matches
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="upcoming">UPCOMING</Badge>;
      case 'ongoing':
        return <Badge variant="live">LIVE</Badge>;
      case 'completed':
        return <Badge variant="completed">COMPLETED</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/predict">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Matches
          </Button>
        </Link>

        {/* Match Header */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold mb-2">
                  {match.tournamentName || 'Cricket Match'}
                </CardTitle>
                <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(match.matchDate), 'EEEE, MMMM dd, yyyy - HH:mm')}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {match.location}
                  </div>
                </div>
              </div>
              {getStatusBadge(match.status)}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Teams Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-8">
              {/* Team 1 */}
              <div className="text-center">
                {match.team1.logoUrl && (
                  <img 
                    src={match.team1.logoUrl} 
                    alt={match.team1.name}
                    className="w-24 h-24 mx-auto mb-3 rounded-full object-cover shadow-md"
                  />
                )}
                <h3 className="text-xl font-bold text-neutral-800">{match.team1.name}</h3>
                {match.team1Score && (
                  <p className="text-2xl font-bold text-primary mt-2">{match.team1Score}</p>
                )}
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-4xl font-bold text-neutral-400">VS</div>
              </div>

              {/* Team 2 */}
              <div className="text-center">
                {match.team2.logoUrl && (
                  <img 
                    src={match.team2.logoUrl} 
                    alt={match.team2.name}
                    className="w-24 h-24 mx-auto mb-3 rounded-full object-cover shadow-md"
                  />
                )}
                <h3 className="text-xl font-bold text-neutral-800">{match.team2.name}</h3>
                {match.team2Score && (
                  <p className="text-2xl font-bold text-primary mt-2">{match.team2Score}</p>
                )}
              </div>
            </div>

            {/* Match Results */}
            {match.status === 'completed' && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
                  <h4 className="text-lg font-bold text-neutral-800">Match Result</h4>
                </div>
                
                {match.matchWinner && (
                  <div className="text-center mb-3">
                    <p className="text-sm text-neutral-600 mb-1">Winner</p>
                    <p className="text-xl font-bold text-green-600">{match.matchWinner.name}</p>
                  </div>
                )}

                {match.tossWinner && (
                  <div className="text-center mb-3">
                    <p className="text-sm text-neutral-600 mb-1">Toss Winner</p>
                    <p className="text-lg font-semibold text-neutral-800">{match.tossWinner.name}</p>
                  </div>
                )}

                {match.resultSummary && (
                  <div className="text-center">
                    <p className="text-neutral-700 italic">{match.resultSummary}</p>
                  </div>
                )}
              </div>
            )}

            {/* Discussion Link */}
            {match.discussionLink && (
              <div className="text-center mb-6">
                <a 
                  href={match.discussionLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Join Discussion
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prediction Section */}
        {match.status !== 'completed' && user && (
          <Card>
            <CardHeader>
              <CardTitle>Make Your Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Toss Prediction */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                    Who will win the toss?
                  </h4>
                  <VoteBand
                    matchId={match.id}
                    team1Name={match.team1.name}
                    team2Name={match.team2.name}
                    type="toss"
                  />
                </div>

                {/* Match Winner Prediction */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                    Who will win the match?
                  </h4>
                  <VoteBand
                    matchId={match.id}
                    team1Name={match.team1.name}
                    team2Name={match.team2.name}
                    type="match"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guest Message */}
        {match.status !== 'completed' && !user && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-neutral-600 mb-4">Sign in to make your predictions!</p>
              <Link href="/auth">
                <Button>Sign In / Register</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
