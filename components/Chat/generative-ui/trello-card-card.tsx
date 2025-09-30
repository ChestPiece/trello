import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Calendar,
  CheckSquare,
  Clock,
  ExternalLink,
  Tag,
  Paperclip,
  User,
} from "lucide-react";

interface TrelloCardCardProps {
  data: {
    id?: string;
    name?: string;
    description?: string;
    due?: string;
    dueComplete?: boolean;
    url?: string;
    labels?: Array<{ id: string; name: string; color: string }>;
    badges?: {
      attachments?: number;
      checkItems?: number;
      checkItemsChecked?: number;
      comments?: number;
    };
    members?: Array<{ id: string; fullName: string }>;
    idList?: string;
    closed?: boolean;
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

export function TrelloCardCard({ data, state }: TrelloCardCardProps) {
  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-md border-2 border-blue-200 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate due date status
  const isDueSoon =
    data.due &&
    new Date(data.due) <= new Date(Date.now() + 24 * 60 * 60 * 1000);
  const isOverdue =
    data.due && new Date(data.due) < new Date() && !data.dueComplete;

  return (
    <Card className="w-full max-w-md border-2 border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start gap-2">
          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight break-words">
              {data.name || "Untitled Card"}
            </CardTitle>

            {/* Labels */}
            {data.labels && data.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {data.labels.map((label) => (
                  <Badge
                    key={label.id}
                    className="text-xs"
                    style={{
                      backgroundColor: label.color,
                      color: "white",
                    }}
                  >
                    {label.name || label.color}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2">
          {data.closed && (
            <Badge variant="destructive" className="text-xs">
              Archived
            </Badge>
          )}

          {data.id && (
            <Badge variant="outline" className="text-xs font-mono">
              {data.id.substring(0, 8)}...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {data.description && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border-l-2 border-blue-400">
            <p className="line-clamp-3">{data.description}</p>
          </div>
        )}

        {/* Due Date */}
        {data.due && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant={
                data.dueComplete
                  ? "default"
                  : isOverdue
                  ? "destructive"
                  : isDueSoon
                  ? "secondary"
                  : "outline"
              }
              className="text-xs"
            >
              {data.dueComplete && "✓ "}
              {new Date(data.due).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </div>
        )}

        {/* Stats */}
        {data.badges && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {data.badges.checkItems !== undefined &&
              data.badges.checkItems > 0 && (
                <div className="flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>
                    {data.badges.checkItemsChecked || 0}/
                    {data.badges.checkItems}
                  </span>
                </div>
              )}

            {data.badges.attachments !== undefined &&
              data.badges.attachments > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{data.badges.attachments}</span>
                </div>
              )}

            {data.badges.comments !== undefined && data.badges.comments > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{data.badges.comments}</span>
              </div>
            )}
          </div>
        )}

        {/* Members */}
        {data.members && data.members.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {data.members.slice(0, 3).map((member, idx) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow"
                  title={member.fullName}
                >
                  {member.fullName?.charAt(0).toUpperCase()}
                </div>
              ))}
              {data.members.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold border-2 border-white shadow">
                  +{data.members.length - 3}
                </div>
              )}
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
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Card
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


