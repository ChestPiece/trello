import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Layout,
  Lock,
  Globe,
  Users,
  ExternalLink,
  Star,
  Clock,
} from "lucide-react";

interface TrelloBoardCardProps {
  data: {
    id?: string;
    name?: string;
    description?: string;
    visibility?: "private" | "public" | "org";
    url?: string;
    closed?: boolean;
    starred?: boolean;
    prefs?: {
      background?: string;
      backgroundColor?: string;
    };
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

export function TrelloBoardCard({ data, state }: TrelloBoardCardProps) {
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

  // Full rendered component
  const backgroundColor =
    data.prefs?.backgroundColor || data.prefs?.background || "#0079bf";
  const visibilityIcon =
    data.visibility === "private" ? (
      <Lock className="h-3 w-3" />
    ) : data.visibility === "org" ? (
      <Users className="h-3 w-3" />
    ) : (
      <Globe className="h-3 w-3" />
    );

  return (
    <Card className="w-full max-w-md border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Board Preview Background */}
      <div
        className="h-20 w-full relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${backgroundColor}dd 0%, ${backgroundColor}aa 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-2 right-2">
          {data.starred && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      </div>

      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Layout className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg leading-tight break-words">
              {data.name || "Untitled Board"}
            </CardTitle>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs capitalize gap-1">
            {visibilityIcon}
            {data.visibility || "private"}
          </Badge>

          {data.closed && (
            <Badge variant="destructive" className="text-xs">
              Archived
            </Badge>
          )}

          {data.id && (
            <Badge variant="outline" className="text-xs font-mono">
              ID: {data.id.substring(0, 8)}...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {data.description && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="line-clamp-3">{data.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          {data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Trello
            </a>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Just now
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
