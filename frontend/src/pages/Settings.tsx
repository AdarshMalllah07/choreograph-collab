import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Bell, Moon, Globe, Shield, Palette, Database } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskCompleted: true,
    projectUpdates: false,
    emailNotifications: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'system',
    compactMode: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'team',
    activityStatus: true,
  });

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Appearance settings saved",
      description: "Your display preferences have been updated.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Privacy settings saved",
      description: "Your privacy preferences have been updated.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data export started",
      description: "You'll receive an email with your data shortly.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Action required",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
            Settings
          </h1>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Bell className="h-5 w-5 inline mr-2" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="task-assigned">Task Assigned</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when a task is assigned to you
                      </p>
                    </div>
                    <Switch
                      id="task-assigned"
                      checked={notifications.taskAssigned}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, taskAssigned: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="task-completed">Task Completed</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when your tasks are marked complete
                      </p>
                    </div>
                    <Switch
                      id="task-completed"
                      checked={notifications.taskCompleted}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, taskCompleted: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="project-updates">Project Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify about project changes and updates
                      </p>
                    </div>
                    <Switch
                      id="project-updates"
                      checked={notifications.projectUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, projectUpdates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
                    />
                  </div>

                  <Button onClick={handleSaveNotifications} className="w-full">
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Palette className="h-5 w-5 inline mr-2" />
                    Display Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your interface appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">
                      <Moon className="h-4 w-4 inline mr-2" />
                      Theme
                    </Label>
                    <Select
                      value={appearance.theme}
                      onValueChange={(value) => 
                        setAppearance({ ...appearance, theme: value })
                      }
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing and padding in the interface
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) => 
                        setAppearance({ ...appearance, compactMode: checked })
                      }
                    />
                  </div>

                  <Button onClick={handleSaveAppearance} className="w-full">
                    Save Appearance Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Shield className="h-5 w-5 inline mr-2" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and visibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile-visibility">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Profile Visibility
                    </Label>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) => 
                        setPrivacy({ ...privacy, profileVisibility: value })
                      }
                    >
                      <SelectTrigger id="profile-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="team">Team Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="activity-status">Show Activity Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Let others see when you're active
                      </p>
                    </div>
                    <Switch
                      id="activity-status"
                      checked={privacy.activityStatus}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, activityStatus: checked })
                      }
                    />
                  </div>

                  <Button onClick={handleSavePrivacy} className="w-full">
                    Save Privacy Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management Tab */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Database className="h-5 w-5 inline mr-2" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Manage your data and account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Export Your Data</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Download a copy of all your TaskFlow data including projects, tasks, and settings.
                      </p>
                      <Button variant="outline" onClick={handleExportData}>
                        Export Data
                      </Button>
                    </div>

                    <div className="p-4 border border-destructive/50 rounded-lg">
                      <h3 className="font-semibold mb-2 text-destructive">Delete Account</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}