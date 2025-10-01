import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Clock,
  Lock,
  Globe,
  Users,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";

interface TrelloWorkspaceCardProps {
  data: {
    id?: string;
    displayName?: string;
    name?: string;
    desc?: string;
    website?: string;
    url?: string;
    logoUrl?: string;
    idBoards?: string[];
    memberships?: Array<{
      idMember: string;
      memberType: string;
    }>;
    prefs?: {
      permissionLevel?: "private" | "public" | "org";
      externalMembersDisabled?: boolean;
    };
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

export function TrelloWorkspaceCard({ data, state }: TrelloWorkspaceCardProps) {
  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
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
  const visibilityIcon =
    data.prefs?.permissionLevel === "private" ? (
      <Lock className="h-3 w-3" />
    ) : data.prefs?.permissionLevel === "org" ? (
      <Users className="h-3 w-3" />
    ) : (
      <Globe className="h-3 w-3" />
    );

  const boardCount = data.idBoards?.length || 0;
  const memberCount = data.memberships?.length || 0;

  return (
    <Card className="w-full max-w-md border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Workspace Header Background */}
      <div className="h-20 w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt={data.displayName || "Workspace"}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        ) : (
          <Briefcase className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary opacity-20" />
        )}
      </div>

      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="relative">
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt={data.displayName || "Workspace"}
                className="h-12 w-12 rounded-md border-2 border-background shadow-md object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-md border-2 border-background shadow-md bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>

          {/* Workspace Info */}
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight break-words">
              {data.displayName || data.name || "Untitled Workspace"}
            </CardTitle>
            {data.name && data.displayName !== data.name && (
              <p className="text-sm text-muted-foreground">@{data.name}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs capitalize gap-1">
            {visibilityIcon}
            {data.prefs?.permissionLevel || "private"}
          </Badge>

          {data.prefs?.externalMembersDisabled && (
            <Badge variant="outline" className="text-xs">
              No External Members
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
        {data.desc && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="line-clamp-3">{data.desc}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md text-center">
            <p className="font-semibold text-lg text-foreground">
              {boardCount}
            </p>
            <p className="text-xs">Board(s)</p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md text-center">
            <p className="font-semibold text-lg text-foreground">
              {memberCount}
            </p>
            <p className="text-xs">Member(s)</p>
          </div>
        </div>

        {/* Website */}
        {data.website && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-3.5 w-3.5 flex-shrink-0" />
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {data.website}
              </a>
            </div>
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
              Open Workspace
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
