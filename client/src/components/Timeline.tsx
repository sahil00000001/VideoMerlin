import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimelineSegment } from "@shared/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface TimelineProps {
  segments: TimelineSegment[];
  currentTime: number;
  duration: number;
  onSegmentClick: (time: number) => void;
  activeSegment: TimelineSegment | null;
}

export default function Timeline({
  segments,
  currentTime,
  duration,
  onSegmentClick,
  activeSegment,
}: TimelineProps) {
  const [hoveredSegment, setHoveredSegment] = useState<TimelineSegment | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSegmentWidth = (segment: TimelineSegment): string => {
    const segmentDuration = segment.endTime - segment.startTime;
    return `${(segmentDuration / duration) * 100}%`;
  };

  const getCurrentPosition = (): string => {
    return `${(currentTime / duration) * 100}%`;
  };

  return (
    <Card className="overflow-hidden" data-testid="timeline-container">
      <div className="relative h-20">
        {/* Segments */}
        <div className="absolute inset-0 flex">
          <TooltipProvider delayDuration={200}>
            {segments.map((segment, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "relative h-full transition-all duration-200 border-r-2 border-white overflow-hidden group",
                      "hover:brightness-95 active:brightness-90",
                      hoveredSegment === segment && "brightness-95 scale-[1.02] z-10",
                      activeSegment === segment && "ring-2 ring-primary ring-inset"
                    )}
                    style={{
                      width: getSegmentWidth(segment),
                      backgroundColor: segment.color,
                    }}
                    onClick={() => onSegmentClick(segment.startTime)}
                    onMouseEnter={() => setHoveredSegment(segment)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    data-testid={`timeline-segment-${index}`}
                  >
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <div className="text-left">
                        <div className="text-sm font-semibold text-foreground/90 line-clamp-1">
                          {segment.topic}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </div>
                      </div>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-xs p-4"
                  data-testid={`tooltip-segment-${index}`}
                >
                  <div className="space-y-2">
                    <div className="font-semibold text-base">{segment.topic}</div>
                    <div className="text-sm text-muted-foreground">{segment.description}</div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {segment.keywords.map((keyword, kidx) => (
                        <Badge
                          key={kidx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Current Position Indicator */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary transition-all duration-100 pointer-events-none z-20"
          style={{ left: getCurrentPosition() }}
          data-testid="timeline-current-position"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-primary rounded-full shadow-lg" />
        </div>
      </div>
    </Card>
  );
}
