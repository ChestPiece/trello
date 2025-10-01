import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Clock, ExternalLink, Shield, Star } from "lucide-react";

interface TrelloMemberCardProps {
  data: {
    id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
    memberType?: "normal" | "ghost" | "admin" | "observer";
    confirmed?: boolean;
    url?: string;
    initials?: string;
    idBoards?: string[];
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

// Helper function to get role badge color
const getRoleBadgeVariant = (
  memberType?: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (memberType) {
    case "admin":
      return "destructive";
    case "normal":
      return "default";
    case "observer":
      return "secondary";
    case "ghost":
      return "outline";
    default:
      return "secondary";
  }
};

export function TrelloMemberCard({ data, state }: TrelloMemberCardProps) {
  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full rendered component
  const initials =
    data.initials ||
    data.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    "??";

  return (
    <Card className="w-full max-w-md border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Member Header Background */}
      <div className="h-20 w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      </div>

      <CardHeader className="space-y-3 pb-3 -mt-8">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative">
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.fullName || "Member"}
                className="h-16 w-16 rounded-full border-4 border-background shadow-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border-4 border-background shadow-lg bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {initials}
                </span>
              </div>
            )}
            {data.confirmed && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-1 pt-2">
            <CardTitle className="text-lg leading-tight break-words">
              {data.fullName || "Unknown Member"}
            </CardTitle>
            {data.username && (
              <p className="text-sm text-muted-foreground">@{data.username}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {data.memberType && (
            <Badge
              variant={getRoleBadgeVariant(data.memberType)}
              className="text-xs capitalize gap-1"
            >
              <Shield className="h-3 w-3" />
              {data.memberType}
            </Badge>
          )}

          {data.email && (
            <Badge variant="outline" className="text-xs gap-1">
              <Mail className="h-3 w-3" />
              Email
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
        {/* Bio */}
        {data.bio && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="line-clamp-3">{data.bio}</p>
          </div>
        )}

        {/* Email */}
        {data.email && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-mono text-xs break-all">{data.email}</p>
          </div>
        )}

        {/* Board Count */}
        {data.idBoards && data.idBoards.length > 0 && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p>Member of {data.idBoards.length} board(s)</p>
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
              View Profile
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

