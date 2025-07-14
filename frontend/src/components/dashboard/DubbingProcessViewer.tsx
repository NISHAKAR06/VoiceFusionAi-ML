import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  FastForward,
  Pause,
  Play,
  Volume2,
  Film,
  Mic,
  Languages,
  MoveHorizontal,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { Project } from "./Dashboard";

interface DubbingProcessViewerProps {
  project: Project | null;
  onProjectUpdate?: (project: Project) => void;
}

const defaultSteps = [
  {
    id: "speech-recognition",
    name: "Speech Recognition",
    description: "Extracting spoken dialogues from the movie",
    icon: <Mic className="h-5 w-5" />,
    status: "waiting",
    progress: 0,
  },
  {
    id: "translation",
    name: "Translation",
    description: "Translating extracted text from English → Tamil",
    icon: <Languages className="h-5 w-5" />,
    status: "waiting",
    progress: 0,
  },
  {
    id: "voice-synthesis",
    name: "Voice Synthesis",
    description: "Generating Tamil audio using the original actor's voice",
    icon: <Volume2 className="h-5 w-5" />,
    status: "waiting",
    progress: 0,
  },
  {
    id: "lip-sync",
    name: "Lip Sync",
    description: "Synchronizing Tamil speech with actor's lip movements",
    icon: <MoveHorizontal className="h-5 w-5" />,
    status: "waiting",
    progress: 0,
  },
  {
    id: "processing",
    name: "Video Processing",
    description: "Replacing original audio with the new dubbed voice",
    icon: <Film className="h-5 w-5" />,
    status: "waiting",
    progress: 0,
  },
];

