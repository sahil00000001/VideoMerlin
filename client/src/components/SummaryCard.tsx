import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  summary: string;
  highlights: string[];
}

export default function SummaryCard({ summary, highlights }: SummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card data-testid="summary-card">
      <CardHeader
        className="cursor-pointer hover-elevate active-elevate-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Meeting Summary
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-toggle-summary"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/90 leading-relaxed">{summary}</p>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Key Highlights</h3>
            </div>
            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-foreground/90"
                  data-testid={`highlight-${index}`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
