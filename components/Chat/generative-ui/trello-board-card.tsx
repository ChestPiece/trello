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
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface TrelloBoardCardProps {
  data: {
    id?: string;
    name?: string;
    description?: string;
    desc?: string; // Trello API uses 'desc' field
    visibility?: "private" | "public" | "org";
    url?: string;
    closed?: boolean;
    starred?: boolean;
    pinned?: boolean;
    prefs?: {
      background?: string;
      backgroundColor?: string;
      permissionLevel?: string;
    };
  };
  state?:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
}

export function TrelloBoardCard({ data, state }: TrelloBoardCardProps) {
  const [copied, setCopied] = useState(false);

  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-sm border border-border/50 shadow-sm animate-pulse">
        <div className="h-16 bg-muted/30 rounded-t-lg" />
        <CardHeader className="space-y-2 pb-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  // Full rendered component
  const backgroundColor =
    data.prefs?.backgroundColor || data.prefs?.background || "#0079bf";

  // Use description or desc field
  const description = data.description || data.desc;

  // Determine visibility from prefs.permissionLevel or visibility field
  const visibility =
    data.prefs?.permissionLevel || data.visibility || "private";

  const visibilityIcon =
    visibility === "private" ? (
      <Lock className="h-3 w-3" />
    ) : visibility === "org" ? (
      <Users className="h-3 w-3" />
    ) : (
      <Globe className="h-3 w-3" />
    );

  const handleCopyId = async () => {
    if (data.id) {
      await navigator.clipboard.writeText(data.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="w-full max-w-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-card">
      {/* Board Preview Header */}
      <div
        className="h-16 w-full relative overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)`,
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:16px_16px]" />

        {/* Board icon and name overlay */}
        <div className="relative z-10 flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-lg">
          <Layout className="h-4 w-4 text-white" />
          <span className="text-white font-medium text-sm truncate max-w-[200px]">
            {data.name || "Untitled Board"}
          </span>
        </div>

        {/* Star indicator */}
        {(data.starred || data.pinned) && (
          <div className="absolute top-2 right-2">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          </div>
        )}
      </div>

      <CardHeader className="space-y-2 pb-2 px-4 pt-3">
        {/* Board name (duplicate for better hierarchy) */}
        <CardTitle className="text-base font-semibold leading-tight text-foreground">
          {data.name || "Untitled Board"}
        </CardTitle>

        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={visibility === "public" ? "default" : "secondary"}
            className="text-xs h-5 px-2 gap-1"
          >
            {visibilityIcon}
            {visibility === "public"
              ? "Public"
              : visibility === "org"
              ? "Team"
              : "Private"}
          </Badge>

          {data.closed && (
            <Badge variant="destructive" className="text-xs h-5 px-2">
              Archived
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4">
        {/* Description */}
        {description && (
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="line-clamp-2">{description}</p>
          </div>
        )}

        {/* Board ID with copy functionality */}
        {data.id && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-2 py-1.5">
            <span className="font-mono text-[10px] flex-1 truncate">
              {data.id.substring(0, 12)}...
            </span>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title="Copy full ID"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {data.url ? (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Trello
            </a>
          ) : (
            <div className="text-xs text-muted-foreground">
              No direct link available
            </div>
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
