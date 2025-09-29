import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  List,
  Archive,
  Clock,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";

interface TrelloListCardProps {
  data: {
    id?: string;
    name?: string;
    closed?: boolean;
    pos?: number;
    softLimit?: number;
    idBoard?: string;
    subscribed?: boolean;
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

export function TrelloListCard({ data, state }: TrelloListCardProps) {
  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-sm border-2 border-purple-200 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm border-2 border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <List className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <CardTitle className="text-base leading-tight break-words">
              {data.name || "Untitled List"}
            </CardTitle>
          </div>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {data.closed && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Archive className="h-3 w-3" />
              Archived
            </Badge>
          )}

          {data.id && (
            <Badge variant="outline" className="text-xs font-mono">
              {data.id.substring(0, 8)}...
            </Badge>
          )}

          {data.subscribed && (
            <Badge variant="secondary" className="text-xs">
              Watching
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* List metadata */}
        <div className="space-y-2 text-xs text-muted-foreground">
          {data.pos !== undefined && (
            <div className="flex items-center justify-between">
              <span>Position:</span>
              <span className="font-mono font-medium">{data.pos}</span>
            </div>
          )}

          {data.softLimit && (
            <div className="flex items-center justify-between">
              <span>Card Limit:</span>
              <Badge variant="outline" className="text-xs">
                {data.softLimit} cards
              </Badge>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">Ready for cards</div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Just now
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
