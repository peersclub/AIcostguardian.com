'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { CardSkeleton } from '@/components/shared/LoadingStates';
import { ErrorDisplay } from '@/components/shared/ErrorStates';
import { toast } from 'sonner';
import {
  Settings,
  Save,
  RotateCcw,
  Users,
  Brain,
  Folder,
  Zap,
  Shield,
  Hash,
  Info,
  MessageSquare,
  Code,
  Search,
  PenTool,
  BarChart3,
  Lightbulb,
  Headphones,
  GraduationCap,
  Cog,
  FileText,
  Building,
  HelpCircle
} from 'lucide-react';
import { getAIProviderLogo } from '@/components/ui/ai-logos';

interface ThreadContext {
  id: string;
  projectName?: string;
  projectType: string;
  systemPrompt?: string;
  instructions?: string;
  defaultModel?: string;
  defaultProvider?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  contextWindow?: number;
  memoryEnabled: boolean;
  memorySize?: number;
  allowEditing: boolean;
  requireApproval: boolean;
  category?: string;
  keywords: string[];
  projectGoals?: string;
  expectedOutcome?: string;
  version: number;
  lastEditedAt?: string;
  lastEditor?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface DefaultTemplate {
  projectName: string;
  systemPrompt: string;
  instructions: string;
  defaultModel: string;
  defaultProvider: string;
  temperature: number;
  maxTokens: number;
  contextWindow: number;
  projectGoals: string;
  expectedOutcome: string;
  keywords: string[];
}

interface ProjectMetadata {
  projectTypes: Array<{ value: string; label: string; description: string }>;
  defaultModels: Array<{ value: string; label: string; provider: string; description: string }>;
  providers: Array<{ value: string; label: string; description: string }>;
  categories: Array<{ value: string; label: string; icon: string }>;
  temperaturePresets: Array<{ value: number; label: string; description: string }>;
  maxTokensPresets: Array<{ value: number; label: string; description: string }>;
  contextWindowPresets: Array<{ value: number; label: string; description: string }>;
  defaultTemplates?: Record<string, DefaultTemplate>;
}

interface ProjectSettingsProps {
  threadId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (context: ThreadContext) => void;
}

export function ProjectSettings({ threadId, isOpen, onClose, onSave }: ProjectSettingsProps) {
  const [context, setContext] = useState<ThreadContext | null>(null);
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Load context and metadata when component opens
  useEffect(() => {
    if (isOpen && threadId) {
      loadContextAndMetadata();
    }
  }, [isOpen, threadId]);

  const loadContextAndMetadata = async () => {
    try {
      setLoading(true);
      setError(null);

      const [contextResponse, metadataResponse] = await Promise.all([
        fetch(`/api/aioptimise/threads/${threadId}/context`),
        fetch('/api/aioptimise/context/metadata')
      ]);

      // Handle context response - 404 is expected for new threads
      let contextData = null;
      if (contextResponse.ok) {
        contextData = await contextResponse.json();
      } else if (contextResponse.status !== 404) {
        throw new Error('Failed to load context');
      }

      // Handle metadata response - this should always be available
      if (!metadataResponse.ok) {
        throw new Error('Failed to load metadata');
      }
      const metadataData = await metadataResponse.json();

      // Ensure keywords is always an array
      if (contextData) {
        contextData.keywords = Array.isArray(contextData.keywords) ? contextData.keywords : [];
      }
      setContext(contextData);
      setMetadata(metadataData);


      // If no context exists, create a default one for editing
      if (!contextData && metadataData?.defaultTemplates) {
        const defaultTemplate = metadataData.defaultTemplates['GENERAL'];
        setContext({
          id: '',
          projectType: 'GENERAL',
          projectName: defaultTemplate.projectName,
          systemPrompt: defaultTemplate.systemPrompt,
          instructions: defaultTemplate.instructions,
          defaultModel: defaultTemplate.defaultModel,
          defaultProvider: defaultTemplate.defaultProvider,
          temperature: defaultTemplate.temperature,
          maxTokens: defaultTemplate.maxTokens,
          contextWindow: defaultTemplate.contextWindow,
          memoryEnabled: true,
          memorySize: 50,
          allowEditing: true,
          requireApproval: false,
          keywords: defaultTemplate.keywords,
          projectGoals: defaultTemplate.projectGoals,
          expectedOutcome: defaultTemplate.expectedOutcome,
          version: 1
        });
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Error loading context:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!context) return;

    try {
      setSaving(true);

      // Always use PUT since the GET endpoint auto-creates context with an ID
      // The API will handle both creation and update cases properly
      const response = await fetch(`/api/aioptimise/threads/${threadId}/context`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Unknown error');
        const status = response.status;
        const statusText = response.statusText;

        // Provide more specific error handling
        if (status === 404) {
          throw new Error('Thread not found or you do not have permission to edit this project');
        } else if (status === 401) {
          throw new Error('You must be logged in to save project settings');
        } else {
          throw new Error(`Failed to save settings: ${status} ${statusText}${errorData ? ` - ${errorData}` : ''}`);
        }
      }

      const updatedContext = await response.json();
      setContext(updatedContext);
      setHasChanges(false);

      toast.success('Project settings saved successfully');
      onSave?.(updatedContext);

      // Close modal after successful save
      onClose();
    } catch (error) {
      console.error('Error saving context:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (context) {
      loadContextAndMetadata();
      setHasChanges(false);
      toast.info('Settings reset to last saved version');
    }
  };

  const updateContext = (updates: Partial<ThreadContext>) => {
    if (context) {
      setContext({ ...context, ...updates });
      setHasChanges(true);
    }
  };

  // Apply default template when project type changes
  const applyTemplate = (projectType: string) => {
    if (!metadata?.defaultTemplates?.[projectType] || !context) return;

    const template = metadata.defaultTemplates[projectType];
    const isNewContext = !context.projectName || context.projectName === 'New Thread Context';

    // Apply full template for new contexts
    if (isNewContext) {
      setContext({
        ...context,
        projectType,
        projectName: template.projectName,
        systemPrompt: template.systemPrompt,
        instructions: template.instructions,
        defaultModel: template.defaultModel,
        defaultProvider: template.defaultProvider,
        temperature: template.temperature,
        maxTokens: template.maxTokens,
        contextWindow: template.contextWindow,
        projectGoals: template.projectGoals,
        expectedOutcome: template.expectedOutcome,
        keywords: template.keywords
      });
      setHasChanges(true);
    } else {
      // For existing contexts, update all template fields to match the selected project type
      updateContext({
        projectType,
        systemPrompt: template.systemPrompt,
        instructions: template.instructions,
        defaultProvider: template.defaultProvider,
        defaultModel: template.defaultModel,
        temperature: template.temperature,
        projectGoals: template.projectGoals,
        expectedOutcome: template.expectedOutcome,
        keywords: template.keywords
      });
    }
  };

  // Handle provider change with auto model selection
  const handleProviderChange = (newProvider: string) => {
    if (!metadata || !context) return;

    if (newProvider === 'auto') {
      // Set both provider and model to auto
      updateContext({
        defaultProvider: 'auto',
        defaultModel: 'auto'
      });
      return;
    }

    // Get models available for the new provider
    const availableModels = metadata.defaultModels.filter(model => model.provider === newProvider);

    // Auto-select the first available model for this provider
    const defaultModel = availableModels.length > 0 ? availableModels[0].value : context.defaultModel;

    updateContext({
      defaultProvider: newProvider,
      defaultModel: defaultModel
    });
  };

  // Get models filtered by current provider
  const getFilteredModels = () => {
    if (!metadata || !context) return [];
    return metadata.defaultModels.filter(model => model.provider === context.defaultProvider);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
        <div className="border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Settings className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Project Settings</h2>
                <p className="text-gray-400 text-sm">
                  Configure AI behavior, collaboration, and project metadata
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center justify-center"
              >
                <Zap className="h-4 w-4 rotate-45" />
              </button>
            </div>
          </div>
          {hasChanges && (
            <div className="mt-3">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-xs font-medium rounded-full border border-indigo-500/30 flex items-center gap-1 w-fit">
                <Hash className="h-3 w-3" />
                Unsaved changes
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {loading && <div className="m-6"><CardSkeleton /></div>}
          {error && (
            <div className="p-6">
              <ErrorDisplay message={error} onRetry={loadContextAndMetadata} />
            </div>
          )}

          {!loading && !error && (!context || !metadata) && (
            <div className="p-6 text-center text-gray-400">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Loading configuration...</p>
              <p className="text-xs">Context: {context ? '✓' : '✗'}, Metadata: {metadata ? '✓' : '✗'}</p>
            </div>
          )}

          {!loading && !error && context && metadata && (
            <div className="flex flex-col h-full">
              {/* Glass Morphism Tab Navigation */}
              <div className="grid w-full grid-cols-4 m-6 mb-0 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-1">
                <button
                  onClick={() => setActiveTab("basic")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "basic"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "ai"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  AI Config
                </button>
                <button
                  onClick={() => setActiveTab("collaboration")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "collaboration"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Collaboration
                </button>
                <button
                  onClick={() => setActiveTab("advanced")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "advanced"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  Advanced
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-4">
                {activeTab === "basic" && (
                  <div className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white" htmlFor="projectName">Project Name</Label>
                          <Input
                            id="projectName"
                            value={context.projectName || ''}
                            onChange={(e) => updateContext({ projectName: e.target.value })}
                            placeholder="Enter project name..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white" htmlFor="projectType">Project Type</Label>
                          <Select
                            value={context.projectType}
                            onValueChange={applyTemplate}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {metadata.projectTypes.map((type) => {
                                const getProjectTypeIcon = (typeValue: string) => {
                                  const iconMap = {
                                    'GENERAL': MessageSquare,
                                    'DEVELOPMENT': Code,
                                    'RESEARCH': Search,
                                    'CONTENT_CREATION': PenTool,
                                    'ANALYSIS': BarChart3,
                                    'BRAINSTORMING': Lightbulb,
                                    'SUPPORT': Headphones,
                                    'TRAINING': GraduationCap,
                                    'CUSTOM': Cog
                                  } as const;
                                  const IconComponent = iconMap[typeValue as keyof typeof iconMap] || FileText;
                                  return <IconComponent className="h-4 w-4 text-gray-400" />;
                                };
                                return (
                                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                    <div className="flex items-center gap-3">
                                      {getProjectTypeIcon(type.value)}
                                      <div>
                                        <div className="font-medium">{type.label}</div>
                                        <div className="text-xs text-gray-400">{type.description}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white" htmlFor="category">Category</Label>
                          <Select
                            value={context.category || ''}
                            onValueChange={(value) => updateContext({ category: value })}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20">
                              <SelectValue placeholder="Select category..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {metadata.categories.map((category) => {
                                const getCategoryIcon = (iconName: string) => {
                                  const iconMap = {
                                    '💻': Code,
                                    '🔬': Search,
                                    '✍️': PenTool,
                                    '📊': BarChart3,
                                    '🎧': Headphones,
                                    '💡': Lightbulb,
                                    '🎓': GraduationCap,
                                    '💬': MessageSquare,
                                    '🏢': Building,
                                    '⚙️': Cog
                                  } as const;
                                  const IconComponent = iconMap[iconName as keyof typeof iconMap] || FileText;
                                  return <IconComponent className="h-4 w-4 text-gray-400" />;
                                };
                                return (
                                  <SelectItem key={category.value} value={category.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                      {getCategoryIcon(category.icon)}
                                      <span>{category.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-white" htmlFor="keywords">Keywords</Label>
                          <div className="space-y-2">
                            <KeywordsInput
                              value={context.keywords}
                              onChange={(keywords) => updateContext({ keywords })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white" htmlFor="projectGoals">Project Goals</Label>
                        <Textarea
                          id="projectGoals"
                          value={context.projectGoals || ''}
                          onChange={(e) => updateContext({ projectGoals: e.target.value })}
                          placeholder="Describe the goals and objectives for this project..."
                          rows={3}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white" htmlFor="expectedOutcome">Expected Outcome</Label>
                        <Textarea
                          id="expectedOutcome"
                          value={context.expectedOutcome || ''}
                          onChange={(e) => updateContext({ expectedOutcome: e.target.value })}
                          placeholder="What do you expect to achieve with this project..."
                          rows={3}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="space-y-6 mt-0">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-white" htmlFor="systemPrompt">System Prompt</Label>
                        <Textarea
                          id="systemPrompt"
                          value={context.systemPrompt || ''}
                          onChange={(e) => updateContext({ systemPrompt: e.target.value })}
                          placeholder="Define the AI's personality and behavior..."
                          rows={4}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 font-mono text-sm resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white" htmlFor="instructions">Instructions</Label>
                        <Textarea
                          id="instructions"
                          value={context.instructions || ''}
                          onChange={(e) => updateContext({ instructions: e.target.value })}
                          placeholder="Specific instructions for this project..."
                          rows={4}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
                        />
                      </div>

                      <Separator className="bg-gray-700" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white" htmlFor="defaultProvider">Provider</Label>
                          <Select
                            value={context.defaultProvider || ''}
                            onValueChange={handleProviderChange}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20">
                              <div className="flex items-center gap-2">
                                {context.defaultProvider === 'auto' ? (
                                  <Zap className="w-4 h-4 text-indigo-400" />
                                ) : (
                                  getAIProviderLogo(context.defaultProvider || '', 'w-4 h-4')
                                )}
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {/* Auto-Optimize Option */}
                              <SelectItem key="auto" value="auto" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                <div className="flex items-center gap-3 w-full">
                                  <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-indigo-400">Auto</div>
                                    <div className="text-xs text-gray-400">Intelligent provider selection</div>
                                  </div>
                                </div>
                              </SelectItem>

                              {/* Separator */}
                              <div className="h-px bg-gray-700 my-1" />

                              {metadata.providers.map((provider) => (
                                <SelectItem key={provider.value} value={provider.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                  <div className="flex items-center gap-3">
                                    {getAIProviderLogo(provider.value, 'w-4 h-4')}
                                    <div>
                                      <div className="font-medium">{provider.label}</div>
                                      <div className="text-xs text-gray-400">{provider.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white" htmlFor="defaultModel">Default Model</Label>
                          <Select
                            value={context.defaultModel || ''}
                            onValueChange={(value) => updateContext({ defaultModel: value })}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20">
                              <div className="flex items-center gap-2">
                                {context.defaultModel === 'auto' ? (
                                  <Zap className="w-4 h-4 text-indigo-400" />
                                ) : (
                                  getAIProviderLogo(context.defaultProvider || '', 'w-4 h-4')
                                )}
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {/* Auto-Optimize Option */}
                              <SelectItem key="auto" value="auto" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                <div className="flex items-center gap-3 w-full">
                                  <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-indigo-400">Auto</div>
                                    <div className="text-xs text-gray-400">Optimal model selection</div>
                                  </div>
                                </div>
                              </SelectItem>

                              {/* Separator */}
                              {(getFilteredModels().length > 0 || context.defaultProvider === 'auto') && (
                                <div className="h-px bg-gray-700 my-1" />
                              )}

                              {getFilteredModels().map((model) => (
                                <SelectItem key={model.value} value={model.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                  <div className="flex items-center gap-3">
                                    {getAIProviderLogo(model.provider, 'w-4 h-4')}
                                    <div>
                                      <div className="font-medium">{model.label}</div>
                                      <div className="text-xs text-gray-400">{model.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                              {getFilteredModels().length === 0 && context.defaultProvider !== 'auto' && (
                                <SelectItem value="" disabled className="text-gray-500">
                                  No models available for selected provider
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white">Temperature: <span className="text-indigo-400">{context.temperature}</span></Label>
                          <Slider
                            value={[context.temperature || 0.7]}
                            onValueChange={([value]) => updateContext({ temperature: value })}
                            max={2}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Focused</span>
                            <span>Balanced</span>
                            <span>Creative</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-white" htmlFor="maxTokens">Max Tokens</Label>
                              <div className="group relative">
                                <Info className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                  Maximum number of tokens the AI can generate in a single response
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            </div>
                            <Select
                              value={context.maxTokens?.toString() || ''}
                              onValueChange={(value) => updateContext({ maxTokens: parseInt(value) })}
                            >
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                {metadata.maxTokensPresets.map((preset) => (
                                  <SelectItem key={preset.value} value={preset.value.toString()} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                    <div>
                                      <div className="font-medium">{preset.label}</div>
                                      <div className="text-xs text-gray-400">{preset.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-white" htmlFor="contextWindow">Context Window</Label>
                              <div className="group relative">
                                <Info className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                  Amount of conversation history the AI can remember and reference
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            </div>
                            <Select
                              value={context.contextWindow?.toString() || ''}
                              onValueChange={(value) => updateContext({ contextWindow: parseInt(value) })}
                            >
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                {metadata.contextWindowPresets.map((preset) => (
                                  <SelectItem key={preset.value} value={preset.value.toString()} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                    <div>
                                      <div className="font-medium">{preset.label}</div>
                                      <div className="text-xs text-gray-400">{preset.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "collaboration" && (
                  <div className="space-y-6 mt-0">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Allow Editing</Label>
                          <p className="text-sm text-gray-400">
                            Allow collaborators with editor role to modify this project
                          </p>
                        </div>
                        <Switch
                          checked={context.allowEditing}
                          onCheckedChange={(checked) => updateContext({ allowEditing: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Require Approval</Label>
                          <p className="text-sm text-gray-400">
                            Require admin approval for context changes
                          </p>
                        </div>
                        <Switch
                          checked={context.requireApproval}
                          onCheckedChange={(checked) => updateContext({ requireApproval: checked })}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Memory Enabled</Label>
                          <p className="text-sm text-gray-400">
                            Enable conversation memory across sessions
                          </p>
                        </div>
                        <Switch
                          checked={context.memoryEnabled}
                          onCheckedChange={(checked) => updateContext({ memoryEnabled: checked })}
                        />
                      </div>

                      {context.memoryEnabled && (
                        <div className="space-y-2">
                          <Label className="text-white">Memory Size: <span className="text-indigo-400">{context.memorySize}</span> messages</Label>
                          <Slider
                            value={[context.memorySize || 50]}
                            onValueChange={([value]) => updateContext({ memorySize: value })}
                            max={200}
                            min={10}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>10 messages</span>
                            <span>200 messages</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "advanced" && (
                  <div className="space-y-6 mt-0">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-white">Top P: <span className="text-indigo-400">{context.topP}</span></Label>
                        <Slider
                          value={[context.topP || 1.0]}
                          onValueChange={([value]) => updateContext({ topP: value })}
                          max={1}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Focused</span>
                          <span>Diverse</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-500/20 rounded-md">
                            <Shield className="h-4 w-4 text-indigo-400" />
                          </div>
                          <h4 className="font-medium text-white">Version Info</h4>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Version: <span className="text-indigo-400 font-mono">{context.version}</span></p>
                          {context.lastEditedAt && (
                            <p>Last edited: <span className="text-gray-300">{new Date(context.lastEditedAt).toLocaleString()}</span></p>
                          )}
                          {context.lastEditor && (
                            <p>Last editor: <span className="text-gray-300">{context.lastEditor.name}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Keywords Input Component - handles proper space/comma input
interface KeywordsInputProps {
  value: string[] | string;
  onChange: (keywords: string[]) => void;
}

function KeywordsInput({ value, onChange }: KeywordsInputProps) {
  const [inputValue, setInputValue] = useState('');

  // Initialize input value from props
  useEffect(() => {
    const keywordsArray = Array.isArray(value) ? value : [value].filter(Boolean);
    setInputValue(keywordsArray.join(', '));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    // Process keywords when user finishes typing
    const processedKeywords = inputValue
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
    onChange(processedKeywords);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow Enter to also trigger processing
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <Input
      id="keywords"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="Enter keywords separated by commas..."
      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
    />
  );
}