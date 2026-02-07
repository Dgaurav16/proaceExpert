import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Team, Tournament, insertTeamSchema } from '@shared/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ObjectUploader } from '@/components/ObjectUploader';

// Team form schema
const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  logoUrl: z.string().optional(),
  isCustom: z.boolean().default(true),
  tournamentIds: z.array(z.number()).optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

const ManageTeams = () => {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>('');
  
  // Fetch all teams
  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  // Fetch all tournaments
  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
    queryFn: async () => {
      const res = await fetch('/api/tournaments');
      if (!res.ok) throw new Error('Failed to fetch tournaments');
      return res.json();
    }
  });
  
  // Team form
  const createTeamForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      logoUrl: '',
      isCustom: true,
    },
  });
  
  // Edit team form
  const editTeamForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      logoUrl: '',
      isCustom: true,
    },
  });
  
  // Handle logo upload with object storage
  const handleLogoUpload = async (result: any) => {
    const uploadedFileUrl = result.successful[0]?.uploadURL;
    
    if (uploadedFileUrl) {
      // Set ACL policy for the uploaded image
      const response = await fetch('/api/teams/upload-image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageURL: uploadedFileUrl }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUploadedLogoUrl(data.objectPath);
        if (createDialogOpen) {
          createTeamForm.setValue('logoUrl', data.objectPath);
        } else if (editDialogOpen) {
          editTeamForm.setValue('logoUrl', data.objectPath);
        }
        toast({
          title: 'Logo uploaded',
          description: 'Team logo uploaded successfully to cloud storage',
        });
      }
    }
  };
  
  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      // Create the team
      const res = await apiRequest('POST', '/api/teams', data);
      const teamData = await res.json();
      
      // Associate team with selected tournaments
      if (data.tournamentIds && data.tournamentIds.length > 0) {
        for (const tournamentId of data.tournamentIds) {
          await apiRequest('POST', `/api/tournaments/${tournamentId}/teams`, {
            teamId: teamData.id
          });
        }
      }
      
      return teamData;
    },
    onSuccess: () => {
      toast({
        title: 'Team Created',
        description: 'The team has been successfully created',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setCreateDialogOpen(false);
      createTeamForm.reset();
      setUploadedLogoUrl('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create team',
        variant: 'destructive',
      });
    },
  });
  
  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TeamFormData }) => {
      // Update team basic info
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          logoUrl: data.logoUrl,
          isCustom: data.isCustom,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update team');
      }
      
      // Update tournament associations
      if (data.tournamentIds) {
        await fetch(`/api/teams/${id}/tournaments`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tournamentIds: data.tournamentIds }),
        });
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Team Updated',
        description: 'Team has been successfully updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setEditDialogOpen(false);
      setSelectedTeam(null);
      setUploadedLogoUrl('');
    },
    onError: (error: Error) => {
      console.error('Team update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update team',
        variant: 'destructive',
      });
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/teams/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Team Deleted',
        description: 'The team has been successfully deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setDeleteDialogOpen(false);
      setSelectedTeam(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete team',
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handlers
  const onCreateTeamSubmit = async (data: TeamFormData) => {
    createTeamMutation.mutate(data);
  };
  
  const handleEditTeam = async (team: Team) => {
    setSelectedTeam(team);
    
    // Set current team image for preview
    setUploadedLogoUrl(team.logoUrl || '');
    
    // Fetch team's current tournament associations
    try {
      const response = await fetch(`/api/teams/${team.id}/tournaments`);
      let teamTournaments: number[] = [];
      if (response.ok) {
        teamTournaments = await response.json();
      }
      
      editTeamForm.reset({
        name: team.name,
        logoUrl: team.logoUrl || '',
        isCustom: team.isCustom,
        tournamentIds: teamTournaments,
      });
      setEditDialogOpen(true);
    } catch (error) {
      // Fallback to just basic team data
      editTeamForm.reset({
        name: team.name,
        logoUrl: team.logoUrl || '',
        isCustom: team.isCustom,
        tournamentIds: [],
      });
      setEditDialogOpen(true);
    }
  };

  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteTeam = () => {
    if (!selectedTeam) return;
    deleteTeamMutation.mutate(selectedTeam.id);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-heading">Manage Teams</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Team
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Team List</CardTitle>
          <CardDescription>
            Manage cricket teams for matches and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : teams && teams.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          {team.logoUrl ? (
                            <AvatarImage src={team.logoUrl} alt={team.name} />
                          ) : (
                            <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>
                        <Badge variant={team.isCustom ? 'default' : 'outline'}>
                          {team.isCustom ? 'Custom' : 'Official'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTeam(team)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            onClick={() => handleDeleteTeam(team)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-500">
              No teams found
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Team Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new cricket team to the system
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createTeamForm}>
            <form onSubmit={createTeamForm.handleSubmit(onCreateTeamSubmit)} className="space-y-6">
              <FormField
                control={createTeamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mumbai Indians" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Team Logo</FormLabel>
                <div className="flex gap-4 items-center">
                  {uploadedLogoUrl && (
                    <div className="border-2 border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center w-32 h-32">
                      <img src={uploadedLogoUrl} alt="Team logo preview" className="max-h-full max-w-full" />
                    </div>
                  )}
                  <div className="flex-1">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5 * 1024 * 1024}
                      onGetUploadParameters={async () => {
                        const res = await fetch('/api/objects/upload', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        const data = await res.json();
                        return { method: 'PUT' as const, url: data.uploadURL };
                      }}
                      onComplete={handleLogoUpload}
                      buttonClassName="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Team Logo
                    </ObjectUploader>
                    <p className="text-xs text-neutral-500 mt-1">
                      Recommended size: 512x512px. Max 5MB. Stored permanently in cloud.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tournament Selection */}
              <div className="space-y-3">
                <FormLabel>Associated Tournaments</FormLabel>
                <FormDescription>
                  Select which tournaments this team will participate in
                </FormDescription>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {tournaments?.map((tournament) => (
                    <div key={tournament.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tournament-${tournament.id}`}
                        checked={createTeamForm.watch('tournamentIds')?.includes(tournament.id) || false}
                        onCheckedChange={(checked) => {
                          const currentIds = createTeamForm.getValues('tournamentIds') || [];
                          if (checked) {
                            createTeamForm.setValue('tournamentIds', [...currentIds, tournament.id]);
                          } else {
                            createTeamForm.setValue('tournamentIds', currentIds.filter(id => id !== tournament.id));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`tournament-${tournament.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {tournament.name}
                      </label>
                    </div>
                  ))}
                  {!tournaments?.length && (
                    <p className="text-sm text-neutral-500 text-center py-2">
                      No tournaments available. Create tournaments first.
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setCreateDialogOpen(false);
                    createTeamForm.reset();
                    setUploadedLogoUrl('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Team Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information and tournament associations
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editTeamForm}>
            <form onSubmit={editTeamForm.handleSubmit((data) => {
              if (!selectedTeam) return;
              updateTeamMutation.mutate({ id: selectedTeam.id, data });
            })} className="space-y-6">
              <FormField
                control={editTeamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mumbai Indians" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Team Logo</FormLabel>
                <div className="flex gap-4 items-center">
                  {uploadedLogoUrl && (
                    <div className="border-2 border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center w-32 h-32">
                      <img src={uploadedLogoUrl} alt="Team logo preview" className="max-h-full max-w-full" />
                    </div>
                  )}
                  <div className="flex-1">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5 * 1024 * 1024}
                      onGetUploadParameters={async () => {
                        const res = await fetch('/api/objects/upload', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        const data = await res.json();
                        return { method: 'PUT' as const, url: data.uploadURL };
                      }}
                      onComplete={handleLogoUpload}
                      buttonClassName="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Team Logo
                    </ObjectUploader>
                    <p className="text-xs text-neutral-500 mt-1">
                      Recommended size: 512x512px. Max 5MB. Stored permanently in cloud.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tournament Selection */}
              <FormField
                control={editTeamForm.control}
                name="tournamentIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Tournaments</FormLabel>
                    <FormDescription>
                      Select which tournaments this team participates in
                    </FormDescription>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                      {tournaments?.map((tournament) => (
                        <div key={tournament.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-tournament-${tournament.id}`}
                            checked={field.value?.includes(tournament.id) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, tournament.id]);
                              } else {
                                field.onChange(currentValue.filter((id: number) => id !== tournament.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={`edit-tournament-${tournament.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {tournament.name}
                          </label>
                        </div>
                      ))}
                      {!tournaments?.length && (
                        <p className="text-sm text-neutral-500 text-center py-2">
                          No tournaments available. Create tournaments first.
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditDialogOpen(false);
                    editTeamForm.reset();
                    setUploadedLogoUrl('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Team
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Team Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteTeam}
              disabled={deleteTeamMutation.isPending}
            >
              {deleteTeamMutation.isPending ? 'Deleting...' : 'Delete Team'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTeams;