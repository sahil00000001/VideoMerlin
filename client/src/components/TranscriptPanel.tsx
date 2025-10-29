import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TranscriptLine } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptPanelProps {
  transcript: TranscriptLine[];
  currentTime: number;
  onLineClick: (time: number) => void;
  currentLine: TranscriptLine | null;
}

const speakerColors: Record<string, string> = {
  "SPEAKER_00": "bg-blue-500",
  "SPEAKER_01": "bg-purple-500",
  "SPEAKER_02": "bg-green-500",
  "SPEAKER_03": "bg-orange-500",
};

const speakerNames: Record<string, string> = {
  "SPEAKER_00": "Consultant",
  "SPEAKER_01": "Client",
};

export default function TranscriptPanel({
  transcript,
  currentTime,
  onLineClick,
  currentLine,
}: TranscriptPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTranscript = transcript.filter(
    (line) =>
      searchQuery === "" ||
      line.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (speakerNames[line.speaker] || line.speaker).toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (activeLineRef.current && scrollAreaRef.current) {
      const container = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (container) {
        const lineRect = activeLineRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const isVisible = 
          lineRect.top >= containerRect.top &&
          lineRect.bottom <= containerRect.bottom;

        if (!isVisible) {
          activeLineRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }
  }, [currentLine]);

  return (
    <Card className="h-[calc(100vh-120px)]" data-testid="transcript-panel">
      <CardHeader className="border-b border-card-border">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Transcript
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            {transcript.length} lines
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-transcript-search"
          />
        </div>
      </CardHeader>

      <ScrollArea className="h-[calc(100%-140px)]" ref={scrollAreaRef}>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredTranscript.map((line, index) => {
              const isActive = currentLine?.timestamp === line.timestamp;
              const speakerColor = speakerColors[line.speaker] || "bg-gray-500";
              const speakerName = speakerNames[line.speaker] || line.speaker;

              return (
                <div
                  key={index}
                  ref={isActive ? activeLineRef : null}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200",
                    "hover:bg-muted/50",
                    isActive && "bg-primary/10 border-l-4 border-l-primary"
                  )}
                  onClick={() => onLineClick(line.timestamp)}
                  data-testid={`transcript-line-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs shrink-0 mt-0.5"
                    >
                      {formatTime(line.timestamp)}
                    </Badge>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            speakerColor,
                            "text-white text-xs"
                          )}
                        >
                          {speakerName}
                        </Badge>
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        isActive ? "text-foreground font-medium" : "text-foreground/90"
                      )}>
                        {line.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTranscript.length === 0 && (
              <div className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No results found</p>
              </div>
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
