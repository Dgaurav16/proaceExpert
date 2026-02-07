import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Save, RefreshCw, Trash2 } from 'lucide-react';

const SiteSettings = () => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch current site logo
  const { data: siteLogo, isLoading, refetch } = useQuery({
    queryKey: ['/api/settings/siteLogo'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/settings/siteLogo');
        if (res.status === 404) {
          return null;
        }
        if (!res.ok) throw new Error('Failed to fetch site logo');
        const data = await res.json();
        return data.value;
      } catch (error) {
        console.error('Error fetching site logo:', error);
        return null;
      }
    }
  });
  
  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Upload site logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const res = await fetch('/api/settings/upload-logo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Logo upload failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Logo Uploaded',
        description: 'Site logo has been successfully updated',
      });
      setLogoFile(null);
      setLogoPreview(null);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to upload logo: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle logo upload
  const handleLogoUpload = async () => {
    if (logoFile) {
      uploadLogoMutation.mutate(logoFile);
    }
  };
  
  // Site reset mutation
  const siteResetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/site-reset', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Site reset failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Site Reset Successful',
        description: 'All competition data has been cleared. User accounts remain intact.',
      });
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to reset site: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-heading mb-6">Site Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Site Appearance</CardTitle>
          <CardDescription>
            Customize your platform's appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Site Logo</h3>
            <div className="flex gap-4 items-center">
              <div className="relative">
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center w-40 h-40">
                  {isLoading ? (
                    <Skeleton className="w-full h-full" />
                  ) : logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full" />
                  ) : siteLogo ? (
                    <img src={siteLogo} alt="Site logo" className="max-h-full max-w-full" />
                  ) : (
                    <div className="text-neutral-400 text-center">
                      <Upload className="mx-auto h-8 w-8 mb-2" />
                      <span className="text-xs">Upload logo</span>
                    </div>
                  )}
                </div>
                
                {siteLogo && !logoPreview && (
                  <div className="absolute -right-3 top-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs rounded-full bg-white"
                      onClick={triggerFileInput}
                    >
                      Change
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleLogoChange}
                />
                
                <Button 
                  type="button" 
                  onClick={triggerFileInput}
                  className="mb-2"
                >
                  Choose File
                </Button>
                
                <p className="text-xs text-neutral-500 mt-1">
                  Recommended size: 512x512px. Max 5MB.
                </p>
                
                {logoFile && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      type="button" 
                      onClick={handleLogoUpload}
                      disabled={uploadLogoMutation.isPending}
                    >
                      {uploadLogoMutation.isPending ? 
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : 
                        <Save className="mr-2 h-4 w-4" />
                      }
                      Save Logo
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that will permanently delete data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Reset Site Data</h3>
              <p className="text-sm text-neutral-600 mb-4">
                This will permanently delete all competition data including matches, predictions, 
                tournaments, teams, contests, and leaderboard points. User accounts and profiles 
                will be preserved.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">What will be deleted:</h4>
                <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
                  <li>All matches and predictions</li>
                  <li>All tournaments and teams</li>
                  <li>All contests and leaderboard data</li>
                  <li>User points (reset to 0)</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-800 mb-2">What will be preserved:</h4>
                <ul className="text-sm text-green-700 space-y-1 ml-4 list-disc">
                  <li>User accounts (email, password, security code)</li>
                  <li>User profiles (display name, profile images)</li>
                  <li>Site settings and support tickets</li>
                </ul>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={siteResetMutation.isPending}>
                    {siteResetMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset Site Data
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all competition 
                      data including matches, predictions, tournaments, teams, contests, and 
                      leaderboard points. User accounts will remain intact.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => siteResetMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettings;