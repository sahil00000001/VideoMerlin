import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onUpload: (data: VideoData) => void;
}

const processingSteps = [
  { id: 1, label: "Extracting audio...", duration: 1500 },
  { id: 2, label: "Transcribing...", duration: 2000 },
  { id: 3, label: "Identifying speakers...", duration: 1800 },
  { id: 4, label: "AI Analysis...", duration: 2200 },
];

export default function VideoUpload({ onUpload }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => 
      file.type.startsWith('video/') || 
      ['.mp4', '.mov', '.avi', '.mkv'].some(ext => file.name.endsWith(ext))
    );
    
    if (videoFile) {
      processFile(videoFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a video file (MP4, MOV, AVI, or MKV)",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setCurrentStep(0);
    setCompletedSteps([]);

    try {
      // Simulate processing steps for better UX
      const processSteps = async () => {
        for (let i = 0; i < processingSteps.length; i++) {
          setCurrentStep(i);
          await new Promise(resolve => setTimeout(resolve, processingSteps[i].duration));
          setCompletedSteps(prev => [...prev, i]);
        }
      };

      // Start processing animation
      const processingPromise = processSteps();

      // Upload file to backend
      const formData = new FormData();
      formData.append('video', file);

      const uploadPromise = apiRequest('POST', '/api/videos/upload', formData);

      // Wait for both to complete
      const [, videoData] = await Promise.all([processingPromise, uploadPromise]);

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Video Processed Successfully",
        description: "Your consultation video is ready for analysis",
      });

      onUpload(videoData);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process video. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      setCompletedSteps([]);
      setCurrentStep(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Video Consultation Manager
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your beauty consultation video to get AI-powered insights and transcription
          </p>
        </div>

        {!isProcessing ? (
          <Card
            className={cn(
              "relative overflow-hidden transition-all duration-300",
              isDragging && "border-primary bg-primary/5 scale-[1.02]"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300",
                  isDragging ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"
                )}>
                  <Upload className="h-12 w-12" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Drop your video here
                  </h2>
                  <p className="text-muted-foreground">
                    or click to browse your files
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: MP4, MOV, AVI, MKV
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-browse-files"
                >
                  <File className="h-5 w-5 mr-2" />
                  Browse Files
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.mov,.avi,.mkv"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file"
                />
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="p-12">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Processing Your Video
                  </h2>
                  <p className="text-muted-foreground">
                    This may take a few moments...
                  </p>
                </div>

                <div className="space-y-4">
                  {processingSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-4 p-4 rounded-md bg-muted/30"
                      data-testid={`processing-step-${index}`}
                    >
                      <div className={cn(
                        "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300",
                        completedSteps.includes(index)
                          ? "bg-primary text-primary-foreground"
                          : index === currentStep
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {completedSteps.includes(index) ? (
                          <Check className="h-5 w-5" />
                        ) : index === currentStep ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        completedSteps.includes(index)
                          ? "text-foreground"
                          : index === currentStep
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
