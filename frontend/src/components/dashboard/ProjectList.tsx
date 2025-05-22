import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, PlayCircle, Film, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Project } from "./Dashboard";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects = [] }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Filter and search projects
  const filteredProjects = projects.filter((project) => {
    // Apply status filter
    if (filter !== "all" && project.status !== filter) {
      return false;
    }

    // Apply search filter
    if (
      searchQuery &&
      !project.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const handleDownload = (id: string) => {
    const project = projects.find((p) => p.id === id);

    if (project?.status === "completed") {
      toast({
        title: "Download started",
        description: `${project.title} is being downloaded.`,
      });
    } else {
      toast({
        title: "Cannot download",
        description: "Project is not yet complete.",
        variant: "destructive",
      });
    }
  };

  const handlePlay = (id: string) => {
    const project = projects.find((p) => p.id === id);

    if (project?.status === "completed") {
      toast({
        title: "Now playing",
        description: `${project.title}`,
      });
    } else {
      toast({
        title: "Cannot play",
        description: "Project is not yet complete.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>My Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filter === "processing" ? "default" : "outline"}
              onClick={() => setFilter("processing")}
              size="sm"
            >
              Processing
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              onClick={() => setFilter("completed")}
              size="sm"
            >
              Completed
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <Film className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
              <p className="mt-4 text-muted-foreground">No projects found</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg animate-fade-in"
              >
                <div className="rounded-md overflow-hidden bg-muted w-full md:w-[120px] h-[68px] flex-shrink-0">
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Film className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row justify-between gap-2 items-start md:items-center mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{project.title}</h3>
                      <Badge
                        variant={
                          project.status === "completed"
                            ? "default"
                            : project.status === "processing"
                            ? "outline"
                            : "destructive"
                        }
                        className="capitalize"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added on {project.date} •{" "}
                      {project.duration || "Unknown duration"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Progress
                      value={project.progress}
                      className="h-2 flex-grow"
                    />
                    <span className="text-xs text-muted-foreground w-12">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlay(project.id)}
                      disabled={project.status !== "completed"}
                    >
                      <PlayCircle className="h-4 w-4" />
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(project.id)}
                      disabled={project.status !== "completed"}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
