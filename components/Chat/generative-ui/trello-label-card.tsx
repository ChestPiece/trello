import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, Clock, Square } from "lucide-react";

interface TrelloLabelCardProps {
  data: {
    id?: string;
    name?: string;
    color?: string;
    idBoard?: string;
    uses?: number;
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

// Color mapping for Trello labels
const labelColorMap: Record<string, string> = {
  yellow: "#f2d600",
  purple: "#c377e0",
  blue: "#0079bf",
  red: "#eb5a46",
  green: "#61bd4f",
  orange: "#ff9f1a",
  black: "#344563",
  sky: "#00c2e0",
  pink: "#ff78cb",
  lime: "#51e898",
};

export function TrelloLabelCard({ data, state }: TrelloLabelCardProps) {
  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full rendered component
  const labelColor = data.color
    ? labelColorMap[data.color] || data.color
    : "#344563";

  return (
    <Card className="w-full max-w-md border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Label Color Preview */}
      <div
        className="h-16 w-full relative overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${labelColor}dd 0%, ${labelColor}aa 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <Tag className="h-8 w-8 text-white/90 z-10" />
      </div>

      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Square
              className="h-4 w-4 flex-shrink-0"
              style={{ fill: labelColor, color: labelColor }}
            />
            <CardTitle className="text-lg leading-tight break-words">
              {data.name || "Untitled Label"}
            </CardTitle>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="text-xs capitalize"
            style={{
              backgroundColor: `${labelColor}20`,
              color: labelColor,
              borderColor: labelColor,
            }}
          >
            {data.color || "default"}
          </Badge>

          {data.id && (
            <Badge variant="outline" className="text-xs font-mono">
              ID: {data.id.substring(0, 8)}...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Stats */}
        {data.uses !== undefined && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p>Used on {data.uses} card(s)</p>
          </div>
        )}

        {/* Board Reference */}
        {data.idBoard && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-mono text-xs">Board: {data.idBoard}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            Label Details
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Just now
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
