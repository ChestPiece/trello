"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";

// Interface for the API keys
interface ApiKeys {
  openAiKey: string;
  trelloApiKey: string;
  trelloToken: string;
}

// Interface for transport options
interface TransportOptions {
  customEndpoint: string;
  includeCredentials: boolean;
  useCustomHeaders: boolean;
  customHeaders: string;
}

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  // State for API keys (these would be stored securely in a real app)
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openAiKey: "",
    trelloApiKey: "",
    trelloToken: "",
  });

  // State for transport options
  const [transportOptions, setTransportOptions] = useState<TransportOptions>({
    customEndpoint: "/api/chat",
    includeCredentials: true,
    useCustomHeaders: false,
    customHeaders: '{\n  "X-Custom-Header": "value"\n}',
  });

  // Model options
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");

  // UI options
  const [uiOptions, setUiOptions] = useState({
    showReasoningSteps: false,
    useStreamSmoothing: true,
    enableToolCallCancel: true,
  });

  // Load settings from local storage if available
  useEffect(() => {
    const savedTransportOptions = localStorage.getItem("transportOptions");
    if (savedTransportOptions) {
      try {
        setTransportOptions(JSON.parse(savedTransportOptions));
      } catch (e) {
        console.error("Failed to parse saved transport options:", e);
      }
    }

    const savedUiOptions = localStorage.getItem("uiOptions");
    if (savedUiOptions) {
      try {
        setUiOptions(JSON.parse(savedUiOptions));
      } catch (e) {
        console.error("Failed to parse saved UI options:", e);
      }
    }

    const savedModel = localStorage.getItem("selectedModel");
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("transportOptions", JSON.stringify(transportOptions));
    localStorage.setItem("uiOptions", JSON.stringify(uiOptions));
    localStorage.setItem("selectedModel", selectedModel);
  }, [transportOptions, uiOptions, selectedModel]);

  // Handle API key input
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys((prev) => ({ ...prev, [name]: value }));
  };

  // Handle transport options changes
  const handleTransportOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTransportOptions((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setUiOptions((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle transport checkbox changes
  const handleTransportCheckboxChange = (name: string, checked: boolean) => {
    setTransportOptions((prev) => ({ ...prev, [name]: checked }));
  };

  // Save API keys (would use secure storage in a real app)
  const saveApiKeys = () => {
    // In a real application, you'd use a secure method to store API keys
    // For demo purposes, we're just logging them
    console.log("API Keys saved:", apiKeys);

    // Show a success message
    alert(
      "API Keys saved successfully! (In a real app, these would be securely stored)"
    );
  };

  // Apply transport settings
  const applyTransportSettings = () => {
    try {
      // Validate JSON format for custom headers
      if (transportOptions.useCustomHeaders) {
        JSON.parse(transportOptions.customHeaders);
      }

      // In a real application, you would update the transport configuration here
      console.log("Transport settings applied:", transportOptions);

      // Show a success message
      alert("Transport settings applied successfully!");
    } catch (error) {
      alert("Invalid JSON format for custom headers!");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openAiKey">OpenAI API Key</Label>
                <Input
                  type="password"
                  id="openAiKey"
                  name="openAiKey"
                  value={apiKeys.openAiKey}
                  onChange={handleApiKeyChange}
                  placeholder="sk-..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trelloApiKey">Trello API Key</Label>
                <Input
                  type="password"
                  id="trelloApiKey"
                  name="trelloApiKey"
                  value={apiKeys.trelloApiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your Trello API key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trelloToken">Trello Token</Label>
                <Input
                  type="password"
                  id="trelloToken"
                  name="trelloToken"
                  value={apiKeys.trelloToken}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your Trello token"
                />
              </div>

              <Button onClick={saveApiKeys} className="w-full mt-2">
                Save API Keys
              </Button>
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Selected Model</Label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* UI Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">UI Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showReasoningSteps"
                  checked={uiOptions.showReasoningSteps}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      "showReasoningSteps",
                      checked as boolean
                    )
                  }
                />
                <Label
                  htmlFor="showReasoningSteps"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show reasoning steps
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useStreamSmoothing"
                  checked={uiOptions.useStreamSmoothing}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      "useStreamSmoothing",
                      checked as boolean
                    )
                  }
                />
                <Label
                  htmlFor="useStreamSmoothing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable stream smoothing
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableToolCallCancel"
                  checked={uiOptions.enableToolCallCancel}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      "enableToolCallCancel",
                      checked as boolean
                    )
                  }
                />
                <Label
                  htmlFor="enableToolCallCancel"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable tool call cancellation
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Transport Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transport Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customEndpoint">Custom Endpoint</Label>
                <Input
                  type="text"
                  id="customEndpoint"
                  name="customEndpoint"
                  value={transportOptions.customEndpoint}
                  onChange={handleTransportOptionChange}
                  placeholder="/api/chat"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCredentials"
                  checked={transportOptions.includeCredentials}
                  onCheckedChange={(checked) =>
                    handleTransportCheckboxChange(
                      "includeCredentials",
                      checked as boolean
                    )
                  }
                />
                <Label
                  htmlFor="includeCredentials"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include credentials
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useCustomHeaders"
                  checked={transportOptions.useCustomHeaders}
                  onCheckedChange={(checked) =>
                    handleTransportCheckboxChange(
                      "useCustomHeaders",
                      checked as boolean
                    )
                  }
                />
                <Label
                  htmlFor="useCustomHeaders"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use custom headers
                </Label>
              </div>

              {transportOptions.useCustomHeaders && (
                <div className="space-y-2">
                  <Label htmlFor="customHeaders">Custom Headers (JSON)</Label>
                  <textarea
                    id="customHeaders"
                    name="customHeaders"
                    value={transportOptions.customHeaders}
                    onChange={(e) =>
                      setTransportOptions((prev) => ({
                        ...prev,
                        customHeaders: e.target.value,
                      }))
                    }
                    className="w-full h-32 p-2 border rounded-md font-mono text-sm"
                    placeholder='{\n  "X-Custom-Header": "value"\n}'
                  />
                </div>
              )}

              <Button onClick={applyTransportSettings} className="w-full mt-2">
                Apply Transport Settings
              </Button>
            </CardContent>
          </Card>

          {/* Version Information */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Trello Chat App v1.0.0</p>
            <p>AI SDK v5.0.57</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
