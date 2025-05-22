import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/upload/FileUploader';
import { DubbingProcessViewer } from '@/components/dashboard/DubbingProcessViewer';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';

// Define a shared type for projects
export interface Project {
  id: string;
  title: string;
  date: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  thumbnail?: string;
  duration?: string;
  fileInfo?: {
    size: number;
    type: string;
  };
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProcessingProject, setCurrentProcessingProject] = useState<Project | null>(null);
  
  // Load projects from localStorage on initial render
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
      
      // Find if there's a project in processing state
      const processingProject = JSON.parse(storedProjects).find(
        (p: Project) => p.status === 'processing'
      );
      
      if (processingProject) {
        setCurrentProcessingProject(processingProject);
      }
    }
  }, []);
  
  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);
  
  // Function to handle new file upload
  const handleFileUpload = (fileData: any) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: fileData.name.split('.')[0],
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      progress: 0,
      fileInfo: {
        size: fileData.size,
        type: fileData.type
      }
    };
    
    setProjects([newProject, ...projects]);
    setCurrentProcessingProject(newProject);
    setActiveTab('process'); // Switch to processing tab
    
    // Simulate processing progress
    simulateProcessing(newProject.id);
  };
  
  // Simulate project processing
  const simulateProcessing = (projectId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === projectId 
              ? { ...p, status: 'completed', progress: 100 } 
              : p
          )
        );
        
        setCurrentProcessingProject(prev => 
          prev && prev.id === projectId 
            ? { ...prev, status: 'completed', progress: 100 } 
            : prev
        );
        
        return;
      }
      
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === projectId 
            ? { ...p, progress } 
            : p
        )
      );
      
      setCurrentProcessingProject(prev => 
        prev && prev.id === projectId 
          ? { ...prev, progress } 
          : prev
      );
    }, 2000);
  };
  
  return (
    <div className="container py-8 animate-fade-in">
      <DashboardHeader />
      
      <div className="mt-8">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="animate-scale-in">Overview</TabsTrigger>
            <TabsTrigger value="upload" className="animate-scale-in animate-in-delay-100">Upload</TabsTrigger>
            <TabsTrigger value="process" className="animate-scale-in animate-in-delay-200">Process</TabsTrigger>
            <TabsTrigger value="projects" className="animate-scale-in animate-in-delay-300">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <DashboardSummary projects={projects} />
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="grid place-items-center">
              <FileUploader onFileUploaded={handleFileUpload} />
            </div>
          </TabsContent>
          
          <TabsContent value="process" className="space-y-4">
            <Card>
              <CardContent className="py-6">
                {currentProcessingProject ? (
                  <DubbingProcessViewer project={currentProcessingProject} />
                ) : (
                  <div className="p-8 text-center">
                    <h3 className="text-xl font-medium mb-2">No Projects Processing</h3>
                    <p className="text-muted-foreground mb-4">Upload a video file to start the dubbing process</p>
                    <button 
                      className="text-tamil-primary hover:underline" 
                      onClick={() => setActiveTab('upload')}
                    >
                      Go to Upload Page
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <ProjectList projects={projects} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