export function DubbingProcessViewer({ project, onProjectUpdate }: DubbingProcessViewerProps) {
  const [steps, setSteps] = useState(defaultSteps);
  const [activeStep, setActiveStep] = useState("speech-recognition");
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingSpeed, setProcessingSpeed] = useState(1);
  // const [logs, setLogs] = useState<string[]>(project?.logs || []);
  // const wsRef = useRef<WebSocket | null>(null);

  // Update steps from backend status
  useEffect(() => {
    if (!project?.stepStatus) return;
    setSteps(
      defaultSteps.map((step) => ({
        ...step,
        ...(project.stepStatus[step.id] || {}),
      }))
    );
    // Set active step to the first in-progress or waiting step
    const firstActive = defaultSteps.find((s) => {
      const st = project.stepStatus?.[s.id]?.status;
      return st === "in-progress" || st === "waiting";
    });
    if (firstActive) setActiveStep(firstActive.id);
  }, [project?.stepStatus]);

  const overallProgress = project?.progress || 0;

  // Start/pause processing based on project changes
  useEffect(() => {
    if (!project) return;

    if (project.status === "failed") {
      setIsPlaying(false);
      // Update the failed step
      const failedStepIndex = steps.findIndex(
        (s) => s.status === "in-progress"
      );
      if (failedStepIndex !== -1) {
        steps[failedStepIndex].status = "failed";
      }
      toast({
        title: "Processing Failed",
        description: "There was an error in the dubbing process",
        variant: "destructive",
      });
      return;
    }

    if (project.status === "processing" && !isPlaying) {
      setIsPlaying(true);
    } else if (project.status === "completed" && isPlaying) {
      setIsPlaying(false);
    }
  }, [project, isPlaying]);

  useEffect(() => {
    if (!project?.id || !onProjectUpdate) return;

    let isPolling = true;

    const poll = () => {
      if (!isPolling) return;
      fetch(`http://localhost:8000/dubbing/job/${project.id}/`)
        .then((res) => {
          if (res.status === 404) {
            toast({
              title: "Job not found",
              description: "The requested dubbing job does not exist.",
              variant: "destructive",
            });
            isPolling = false;
            return null;
          }
          if (!res.ok) {
            throw new Error("Failed to fetch job status");
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            onProjectUpdate({ ...project, ...data });
            if (data.status === 'failed' || data.status === 'completed') {
              isPolling = false;
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching job status:", err);
          onProjectUpdate({ ...project, status: 'failed', error_message: 'Failed to connect to the backend.' });
          isPolling = false;
        });
    };

    // Poll immediately on component mount and then at intervals
    poll();
    const interval = setInterval(poll, 3000);

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [project?.id, onProjectUpdate]);

  // useEffect(() => {
  //   if (!project?.id) return;
  //   const ws = new WebSocket(`ws://localhost:8000/ws/logs/${project.id}`);
  //   wsRef.current = ws;

  //   ws.onmessage = (event) => {
  //     setLogs((prev) => [...prev, event.data]);
  //   };

  //   ws.onerror = (e) => {
  //     console.error("WebSocket error", e);
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, [project?.id]);

  const handleSpeedChange = (speed: number) => {
    setProcessingSpeed(speed);
    toast({
      title: `Processing speed set to ${speed}x`,
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Processing paused" : "Processing resumed",
    });
  };

  const handleSkip = () => {
    toast({
      title: "Cannot skip",
      description: "This step is required for high-quality dubbing",
      variant: "destructive",
    });
  };


  if (!project) {
    return (
      <div className="text-center py-12">
        <Film className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
        <p className="mt-4 text-lg font-medium">No Project Processing</p>
        <p className="text-muted-foreground">Upload a file to start dubbing</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold">{project.title}</h3>
          <p className="text-muted-foreground">Tamil Dubbing in Progress</p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {processingSpeed}x Speed
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSpeedChange(0.5)}>
                0.5x (Higher Quality)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSpeedChange(1)}>
                1x (Normal)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSpeedChange(2)}>
                2x (Faster)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={togglePlayPause}>
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isPlaying ? "Pause" : "Resume"}
          </Button>

          <Button size="sm" variant="outline" onClick={handleSkip}>
            <FastForward className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>
      </div>

      <Card className="border-2 border-dashed">
        <CardContent className="p-0">
          <div className="bg-muted aspect-video flex items-center justify-center">
            <Film className="h-12 w-12 text-muted-foreground animate-pulse-slow" />
          </div>
        </CardContent>
        <CardFooter className="py-3 px-4 flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2">
              Preview
            </Badge>
            {steps.find((step) => step.id === activeStep)?.name || "Processing"}
          </div>
          <Badge variant={isPlaying ? "default" : "outline"}>
            {isPlaying ? "Processing" : "Paused"}
          </Badge>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Overall Progress</h3>
            <span className="text-sm text-muted-foreground">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress value={overallProgress} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
          {steps.map((step, index) => (
            <Button
              key={step.id}
              variant={activeStep === step.id ? "default" : "outline"}
              className={`justify-start gap-2 h-auto py-2 px-3 ${
                step.status === "waiting" ? "opacity-60" : ""
              } ${
                step.status === "failed" ? "border-red-500 text-red-500" : ""
              }`}
              onClick={() => setActiveStep(step.id)}
            >
              {step.icon}
              <div className="text-xs text-left">
                <div>{step.name}</div>
                <div
                  className={`text-xs ${
                    activeStep === step.id
                      ? "text-primary-foreground/70"
                      : step.status === "failed"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.status === "completed"
                    ? "Completed"
                    : step.status === "in-progress"
                    ? `${step.progress}%`
                    : step.status === "failed"
                    ? "Failed"
                    : "Waiting"}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">
              {steps.find((step) => step.id === activeStep)?.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {steps.find((step) => step.id === activeStep)?.description}
            </p>

            {activeStep === "voice-synthesis" && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Voice Emotion Intensity</span>
                    <span className="text-muted-foreground">72%</span>
                  </div>
                  <Slider defaultValue={[72]} max={100} step={1} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Voice Pitch Accuracy</span>
                    <span className="text-muted-foreground">85%</span>
                  </div>
                  <Slider defaultValue={[85]} max={100} step={1} />
                </div>

                <div className="border rounded-md p-3 bg-background">
                  <h5 className="text-sm font-medium mb-2">Current Scene</h5>
                  <div className="space-y-1 text-xs">
                    <p>
                      <span className="text-muted-foreground">Character:</span>{" "}
                      Bruce Wayne
                    </p>
                    <p>
                      <span className="text-muted-foreground">English:</span>{" "}
                      "Some men just want to watch the world burn."
                    </p>
                    <p>
                      <span className="text-muted-foreground">Tamil:</span> "சில
                      ஆண்கள் உலகம் எரிவதை பார்க்க விரும்புகிறார்கள்."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* <div className="bg-muted p-4 rounded-md mt-4">
            <h4 className="font-medium mb-2">Backend Logs</h4>
            <div className="h-40 overflow-y-auto text-xs font-mono bg-background p-2 rounded">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div> */}
        </TabsContent>

        <TabsContent value="subtitles">
          <div className="bg-muted p-4 rounded-md h-[300px] overflow-y-auto">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border-b pb-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    00:{i + 1}:10 - 00:{i + 1}:15
                  </div>
                  <p className="text-sm mb-1">
                    This is an English subtitle line example.
                  </p>
                  <p className="text-sm text-tamil-primary">
                    இது ஒரு தமிழ் வசன வரி உதாரணம்.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="bg-muted p-4 rounded-md">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Voice Quality</span>
                  <span className="text-muted-foreground">High</span>
                </div>
                <Slider defaultValue={[80]} max={100} step={1} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Lip Sync Accuracy</span>
                  <span className="text-muted-foreground">75%</span>
                </div>
                <Slider defaultValue={[75]} max={100} step={1} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Processing Speed</span>
                  <span className="text-muted-foreground">
                    {processingSpeed}x
                  </span>
                </div>
                <Slider
                  value={[processingSpeed * 50]}
                  max={100}
                  step={25}
                  onValueChange={(value) => {
                    const speeds = [0.5, 1, 1.5, 2];
                    const index = Math.floor(value[0] / 25);
                    setProcessingSpeed(speeds[index]);
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
