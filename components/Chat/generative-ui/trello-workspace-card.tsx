import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, Building, Clock, Globe, Lock } from "lucide-react";

interface TrelloWorkspaceCardProps {
  data: {
    id?: string;
    displayName?: string;
    name?: string;
    description?: string;
    memberships?: Array<{ id: string; memberType: string }>;
    prefs?: {
      permissionLevel?: "private" | "public";
      boardVisibilityRestrict?: {
        private?: string;
        org?: string;
        public?: string;
      };
    };
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

export function TrelloWorkspaceCard({ data, state }: TrelloWorkspaceCardProps) {
  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-md border-2 border-orange-200 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  const isPrivate = data.prefs?.permissionLevel === "private";
  const memberCount = data.memberships?.length || 0;

  return (
    <Card className="w-full max-w-md border-2 border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
      {/* Header gradient */}
      <div className="h-16 w-full bg-gradient-to-r from-orange-400 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <CardHeader className="space-y-3 pb-3 -mt-6 relative">
        {/* Workspace Icon */}
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg border-4 border-white">
          <Briefcase className="h-8 w-8 text-white" />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-xl leading-tight break-words">
            {data.displayName || data.name || "Untitled Workspace"}
          </CardTitle>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={isPrivate ? "secondary" : "outline"}
              className="text-xs gap-1"
            >
              {isPrivate ? (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3" />
                  Public
                </>
              )}
            </Badge>

            {memberCount > 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                <Users className="h-3 w-3" />
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </Badge>
            )}

            {data.id && (
              <Badge variant="outline" className="text-xs font-mono">
                {data.id.substring(0, 8)}...
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {data.description && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border-l-2 border-orange-400">
            <p className="line-clamp-3">{data.description}</p>
          </div>
        )}

        {/* Board visibility settings */}
        {data.prefs?.boardVisibilityRestrict && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Board Visibility Restrictions:
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {["private", "org", "public"].map((type) => {
                const restriction =
                  data.prefs?.boardVisibilityRestrict?.[
                    type as keyof typeof data.prefs.boardVisibilityRestrict
                  ];
                return (
                  <div
                    key={type}
                    className="flex flex-col items-center gap-1 p-2 rounded bg-muted/50"
                  >
                    <span className="capitalize font-medium">{type}</span>
                    <Badge
                      variant={
                        restriction === "admin" ? "destructive" : "secondary"
                      }
                      className="text-[10px] px-1.5 py-0"
                    >
                      {restriction || "none"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building className="h-3.5 w-3.5" />
            Workspace created
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
