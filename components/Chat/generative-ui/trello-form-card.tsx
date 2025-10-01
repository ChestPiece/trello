import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversation } from "@/components/conversation-provider";

interface FormField {
  name: string;
  label?: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "dynamic-select"
    | "checkbox"
    | "datetime-local"
    | "url"
    | "color"
    | "file"
    | "hidden";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  description?: string;
  dependsOn?: string;
  value?: unknown;
}

interface TrelloFormCardProps {
  toolCallId: string;
  formType: string;
  input?: Record<string, unknown>;
  state?:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  onSubmit?: (formData: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export const TrelloFormCard = React.memo(function TrelloFormCard({
  toolCallId,
  formType,
  input,
  state,
  onSubmit,
  onCancel,
}: TrelloFormCardProps) {
  const { addToolResult } = useConversation();

  // Get form configuration from the client-side tool execution
  const formConfig = input as
    | {
        formType: string;
        title: string;
        description: string;
        fields: FormField[];
      }
    | undefined;

  // Debug logging (only log when state changes to avoid infinite loops)
  useEffect(() => {
    console.log("TrelloFormCard Debug:", {
      state,
      formType,
      input,
      formConfig,
      hasFields: !!formConfig?.fields,
      fieldsLength: formConfig?.fields?.length,
    });
  }, [state, formType, input, formConfig]);

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initialData: Record<string, unknown> = {};
    if (formConfig?.fields) {
      formConfig.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else if (field.type === "checkbox") {
          initialData[field.name] = false;
        } else {
          initialData[field.name] = "";
        }
      });
    }
    return initialData;
  });

  // State for dynamic options (e.g., lists that depend on selected board)
  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, Array<{ value: string; label: string }>>
  >({});
  const [loadingDynamicOptions, setLoadingDynamicOptions] = useState<
    Record<string, boolean>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      id: string;
      name: string;
      url?: string;
      [key: string]: unknown;
    };
  } | null>(null);

  // Function to fetch dynamic options (e.g., lists for a selected board)
  const fetchDynamicOptions = async (
    fieldName: string,
    dependsOnValue: string
  ) => {
    if (!dependsOnValue) return;

    setLoadingDynamicOptions((prev) => ({ ...prev, [fieldName]: true }));

    try {
      if (fieldName === "idList" && dependsOnValue) {
        // Fetch lists for the selected board using API route
        const response = await fetch(
          `/api/lists?boardId=${dependsOnValue}&filter=open&fields=id,name`
        );
        const result = await response.json();

        if (result.success) {
          const listOptions = result.lists.map(
            (list: { id: string; name: string }) => ({
              value: list.id,
              label: list.name,
            })
          );
          setDynamicOptions((prev) => ({ ...prev, [fieldName]: listOptions }));
        } else {
          console.error(`Failed to fetch lists:`, result.error);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch options for ${fieldName}:`, error);
    } finally {
      setLoadingDynamicOptions((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  // Effect to fetch dynamic options when dependencies change
  useEffect(() => {
    if (!formConfig?.fields) return;

    formConfig.fields.forEach((field) => {
      if (field.type === "dynamic-select" && field.dependsOn) {
        const dependsOnValue = formData[field.dependsOn] as string;
        if (dependsOnValue && !dynamicOptions[field.name]) {
          fetchDynamicOptions(field.name, dependsOnValue);
        }
      }
    });
  }, [formData, formConfig?.fields, dynamicOptions]);

  // Loading skeleton for real-time streaming
  if (
    (state === "input-streaming" || !formConfig || !formConfig.fields) &&
    !submissionResult
  ) {
    return (
      <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-lg animate-pulse">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state after submission
  if (submissionResult) {
    return (
      <Card className="w-full max-w-2xl border-2 border-green-200 shadow-xl bg-gradient-to-br from-green-50 to-white">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-3 text-green-700">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold">Success!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-green-800 font-medium text-lg mb-2">
                  {submissionResult.message}
                </p>
                {submissionResult.data && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <span className="font-medium">ID:</span>
                      <code className="px-2 py-1 bg-green-200 rounded text-xs font-mono">
                        {submissionResult.data.id}
                      </code>
                    </div>
                    {submissionResult.data.url && (
                      <div className="pt-2">
                        <a
                          href={submissionResult.data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          View in Trello
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setSubmissionResult(null);
                setFormData({});
                setDynamicOptions({});
                setFormError(null);
                setIsSubmitting(false);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {formType.startsWith("create") ? "Create Another" : "Done"}
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 font-medium py-2.5"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [fieldName]: value,
      };

      // Clear dependent fields when their dependencies change
      if (formConfig?.fields) {
        formConfig.fields.forEach((field) => {
          if (
            field.type === "dynamic-select" &&
            field.dependsOn === fieldName
          ) {
            newData[field.name] = "";
            // Clear dynamic options for this field
            setDynamicOptions((prevOptions) => ({
              ...prevOptions,
              [field.name]: [],
            }));
          }
        });
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formConfig?.fields) {
        setFormError("Form configuration is not available");
        setIsSubmitting(false);
        return;
      }

      const requiredFields = formConfig.fields.filter(
        (field) => field.required
      );
      const missingFields = requiredFields.filter(
        (field) => !formData[field.name] || formData[field.name] === ""
      );

      if (missingFields.length > 0) {
        setFormError(
          `Please fill in all required fields: ${missingFields
            .map((f) => f.label)
            .join(", ")}`
        );
        setIsSubmitting(false);
        return;
      }

      // Clear any previous errors
      setFormError(null);

          let result: {
            success: boolean;
            board?: {
              id: string;
              name: string;
              url?: string;
              [key: string]: unknown;
            };
            list?: { id: string; name: string; [key: string]: unknown };
            card?: { id: string; name: string; [key: string]: unknown };
            member?: { id: string; name: string; [key: string]: unknown };
            label?: { id: string; name: string; [key: string]: unknown };
            error?: string;
          };
      let successMessage: string;

      // Handle different form types using API routes
      if (formType === "createBoard") {
        const response = await fetch("/api/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(formData.name || ""),
            description: formData.description
              ? String(formData.description)
              : undefined,
            visibility:
              (formData.visibility as "private" | "public" | "org") ||
              "private",
            defaultLists: Boolean(formData.defaultLists ?? true),
            defaultLabels: Boolean(formData.defaultLabels ?? true),
          }),
        });
        result = await response.json();
        if (!result.success)
          throw new Error(result.error || "Failed to create board");
        if (!result.board) throw new Error("Board data not returned");
        successMessage = `Board "${result.board.name}" created successfully!`;

        // Set success state
        setSubmissionResult({
          success: true,
          message: successMessage,
          data: result.board,
        });
      } else if (formType === "updateBoard") {
        const boardId = String(formData.boardId || "");
        const response = await fetch(`/api/boards?id=${boardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name ? String(formData.name) : undefined,
            description: formData.description
              ? String(formData.description)
              : undefined,
            visibility: formData.visibility as
              | "private"
              | "public"
              | "org"
              | undefined,
            closed: Boolean(formData.closed),
          }),
        });
        result = await response.json();
        if (!result.success)
          throw new Error(result.error || "Failed to update board");
        if (!result.board) throw new Error("Board data not returned");
        successMessage = `Board "${result.board.name}" updated successfully!`;

        // Set success state
        setSubmissionResult({
          success: true,
          message: successMessage,
          data: result.board,
        });
      } else if (formType === "createList") {
        const response = await fetch("/api/lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(formData.name || ""),
            boardId: String(formData.idBoard || ""),
          }),
        });
        result = await response.json();
        if (!result.success)
          throw new Error(result.error || "Failed to create list");
        if (!result.list) throw new Error("List data not returned");
        successMessage = `List "${result.list.name}" created successfully!`;

        // Set success state
        setSubmissionResult({
          success: true,
          message: successMessage,
          data: result.list,
        });
      } else if (formType === "updateList") {
        const listId = String(formData.listId || "");
        const response = await fetch(`/api/lists?id=${listId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name ? String(formData.name) : undefined,
            closed: Boolean(formData.closed),
            pos: formData.pos ? String(formData.pos) : undefined,
          }),
        });
        result = await response.json();
        if (!result.success)
          throw new Error(result.error || "Failed to update list");
        if (!result.list) throw new Error("List data not returned");
        successMessage = `List "${result.list.name}" updated successfully!`;

        // Set success state
        setSubmissionResult({
          success: true,
          message: successMessage,
          data: result.list,
        });
      } else if (formType === "createCard") {
        const response = await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(formData.name || ""),
            desc: formData.desc ? String(formData.desc) : undefined,
            idList: String(formData.idList || ""),
            due: formData.due ? String(formData.due) : undefined,
          }),
        });
        result = await response.json();
        if (!result.success)
          throw new Error(result.error || "Failed to create card");
        if (!result.card) throw new Error("Card data not returned");
        successMessage = `Card "${result.card.name}" created successfully!`;

        // Set success state
        setSubmissionResult({
          success: true,
          message: successMessage,
          data: result.card,
        });
      } else if (formType === "updateCard") {
        const cardId = String(formData.cardId || "");
        const response = await fetch(`/api/cards?id=${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name ? String(formData.name) : undefined,
            desc: formData.desc ? String(formData.desc) : undefined,
            idList: formData.idList ? String(formData.idList) : undefined,
            idBoard: formData.idBoard ? String(formData.idBoard) : undefined,
            due: formData.due ? String(formData.due) : undefined,
            closed: Boolean(formData.closed),
          }),
        });
        result = await response.json();
        if (!result.success)
          throw new Error(result.error || "Failed to update card");
        if (!result.card) throw new Error("Card data not returned");
        successMessage = `Card "${result.card.name}" updated successfully!`;

        // Set success state
        setSubmissionResult({
          success: true,
          message: successMessage,
          data: result.card,
        });
          } else if (formType === "archiveList") {
            const listId = String(formData.listId || "");
            const response = await fetch(`/api/lists?id=${listId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                closed: true,
              }),
            });
            result = await response.json();
            if (!result.success)
              throw new Error(result.error || "Failed to archive list");
            if (!result.list) throw new Error("List data not returned");
            successMessage = `List "${result.list.name}" archived successfully!`;

            setSubmissionResult({
              success: true,
              message: successMessage,
              data: result.list,
            });
          } else if (formType === "unarchiveList") {
            const listId = String(formData.listId || "");
            const response = await fetch(`/api/lists?id=${listId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                closed: false,
              }),
            });
            result = await response.json();
            if (!result.success)
              throw new Error(result.error || "Failed to unarchive list");
            if (!result.list) throw new Error("List data not returned");
            successMessage = `List "${result.list.name}" unarchived successfully!`;

            setSubmissionResult({
              success: true,
              message: successMessage,
              data: result.list,
            });
          } else if (formType === "addMemberToBoard") {
            const response = await fetch("/api/members", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                boardId: String(formData.boardId || ""),
                memberId: String(formData.memberId || ""),
                type: String(formData.type || "normal"),
              }),
            });
            result = await response.json();
            if (!result.success)
              throw new Error(result.error || "Failed to add member to board");
            successMessage = `Member added to board successfully!`;

            setSubmissionResult({
              success: true,
              message: successMessage,
              data: result.member,
            });
          } else if (formType === "removeMemberFromBoard") {
            const response = await fetch("/api/members", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                boardId: String(formData.boardId || ""),
                memberId: String(formData.memberId || ""),
              }),
            });
            result = await response.json();
            if (!result.success)
              throw new Error(result.error || "Failed to remove member from board");
            successMessage = `Member removed from board successfully!`;

            setSubmissionResult({
              success: true,
              message: successMessage,
              data: result.member,
            });
          } else if (formType === "addLabelToCard") {
            const response = await fetch("/api/labels", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cardId: String(formData.cardId || ""),
                labelId: String(formData.labelId || ""),
              }),
            });
            result = await response.json();
            if (!result.success)
              throw new Error(result.error || "Failed to add label to card");
            successMessage = `Label added to card successfully!`;

            setSubmissionResult({
              success: true,
              message: successMessage,
              data: result.label,
            });
          } else if (formType === "removeLabelFromCard") {
            const response = await fetch("/api/labels", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cardId: String(formData.cardId || ""),
                labelId: String(formData.labelId || ""),
              }),
            });
            result = await response.json();
            if (!result.success)
              throw new Error(result.error || "Failed to remove label from card");
            successMessage = `Label removed from card successfully!`;

            setSubmissionResult({
              success: true,
              message: successMessage,
              data: result.label,
            });
          } else if (formType === "deleteAttachment") {
            const attachmentId = String(formData.attachmentId || "");
            const response = await fetch(`/api/attachments?id=${attachmentId}`, {
              method: "DELETE",
            });
            result = await response.json();
            if (!result.success)
              throw new Error(result.error || "Failed to delete attachment");
            successMessage = `Attachment deleted successfully!`;

            setSubmissionResult({
              success: true,
              message: successMessage,
              data: { id: attachmentId, name: `Attachment ${attachmentId}` },
            });
          } else if (formType === "deleteChecklistItem") {
            const checklistItemId = String(formData.checklistItemId || "");
            const response = await fetch(`/api/checklists/item?id=${checklistItemId}`, {
              method: "DELETE",
            });
            result = await response.json();
            if (!result.success)
              throw new Error(result.error || "Failed to delete checklist item");
            successMessage = `Checklist item deleted successfully!`;

            setSubmissionResult({
              success: true,
              message: successMessage,
              data: { id: checklistItemId, name: `Checklist Item ${checklistItemId}` },
            });
          } else {
            throw new Error(`Unknown form type: ${formType}`);
          }

      // Use addToolResult to submit the API result
      const outputData: Record<string, unknown> = {
        success: true,
        message: successMessage,
      };

      if (
        (formType === "createBoard" || formType === "updateBoard") &&
        result.board
      ) {
        outputData.board = result.board;
      } else if (
        (formType === "createList" || formType === "updateList") &&
        result.list
      ) {
        outputData.list = result.list;
      } else if (
        (formType === "createCard" || formType === "updateCard") &&
        result.card
      ) {
        outputData.card = result.card;
      }

      addToolResult({
        tool: formType,
        toolCallId: toolCallId,
        output: outputData,
      });

      // Also call the optional onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage = `Failed to submit form: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;

      // Set form error for display
      setFormError(errorMessage);

      // Set error state
      setSubmissionResult({
        success: false,
        message: errorMessage,
        data: undefined,
      });

      // Handle error with addToolResult
      addToolResult({
        tool: formType,
        toolCallId: toolCallId,
        state: "output-error",
        errorText: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = (formData[field.name] as string) || "";

    switch (field.type) {
      case "hidden":
        return (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={field.value as string}
          />
        );

      case "text":
        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={3}
              className="border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors resize-none"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value as string}
              onValueChange={(val) => handleInputChange(field.name, val)}
            >
              <SelectTrigger className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "dynamic-select":
        const dynamicFieldOptions = dynamicOptions[field.name] || [];
        const isLoading = loadingDynamicOptions[field.name];
        const dependsOnValue = field.dependsOn
          ? (formData[field.dependsOn] as string)
          : "";

        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value as string}
              onValueChange={(val) => handleInputChange(field.name, val)}
              disabled={!dependsOnValue || isLoading}
            >
              <SelectTrigger className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue
                  placeholder={
                    !dependsOnValue
                      ? `Select ${field.dependsOn} first...`
                      : isLoading
                      ? "Loading options..."
                      : field.placeholder || "Select an option..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {dynamicFieldOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading options...</span>
              </div>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={field.name}
                checked={formData[field.name] as boolean}
                onCheckedChange={(checked) =>
                  handleInputChange(field.name, checked)
                }
                className="h-4 w-4 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
              />
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed ml-7">
                {field.description}
              </p>
            )}
          </div>
        );

      case "datetime-local":
        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="datetime-local"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "url":
        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="url"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "color":
        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id={field.name}
                type="color"
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="w-16 h-11 p-1 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors cursor-pointer rounded"
                required={field.required}
              />
              <Input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="flex-1 h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
              />
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Convert file to base64
                  const reader = new FileReader();
                  reader.onload = () => {
                    handleInputChange(field.name, reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              required={field.required}
              className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render if formConfig is not available
  if (!formConfig) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          {formConfig.title}
        </CardTitle>
        <p className="text-muted-foreground leading-relaxed">
          {formConfig.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formConfig.fields.map(renderField)}

          {formError && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-border/50">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 h-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {formType.startsWith("create")
                    ? "Creating..."
                    : "Updating..."}
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        formType.startsWith("create")
                          ? "M12 6v6m0 0v6m0-6h6m-6 0H6"
                          : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      }
                    />
                  </svg>
                  {formType.startsWith("create")
                    ? `Create ${formType.replace("create", "")}`
                    : `Update ${formType.replace("update", "")}`}
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 border-gray-300 hover:bg-gray-50 font-medium py-2.5 h-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
});
