import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Paperclip,
  Clock,
  FileText,
  Image as ImageIcon,
  File,
  Download,
} from "lucide-react";

interface TrelloAttachmentCardProps {
  data: {
    id?: string;
    name?: string;
    url?: string;
    fileName?: string;
    mimeType?: string;
    bytes?: number;
    date?: string;
    idCard?: string;
    isUpload?: boolean;
    previews?: Array<{
      id: string;
      url: string;
      width: number;
      height: number;
    }>;
  };
  state?: "input-streaming" | "input-available" | "output-available";
}

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Helper function to get file icon
const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <File className="h-8 w-8 text-primary" />;
  if (mimeType.startsWith("image/"))
    return <ImageIcon className="h-8 w-8 text-primary" />;
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return <FileText className="h-8 w-8 text-primary" />;
  return <File className="h-8 w-8 text-primary" />;
};

export function TrelloAttachmentCard({
  data,
  state,
}: TrelloAttachmentCardProps) {
  // Loading skeleton for real-time streaming
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-32 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full rendered component
  const isImage = data.mimeType?.startsWith("image/");
  const previewUrl = data.previews?.[0]?.url || data.url;

  return (
    <Card className="w-full max-w-md border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Preview/Icon Section */}
      <div className="h-32 w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center">
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt={data.name || "Attachment"}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="z-10">{getFileIcon(data.mimeType)}</div>
          </>
        )}
      </div>

      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Paperclip className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg leading-tight break-words">
              {data.name || data.fileName || "Untitled Attachment"}
            </CardTitle>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {data.mimeType && (
            <Badge variant="secondary" className="text-xs">
              {data.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
            </Badge>
          )}

          {data.bytes && (
            <Badge variant="outline" className="text-xs">
              {formatBytes(data.bytes)}
            </Badge>
          )}

          {data.isUpload && (
            <Badge variant="outline" className="text-xs">
              Uploaded
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
        {/* File Details */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md space-y-1">
          {data.fileName && (
            <p className="font-mono text-xs">{data.fileName}</p>
          )}
          {data.date && (
            <p className="text-xs">
              Added: {new Date(data.date).toLocaleString()}
            </p>
          )}
        </div>

        {/* Card Reference */}
        {data.idCard && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-mono text-xs">Card: {data.idCard}</p>
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
              <Download className="h-3.5 w-3.5" />
              Download
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
