import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/upload/FileUploader";
import { DubbingProcessViewer } from "@/components/dashboard/DubbingProcessViewer";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";

// Define a shared type for projects
export interface Project {
  id: number;
  display_id: number;
  title: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  stepStatus?: any;
  error_message?: string;
  result_url?: string;
  created_at?: string;
  thumbnail?: string;
  duration?: string;
  fileInfo?: {
    size: number;
    type: string;
  };
  extracted_audio?: string;
  dubbed_audio_file?: string;
  translated_subtitles?: string;
  quality?: "fast" | "medium" | "high";
}

export function Dashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProcessingProject, setCurrentProcessingProject] =
    useState<Project | null>(null);

  // Load projects from the backend on initial render and poll for updates
  useEffect(() => {
    const fetchProjects = () => {
      const token = localStorage.getItem("token");
      if (token && user) {
        fetch("http://localhost:8000/dubbing/projects/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setProjects(data);
            const processingProject = data.find(
              (p: Project) => p.status === "processing" || p.status === "pending"
            );
            if (processingProject) {
              setCurrentProcessingProject(processingProject);
            } else {
              const lastCompleted = data.find(p => p.id === currentProcessingProject?.id && (p.status === 'completed' || p.status === 'failed'));
              if (lastCompleted) {
                setCurrentProcessingProject(lastCompleted);
              } else {
                setCurrentProcessingProject(null);
              }
            }
          });
      }
    };

    fetchProjects(); // Initial fetch
    const intervalId = setInterval(fetchProjects, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [user]);

  // Function to handle new file upload
  const handleFileUpload = (uploadedFile: any) => {
    if (uploadedFile.jobId) {
      const newProject: Project = {
        id: uploadedFile.jobId,
        display_id: projects.length + 1,
        title: uploadedFile.name.split(".")[0],
        status: "processing",
        progress: 0,
        stepStatus: {},
      };
      setProjects([newProject, ...projects]);
      setCurrentProcessingProject(newProject);
      setActiveTab("process");
    }
  };


  return (
    <div className="container py-8 animate-fade-in">
      <DashboardHeader />

      <div className="mt-8">
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="animate-scale-in">
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="animate-scale-in animate-in-delay-100"
            >
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="process"
              className="animate-scale-in animate-in-delay-200"
            >
              Process
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="animate-scale-in animate-in-delay-300"
            >
              Projects
            </TabsTrigger>
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
                  <DubbingProcessViewer 
                    project={currentProcessingProject} 
                    onProjectUpdate={(updatedProject) => {
                      setCurrentProcessingProject(updatedProject);
                      setProjects(prev => 
                        prev.map(p => p.id === updatedProject.id ? updatedProject : p)
                      );
                    }}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <h3 className="text-xl font-medium mb-2">
                      No Projects Processing
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upload a video file to start the dubbing process
                    </p>
                    <button
                      className="text-tamil-primary hover:underline"
                      onClick={() => setActiveTab("upload")}
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
