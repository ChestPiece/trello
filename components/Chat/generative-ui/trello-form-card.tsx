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
import { Loader2, Save, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversation } from "@/components/conversation-provider";

interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "dynamic-select"
    | "checkbox"
    | "datetime-local"
    | "url"
    | "color"
    | "file";
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  description?: string;
  dependsOn?: string;
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
    data?: any;
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
        // Fetch lists for the selected board
        const { listListsTool } = await import(
          "@/TrelloTools/ListTools/list-lists"
        );
        const result = await listListsTool.execute({
          boardId: dependsOnValue,
          filter: "open",
          fields: ["id", "name"],
        });

        if (result.success) {
          const listOptions = result.lists.map((list: any) => ({
            value: list.id,
            label: list.name,
          }));
          setDynamicOptions((prev) => ({ ...prev, [fieldName]: listOptions }));
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
              Create Another
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
        alert("Form configuration is not available");
        setIsSubmitting(false);
        return;
      }

      const requiredFields = formConfig.fields.filter(
        (field) => field.required
      );
      for (const field of requiredFields) {
        if (!formData[field.name] || formData[field.name] === "") {
          alert(`Please fill in the ${field.label} field`);
          setIsSubmitting(false);
          return;
        }
      }

      let result: any;
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
        successMessage = `Board "${result.board.name}" created successfully!`;

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
        successMessage = `List "${result.list.name}" created successfully!`;

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
        successMessage = `Card "${result.card.name}" created successfully!`;

        // Set success state
        setSubmissionResult({
          success: true,
          message: successMessage,
          data: result.card,
        });
      } else {
        throw new Error(`Unknown form type: ${formType}`);
      }

      // Use addToolResult to submit the API result
      addToolResult({
        tool: formType,
        toolCallId: toolCallId,
        output: {
          success: true,
          [formType.replace("create", "").toLowerCase()]:
            result[formType.replace("create", "").toLowerCase()],
          message: successMessage,
        },
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

      // Set error state
      setSubmissionResult({
        success: false,
        message: errorMessage,
        data: null,
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
                  Creating...
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create {formType.replace("create", "")}
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
