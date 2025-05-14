
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/upload/FileUploader';
import { DubbingProcessViewer } from '@/components/dashboard/DubbingProcessViewer';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container py-8 animate-fade-in">
      <DashboardHeader />
      
      <div className="mt-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="animate-scale-in">Overview</TabsTrigger>
            <TabsTrigger value="upload" className="animate-scale-in animate-in-delay-100">Upload</TabsTrigger>
            <TabsTrigger value="process" className="animate-scale-in animate-in-delay-200">Process</TabsTrigger>
            <TabsTrigger value="projects" className="animate-scale-in animate-in-delay-300">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <DashboardSummary />
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="grid place-items-center">
              <FileUploader />
            </div>
          </TabsContent>
          
          <TabsContent value="process" className="space-y-4">
            <Card>
              <CardContent className="py-6">
                <DubbingProcessViewer />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <ProjectList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
