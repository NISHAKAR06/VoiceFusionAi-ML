
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export function SettingsForm() {
  // General Settings
  const [username, setUsername] = useState('alexis_sanchez');
  const [email, setEmail] = useState('alexis@example.com');
  const [language, setLanguage] = useState('english');
  
  // Project Settings
  const [defaultVoiceQuality, setDefaultVoiceQuality] = useState('high');
  const [emotionPreservation, setEmotionPreservation] = useState(80);
  const [lipSyncAccuracy, setLipSyncAccuracy] = useState(75);
  const [autoSave, setAutoSave] = useState(true);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [processingComplete, setProcessingComplete] = useState(true);
  const [newFeatures, setNewFeatures] = useState(false);
  
  const saveSettings = () => {
    toast({
      title: "Settings saved successfully",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <Card className="w-full max-w-4xl animate-fade-in">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account settings and dubbing preferences.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="general" className="animate-scale-in">General</TabsTrigger>
            <TabsTrigger value="project" className="animate-scale-in animate-in-delay-100">Project</TabsTrigger>
            <TabsTrigger value="notifications" className="animate-scale-in animate-in-delay-200">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              
              <div>
                <Label htmlFor="language">Interface Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="tamil">Tamil</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="telugu">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="project" className="space-y-6 animate-fade-in">
            <div className="space-y-6">
              <div>
                <Label htmlFor="voice-quality">Default Voice Quality</Label>
                <Select value={defaultVoiceQuality} onValueChange={setDefaultVoiceQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster Processing)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Better Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Emotion Preservation</Label>
                  <span className="text-sm text-muted-foreground">{emotionPreservation}%</span>
                </div>
                <Slider 
                  value={[emotionPreservation]} 
                  min={0} 
                  max={100} 
                  step={1} 
                  onValueChange={(value) => setEmotionPreservation(value[0])} 
                />
                <p className="text-sm text-muted-foreground">
                  Higher values preserve more emotional tone from the original voice.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Lip Sync Accuracy</Label>
                  <span className="text-sm text-muted-foreground">{lipSyncAccuracy}%</span>
                </div>
                <Slider 
                  value={[lipSyncAccuracy]} 
                  min={0} 
                  max={100} 
                  step={1} 
                  onValueChange={(value) => setLipSyncAccuracy(value[0])} 
                />
                <p className="text-sm text-muted-foreground">
                  Higher values improve lip sync but may increase processing time.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto Save Projects</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save project progress every 5 minutes
                  </p>
                </div>
                <Switch 
                  id="auto-save" 
                  checked={autoSave} 
                  onCheckedChange={setAutoSave} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails for important updates
                  </p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="processing-complete">Processing Complete</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your dubbing is complete
                  </p>
                </div>
                <Switch 
                  id="processing-complete" 
                  checked={processingComplete} 
                  onCheckedChange={setProcessingComplete} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-features">New Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Learn about new features and updates
                  </p>
                </div>
                <Switch 
                  id="new-features" 
                  checked={newFeatures} 
                  onCheckedChange={setNewFeatures} 
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-8">
          <Button onClick={saveSettings} className="gradient-primary text-white hover:opacity-90">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
