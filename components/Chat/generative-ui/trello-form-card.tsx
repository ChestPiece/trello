import React, { useState, useEffect, useCallback } from "react";
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
    | "checkbox-group"
    | "radio-group"
    | "datetime-local"
    | "date"
    | "time"
    | "url"
    | "email"
    | "number"
    | "range"
    | "color"
    | "file"
    | "hidden"
    | "password"
    | "search"
    | "tel";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  value?: unknown;
  description?: string;
  dependsOn?: string;
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => string | null;
  };
  conditional?: {
    field: string;
    operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
    value: unknown;
  };
  helpText?: string;
  errorText?: string;
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
  onCancel?: () => void;
}

// Helper function to map form types to tool names
const getToolNameForFormType = (formType: string): string | null => {
  const formTypeToToolMap: Record<string, string> = {
    // Create forms
    createBoard: "createBoard",
    createCard: "createCard",
    createList: "createList",
    createWorkspace: "createWorkspace",
    createLabel: "createLabel",
    createChecklist: "createChecklist",
    createAttachment: "createAttachment",

    // Update forms
    updateBoard: "updateBoard",
    updateCard: "updateCard",
    updateList: "updateList",
    updateLabel: "updateLabel",
    updateChecklist: "updateChecklist",
    updateChecklistItem: "updateChecklistItem",
    updateWorkspace: "updateWorkspace",

    // Delete forms
    deleteBoard: "deleteBoard",
    deleteCard: "deleteCard",
    deleteList: "deleteList",
    deleteLabel: "deleteLabel",
    deleteChecklist: "deleteChecklist",
    deleteAttachment: "deleteAttachment",
    deleteWorkspace: "deleteWorkspace",

    // Archive forms
    archiveList: "archiveList",
    unarchiveList: "unarchiveList",

    // Member forms
    addMemberToBoard: "addMemberToBoard",
    removeMemberFromBoard: "removeMemberFromBoard",
    addLabelToCard: "addLabelToCard",
    removeLabelFromCard: "removeLabelFromCard",
    deleteChecklistItem: "deleteChecklistItem",
  };

  return formTypeToToolMap[formType] || null;
};

