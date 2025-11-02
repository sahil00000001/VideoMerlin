import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { sampleVideoData, type VideoData, type TimelineSegment, type TranscriptLine, type VideoAnalysis } from "@shared/schema";
import VideoUpload from "@/components/VideoUpload";
import VideoPlayer from "@/components/VideoPlayer";
import Timeline from "@/components/Timeline";
import TranscriptPanel from "@/components/TranscriptPanel";
import SummaryCard from "@/components/SummaryCard";
import ReportTabs from "@/components/ReportTabs";
import { Button } from "@/components/ui/button";
import { Download, Share2, Clock, Loader2, Upload as UploadIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { analyzeTranscriptWithPuter } from "@/lib/puterAI";

interface ReactPlayerInstance {
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getSecondsLoaded: () => number;
}

export default function VideoManager() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, VideoAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const playerRef = useRef<ReactPlayerInstance>(null);
  const { toast } = useToast();

  // Fetch all videos from backend
  const { data: videos, isLoading, error, refetch } = useQuery<VideoData[]>({
    queryKey: ['/api/videos'],
  });

  // Auto-select first video or show upload
  useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideoId) {
      setSelectedVideoId(videos[0].id);
    }
  }, [videos, selectedVideoId]);

  const videoData = videos?.find(v => v.id === selectedVideoId);

  const seekToTime = (seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, 'seconds');
      setCurrentTime(seconds);
      setPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExportTranscript = () => {
    if (!videoData || !videoData.transcript) return;
    
    const transcriptText = videoData.transcript
      .map(line => `[${formatTime(line.timestamp)}] ${line.speaker}: ${line.text}`)
      .join('\n\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${videoData.videoName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Transcript Exported",
      description: "Your transcript has been downloaded successfully.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Video link has been copied to clipboard.",
    });
  };

  const handleUploadComplete = (newVideo: VideoData) => {
    refetch();
    setSelectedVideoId(newVideo.id);
    setShowUpload(false);
    toast({
      title: "Video Uploaded",
      description: "Your video has been processed successfully.",
    });
  };

  const handleAnalyzeWithAI = async () => {
    if (!videoData || !videoData.transcript) {
      toast({
        title: "No Transcript Available",
        description: "Please wait for the video transcription to complete first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const fullText = videoData.transcript.map(line => line.text).join(' ');
      const analysis = await analyzeTranscriptWithPuter(videoData.transcript, fullText);
      
      setAiAnalysis(prev => ({
        ...prev,
        [videoData.id]: analysis
      }));

      toast({
        title: "Analysis Complete",
        description: "AI has successfully analyzed your video transcript using Puter.js!",
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze transcript. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCurrentSegment = (): TimelineSegment | null => {
    if (!videoData || !videoData.segments) return null;
    return videoData.segments.find(
      seg => currentTime >= seg.startTime && currentTime < seg.endTime
    ) || null;
  };

  const getCurrentTranscriptLine = (): TranscriptLine | null => {
    if (!videoData || !videoData.transcript) return null;
    return videoData.transcript.find(
      line => currentTime >= line.start && currentTime < line.end
    ) || null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Error Loading Videos</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  // Upload state
  if (showUpload || !videos || videos.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <VideoUpload onUpload={handleUploadComplete} />
      </div>
    );
  }

  // Main video view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-card-border sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {videoData?.videoName || 'Video Manager'}
                </h1>
                {videoData && (
                  <p className="text-sm text-muted-foreground">
                    {videoData.duration !== null && `Duration: ${formatTime(videoData.duration)} • `}
                    Uploaded {new Date(videoData.uploadedAt).toLocaleDateString()}
                    {videoData.transcriptionStatus === 'processing' && ' • Transcribing...'}
                    {videoData.transcriptionStatus === 'failed' && ' • Transcription failed'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpload(true)}
                data-testid="button-upload-new"
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload New
              </Button>
              {videoData && (
                <>
                  {videoData.transcript && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAnalyzeWithAI}
                        disabled={isAnalyzing}
                        data-testid="button-analyze-ai"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportTranscript}
                        data-testid="button-export-transcript"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Transcript
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    data-testid="button-share"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {!videoData ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No video selected</p>
            <Button onClick={() => setShowUpload(true)}>Upload a Video</Button>
          </div>
        </div>
      ) : (
        /* Main Content */
        <main className="max-w-[1920px] mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
            {/* Left Column - Video & Timeline */}
            <div className="space-y-4">
              {/* Video Player */}
              <div className="sticky top-[88px] z-40">
                <VideoPlayer
                  ref={playerRef}
                  url={videoData.videoUrl}
                  playing={playing}
                  playbackRate={playbackRate}
                  onPlayingChange={setPlaying}
                  onTimeUpdate={setCurrentTime}
                  onPlaybackRateChange={setPlaybackRate}
                />
                
                {/* Timeline */}
                {videoData.segments && videoData.duration && (
                  <div className="mt-2">
                    <Timeline
                      segments={videoData.segments}
                      currentTime={currentTime}
                      duration={videoData.duration}
                      onSegmentClick={seekToTime}
                      activeSegment={getCurrentSegment()}
                    />
                  </div>
                )}
                {videoData.transcriptionStatus === 'processing' && (
                  <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Transcribing audio and analyzing video... This may take a few minutes.
                      </p>
                    </div>
                  </div>
                )}
                {videoData.transcriptionStatus === 'failed' && videoData.transcriptionError && (
                  <div className="mt-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Transcription failed: {videoData.transcriptionError}
                    </p>
                  </div>
                )}
              </div>

              {/* Summary & Reports */}
              {(videoData.analysis || aiAnalysis[videoData.id]) && (
                <div className="space-y-4">
                  <SummaryCard
                    summary={(aiAnalysis[videoData.id] || videoData.analysis)?.summary || ""}
                    highlights={(aiAnalysis[videoData.id] || videoData.analysis)?.highlights || []}
                  />
                  
                  <ReportTabs
                    mainTopics={(aiAnalysis[videoData.id] || videoData.analysis)?.mainTopics || []}
                    partialTopics={(aiAnalysis[videoData.id] || videoData.analysis)?.partialTopics || []}
                    speakers={(aiAnalysis[videoData.id] || videoData.analysis)?.speakers || []}
                    decisions={(aiAnalysis[videoData.id] || videoData.analysis)?.decisions || []}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Transcript */}
            {videoData.transcript && (
              <div className="lg:sticky lg:top-[88px] lg:self-start">
                <TranscriptPanel
                  transcript={videoData.transcript}
                  currentTime={currentTime}
                  onLineClick={seekToTime}
                  currentLine={getCurrentTranscriptLine()}
                />
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
