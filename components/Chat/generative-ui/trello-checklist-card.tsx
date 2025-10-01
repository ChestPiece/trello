import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Circle, CheckCircle2, Clock } from "lucide-react";

interface ChecklistItem {
  id: string;
  name: string;
  state: "complete" | "incomplete";
  pos: number;
}

interface TrelloChecklistCardProps {
  data: {
    id?: string;
    name?: string;
    idCard?: string;
    idBoard?: string;
    pos?: number;
    checkItems?: ChecklistItem[];
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

export function TrelloChecklistCard({ data, state }: TrelloChecklistCardProps) {
  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress
  const totalItems = data.checkItems?.length || 0;
  const completedItems =
    data.checkItems?.filter((item) => item.state === "complete").length || 0;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Card className="w-full max-w-md border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Checklist Header with Progress */}
      <div className="h-16 w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <CheckSquare className="h-8 w-8 text-primary z-10" />
      </div>

      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg leading-tight break-words">
              {data.name || "Untitled Checklist"}
            </CardTitle>
          </div>
        </div>

        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completedItems} of {totalItems} completed
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {data.id && (
            <Badge variant="outline" className="text-xs font-mono">
              ID: {data.id.substring(0, 8)}...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Checklist Items */}
        {data.checkItems && data.checkItems.length > 0 && (
          <div className="space-y-2">
            {data.checkItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                {item.state === "complete" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={
                    item.state === "complete"
                      ? "line-through text-muted-foreground"
                      : ""
                  }
                >
                  {item.name}
                </span>
              </div>
            ))}
            {data.checkItems.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                + {data.checkItems.length - 5} more items
              </p>
            )}
          </div>
        )}

        {/* Card Reference */}
        {data.idCard && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-mono text-xs">Card: {data.idCard}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" />
            Checklist Details
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