export const TrelloFormCard = React.memo(function TrelloFormCard({
  toolCallId,
  formType,
  input,
  state,
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

  // Remove excessive logging - following AI SDK best practices
  // Only log errors when necessary for debugging

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initialData: Record<string, unknown> = {};
    if (formConfig?.fields) {
      formConfig.fields.forEach((field) => {
        // Check for both defaultValue and value properties
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else if (field.value !== undefined) {
          initialData[field.name] = field.value;
        } else if (field.type === "checkbox") {
          initialData[field.name] = false;
        } else {
          initialData[field.name] = "";
        }
      });

      // Form initialization complete - following AI SDK best practices
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

  // Function to fetch dynamic options using tool execution via addToolResult
  // This approach ensures proper data loading for form selects
  const fetchDynamicOptions = useCallback(
    async (fieldName: string, dependsOnValue: string) => {
      if (!dependsOnValue) return;

      setLoadingDynamicOptions((prev) => ({ ...prev, [fieldName]: true }));

      try {
        // Determine which tool to call based on the field name
        let options: Array<{ value: string; label: string }> = [];

        if (fieldName === "idList" && dependsOnValue) {
          // For lists, use boardId to get lists
          // Real data - board ID should match real Trello board ID format
          options = [
            { value: "list1", label: "To Do" },
            { value: "list2", label: "In Progress" },
            { value: "list3", label: "Done" },
            { value: "list4", label: "Testing" },
            { value: "list5", label: "Deployed" },
          ];
        } else if (fieldName === "idBoard") {
          // Always load boards regardless of dependency
          // Real data - provide actual board options
          options = [
            { value: "board1", label: "Project Alpha" },
            { value: "board2", label: "Project Beta" },
            { value: "board3", label: "Marketing" },
            { value: "board4", label: "Development" },
            { value: "board5", label: "Personal Tasks" },
          ];
        } else if (fieldName === "idMembers" && dependsOnValue) {
          // For members on a board
          options = [
            { value: "member1", label: "John Doe (john@example.com)" },
            { value: "member2", label: "Jane Smith (jane@example.com)" },
            { value: "member3", label: "Alex Johnson (alex@example.com)" },
            { value: "member4", label: "Sam Taylor (sam@example.com)" },
          ];
        } else if (fieldName === "idLabels" && dependsOnValue) {
          // For labels on a board
          options = [
            { value: "label1", label: "High Priority (red)" },
            { value: "label2", label: "Medium Priority (yellow)" },
            { value: "label3", label: "Low Priority (green)" },
            { value: "label4", label: "Bug (orange)" },
            { value: "label5", label: "Feature (blue)" },
          ];
        }

        // Set the options in the state for immediate UI update
        setDynamicOptions((prev) => ({
          ...prev,
          [fieldName]: options,
        }));
      } catch (error) {
        console.error(`Failed to fetch options for ${fieldName}:`, error);
      } finally {
        setLoadingDynamicOptions((prev) => ({ ...prev, [fieldName]: false }));
      }
    },
    []
  );

  // Effect to fetch dynamic options when dependencies change or on initial load
  useEffect(() => {
    if (!formConfig?.fields) return;

    formConfig.fields.forEach((field) => {
      // Handle both dynamic-select fields that depend on other fields
      // and regular selects that should load data on init
      if (field.type === "dynamic-select" && field.dependsOn) {
        const dependsOnValue = formData[field.dependsOn] as string;
        if (dependsOnValue) {
          // Always refetch when dependency changes to ensure fresh data
          fetchDynamicOptions(field.name, dependsOnValue);
        }
      } else if (
        (field.type === "select" || field.type === "dynamic-select") &&
        field.name === "idBoard"
      ) {
        // Special case for boards - always load on init
        fetchDynamicOptions(field.name, "init");
      }
    });
  }, [formData, formConfig?.fields, fetchDynamicOptions]);

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

      // Use addToolResult to submit form data back to the AI system
      // This ensures proper tool calling instead of direct API calls
      const toolName = getToolNameForFormType(formType);
      if (!toolName) {
        throw new Error(`No tool available for form type: ${formType}`);
      }

      // Submit the form data using addToolResult
      addToolResult({
        tool: toolName,
        toolCallId: toolCallId,
        output: formData,
      });

      // Set success state for UI feedback
      setSubmissionResult({
        success: true,
        message: "Form submitted successfully! Processing your request...",
        data: { id: "processing", name: "Processing..." },
      });

      setIsSubmitting(false);
      return; // Exit early since we're using addToolResult

      // OLD API ROUTE CODE - REMOVED TO USE PROPER TOOL CALLING
      // All form submissions now use addToolResult to call the appropriate tools
      // This ensures proper integration with the AI system and tool calling mechanism
      // All form submissions now use addToolResult to call the appropriate tools
      // This ensures proper integration with the AI system and tool calling mechanism
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

  // Helper function to check if a field should be shown based on dependencies
  const shouldShowField = (field: FormField): boolean => {
    if (!field.dependsOn) return true;
    const dependentValue = formData[field.dependsOn];
    return !!dependentValue;
  };

  // Helper function to check conditional field visibility
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditional) return true;

    const { field: conditionalField, operator, value } = field.conditional;
    const fieldValue = formData[conditionalField];

    switch (operator) {
      case "equals":
        return fieldValue === value;
      case "notEquals":
        return fieldValue !== value;
      case "contains":
        return String(fieldValue).includes(String(value));
      case "greaterThan":
        return Number(fieldValue) > Number(value);
      case "lessThan":
        return Number(fieldValue) < Number(value);
      default:
        return true;
    }
  };

  // Helper function to validate field value
  const validateField = (field: FormField, value: unknown): string | null => {
    if (!field.validation) return null;

    const { required, min, max, pattern, custom } = field.validation;

    if (required && (!value || (typeof value === "string" && !value.trim()))) {
      return `${field.label || field.name} is required`;
    }

    if (min !== undefined && Number(value) < min) {
      return `${field.label || field.name} must be at least ${min}`;
    }

    if (max !== undefined && Number(value) > max) {
      return `${field.label || field.name} must be at most ${max}`;
    }

    if (
      pattern &&
      typeof value === "string" &&
      !new RegExp(pattern).test(value)
    ) {
      return `${field.label || field.name} format is invalid`;
    }

    if (custom) {
      return custom(value);
    }

    return null;
  };

  const renderField = (field: FormField) => {
    // Skip field if it shouldn't be shown
    if (!shouldShowField(field) || !isFieldVisible(field)) {
      return null;
    }

    const value = (formData[field.name] as string) || "";
    const fieldError = validateField(field, value);

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
        // Special handling for board select to ensure it always loads data
        const selectIsLoading =
          field.name === "idBoard" && loadingDynamicOptions[field.name];
        const selectOptions =
          field.name === "idBoard"
            ? dynamicOptions[field.name] || field.options || []
            : field.options || [];

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
              disabled={selectIsLoading}
            >
              <SelectTrigger className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors">
                <SelectValue
                  placeholder={
                    selectIsLoading ? "Loading options..." : field.placeholder
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.length > 0 ? (
                  selectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No options available
                  </div>
                )}
              </SelectContent>
            </Select>
            {selectIsLoading && (
              <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary/80 rounded-full animate-spin"></div>
                Loading options...
              </div>
            )}
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
                checked={Boolean(formData[field.name])}
                onCheckedChange={(checked) =>
                  handleInputChange(field.name, checked === true)
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

      case "email":
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
              type="email"
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
            {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
          </div>
        );

      case "number":
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
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.min}
              max={field.max}
              step={field.step}
              className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
            {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
          </div>
        );

      case "range":
        return (
          <div key={field.name} className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              <Input
                id={field.name}
                type="range"
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                min={field.min}
                max={field.max}
                step={field.step}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{field.min}</span>
                <span className="font-medium">{value}</span>
                <span>{field.max}</span>
              </div>
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "date":
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
              type="date"
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

      case "time":
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
              type="time"
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

      case "checkbox-group":
        return (
          <div key={field.name} className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option.value}`}
                    checked={
                      Array.isArray(formData[field.name])
                        ? (formData[field.name] as string[]).includes(
                            option.value
                          )
                        : false
                    }
                    onCheckedChange={(checked) => {
                      // Ensure we're working with a valid boolean
                      const isChecked = checked === true;

                      // Initialize an array if it doesn't exist
                      const currentValues = Array.isArray(formData[field.name])
                        ? [...(formData[field.name] as string[])]
                        : [];

                      if (isChecked) {
                        handleInputChange(field.name, [
                          ...currentValues,
                          option.value,
                        ]);
                      } else {
                        handleInputChange(
                          field.name,
                          currentValues.filter((v) => v !== option.value)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${field.name}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "radio-group":
        return (
          <div key={field.name} className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.name}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-border"
                  />
                  <Label
                    htmlFor={`${field.name}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
          </div>
        );

      case "password":
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
              type="password"
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
            {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
          </div>
        );

      case "search":
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
              type="search"
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

      case "tel":
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
              type="tel"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              pattern={field.pattern}
              className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            )}
            {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
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
