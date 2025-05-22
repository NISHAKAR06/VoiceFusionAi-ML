import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cloud, File, FileText, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  jobId?: number; // Add jobId for tracking backend process
}

interface FileUploaderProps {
  onFileUploaded?: (file: UploadedFile) => void;
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    // Check if it's a valid video file
    const validTypes = [
      "video/mp4",
      "video/x-matroska",
      "video/avi",
      "video/quicktime",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description:
          "Please upload a valid video file (.mp4, .mkv, .avi, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2GB",
        variant: "destructive",
      });
      return;
    }

    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "uploading",
    };

    setFiles((prevFiles) => [...prevFiles, newFile]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/dubbing/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setFiles((prevFiles) =>
        prevFiles.map((f) => {
          if (f.id === newFile.id) {
            return {
              ...f,
              progress: 100,
              status: "completed",
              jobId: data.job_id,
            };
          }
          return f;
        })
      );

      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for processing.`,
      });

      // Start polling for job status
      if (data.job_id) {
        pollJobStatus(data.job_id, newFile.id);
      }

      if (onFileUploaded) {
        onFileUploaded({
          ...newFile,
          progress: 100,
          status: "completed",
          jobId: data.job_id,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prevFiles) =>
        prevFiles.map((f) => {
          if (f.id === newFile.id) {
            return {
              ...f,
              progress: 0,
              status: "error",
            };
          }
          return f;
        })
      );

      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    }
  };

  // Add polling function to check job status
  const pollJobStatus = async (jobId: number, fileId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/dubbing/job/${jobId}/`
        );
        const data = await response.json();

        if (data.status === "completed") {
          clearInterval(pollInterval);
          toast({
            title: "Processing completed",
            description: "Your video has been dubbed successfully!",
          });
        } else if (data.status === "failed") {
          clearInterval(pollInterval);
          toast({
            title: "Processing failed",
            description: "There was an error processing your video.",
            variant: "destructive",
          });
        }

        // Update progress in files state
        setFiles((prevFiles) =>
          prevFiles.map((f) => {
            if (f.id === fileId) {
              return {
                ...f,
                progress: data.progress || f.progress,
              };
            }
            return f;
          })
        );
      } catch (error) {
        console.error("Error polling job status:", error);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    toast({
      title: "File removed",
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("video")) {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
          MP4
        </div>
      );
    } else if (fileType.includes("text")) {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded">
          TXT
        </div>
      );
    } else {
      return <File className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="w-full max-w-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center">UPLOAD FILES</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all",
            dragActive
              ? "border-tamil-primary bg-tamil-light/10"
              : "border-border"
          )}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".mp4,.mkv,.avi,.mov,.qt"
            aria-label="File upload input"
            title="Upload video file"
          />
          <Cloud className="w-12 h-12 text-tamil-primary mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag & Drop your files here
          </p>
          <p className="text-muted-foreground mb-4 text-center">OR</p>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="animate-scale-in"
          >
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Supports: MP4, MKV, AVI, MOV (Max 2GB)
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Uploaded files</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-muted/50 rounded-md p-3 flex items-center animate-fade-in"
                >
                  {getFileIcon(file.type)}
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between">
                      <p className="font-medium text-sm truncate max-w-[180px]">
                        {file.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    {file.status === "uploading" ? (
                      <Progress value={file.progress} className="h-1 mt-2" />
                    ) : (
                      <div className="flex items-center mt-1">
                        <Check className="w-3 h-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">Complete</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
