import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CircleDashed,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Speaker } from "@shared/schema";

interface ReportTabsProps {
  mainTopics: Array<{ name: string; icon: string }>;
  partialTopics: Array<{ name: string; reason: string }>;
  speakers: Speaker[];
  decisions: Array<{ decision: string; actionItems: string[] }>;
}

const iconMap: Record<string, any> = {
  Sparkles,
  CircleDashed,
  Users,
  CheckCircle2,
  Clock,
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function ReportTabs({
  mainTopics,
  partialTopics,
  speakers,
  decisions,
}: ReportTabsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const speakerData = speakers.map((speaker, index) => ({
    name: speaker.role,
    value: speaker.speakingTime,
    color: COLORS[index % COLORS.length],
  }));

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / speakerData.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <Card data-testid="report-tabs">
      <Tabs defaultValue="topics" className="w-full">
        <div className="border-b border-border">
          <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="topics"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              data-testid="tab-topics"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Topics Discussed
            </TabsTrigger>
            <TabsTrigger
              value="partial"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              data-testid="tab-partial"
            >
              <CircleDashed className="h-4 w-4 mr-2" />
              Partial Topics
            </TabsTrigger>
            <TabsTrigger
              value="speakers"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              data-testid="tab-speakers"
            >
              <Users className="h-4 w-4 mr-2" />
              Speakers
            </TabsTrigger>
            <TabsTrigger
              value="decisions"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              data-testid="tab-decisions"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Decisions & Actions
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-6">
          <TabsContent value="topics" className="mt-0 space-y-3">
            {mainTopics.map((topic, index) => {
              const Icon = iconMap[topic.icon] || Sparkles;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-md bg-muted/30 hover-elevate"
                  data-testid={`topic-${index}`}
                >
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{topic.name}</h4>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="partial" className="mt-0 space-y-3">
            {partialTopics.map((topic, index) => (
              <div
                key={index}
                className="p-4 rounded-md border border-border bg-card"
                data-testid={`partial-topic-${index}`}
              >
                <div className="flex items-start gap-3">
                  <CircleDashed className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm">{topic.name}</h4>
                    <p className="text-sm text-muted-foreground">{topic.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="speakers" className="mt-0">
            <div className="space-y-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={speakerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {speakerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatTime(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {speakers.map((speaker, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-md bg-muted/30"
                    data-testid={`speaker-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <h4 className="font-medium text-sm">{speaker.role}</h4>
                        <p className="text-xs text-muted-foreground">{speaker.name}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(speaker.speakingTime)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="decisions" className="mt-0 space-y-4">
            {decisions.map((decision, index) => (
              <div
                key={index}
                className="p-4 rounded-md border border-border bg-card space-y-3"
                data-testid={`decision-${index}`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-3">{decision.decision}</h4>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Action Items
                      </p>
                      <ul className="space-y-2">
                        {decision.actionItems.map((item, aidx) => (
                          <li
                            key={aidx}
                            className="flex items-start gap-2 text-sm"
                            data-testid={`action-item-${index}-${aidx}`}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <span className="text-foreground/90">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
