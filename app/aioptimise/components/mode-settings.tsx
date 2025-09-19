'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Target,
  Code,
  Search,
  Palette,
  Brain,
  Volume2,
  Eye,
  EyeOff,
  Zap,
  DollarSign,
  Shield,
  Bell,
  Users,
  Globe,
  Lock,
  Sparkles,
  Monitor,
  Moon,
  Sun,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeSettingsProps {
  currentMode: 'standard' | 'focus' | 'coding' | 'research' | 'creative' | 'custom';
  onModeChange: (mode: string) => void;
  settings: {
    showMetrics: boolean;
    showAnalysis: boolean;
    autoSave: boolean;
    autoRetry: boolean;
    voiceEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    preferredProvider?: string;
    preferredModel?: string;
  };
  onSettingsChange: (settings: any) => void;
}

const modes = [
  {
    id: 'standard',
    name: 'Standard',
    icon: Brain,
    description: 'Balanced mode with all features enabled',
    color: 'text-blue-500',
    features: {
      showMetrics: true,
      showAnalysis: true,
      autoSave: true,
      autoRetry: true,
    }
  },
  {
    id: 'focus',
    name: 'Focus',
    icon: Target,
    description: 'Distraction-free mode for deep work',
    color: 'text-purple-500',
    features: {
      showMetrics: false,
      showAnalysis: false,
      autoSave: true,
      autoRetry: true,
    }
  },
  {
    id: 'coding',
    name: 'Coding',
    icon: Code,
    description: 'Optimized for code generation and debugging',
    color: 'text-green-500',
    features: {
      showMetrics: true,
      showAnalysis: true,
      autoSave: true,
      autoRetry: true,
      preferredModel: 'claude-3.5-sonnet',
    }
  },
  {
    id: 'research',
    name: 'Research',
    icon: Search,
    description: 'Enhanced for research with citations and sources',
    color: 'text-orange-500',
    features: {
      showMetrics: true,
      showAnalysis: true,
      autoSave: true,
      autoRetry: true,
      preferredModel: 'perplexity-sonar-pro',
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: Palette,
    description: 'Unleash creativity with enhanced generation',
    color: 'text-pink-500',
    features: {
      showMetrics: false,
      showAnalysis: true,
      autoSave: true,
      autoRetry: false,
      preferredModel: 'claude-3.5-sonnet',
    }
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: Settings,
    description: 'Create your own personalized mode',
    color: 'text-gray-500',
    features: {}
  },
];

export function ModeSettings({
  currentMode,
  onModeChange,
  settings,
  onSettingsChange,
}: ModeSettingsProps) {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(currentMode);
  const [customSettings, setCustomSettings] = useState(settings);
  const [adminOverrides, setAdminOverrides] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangeRequest, setShowChangeRequest] = useState(false);

  // Fetch admin overrides when dialog opens
  useEffect(() => {
    if (open) {
      fetchAdminOverrides();
    }
  }, [open]);

  const fetchAdminOverrides = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/project-settings');
      const data = await response.json();

      if (data.hasOverrides) {
        setAdminOverrides(data.organizationSettings);
      }
    } catch (error) {
      console.error('Error fetching admin overrides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRequest = async (requestMessage: string) => {
    try {
      const response = await fetch('/api/admin/change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestMessage,
          currentSettings: customSettings,
          requestedChanges: getRequestedChanges()
        })
      });

      if (response.ok) {
        setShowChangeRequest(false);
        // Show success message or notification
      }
    } catch (error) {
      console.error('Error submitting change request:', error);
    }
  };

  const getRequestedChanges = () => {
    // Compare current settings with admin overrides to determine what user wants to change
    if (!adminOverrides?.adminOverrides) return {};

    const overriddenSettings = adminOverrides.adminOverrides;
    const changes = {};

    Object.keys(customSettings).forEach(key => {
      if (overriddenSettings[key] !== undefined && customSettings[key] !== overriddenSettings[key]) {
        changes[key] = customSettings[key];
      }
    });

    return changes;
  };

  const isSettingLocked = (settingKey: string) => {
    return adminOverrides?.adminOverrides && adminOverrides.adminOverrides[settingKey] !== undefined;
  };

  const getLockedValue = (settingKey: string) => {
    return adminOverrides?.adminOverrides?.[settingKey];
  };

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId as any);
    const mode = modes.find(m => m.id === modeId);
    if (mode && mode.features) {
      setCustomSettings({ ...customSettings, ...mode.features });
    }
  };

  const handleSave = () => {
    onModeChange(selectedMode);
    onSettingsChange(customSettings);
    setOpen(false);
  };

  const currentModeData = modes.find(m => m.id === currentMode);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-gradient-to-r from-violet-900/50 to-purple-900/50 border-violet-500/30 hover:border-violet-400/50 hover:from-violet-800/50 hover:to-purple-800/50 text-white transition-all"
        >
          {currentModeData && (
            <>
              <currentModeData.icon className="h-4 w-4 text-violet-300" />
              <span className="text-violet-100">{currentModeData.name} Mode</span>
            </>
          )}
          <Settings className="h-3 w-3 ml-1 text-violet-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border-violet-500/30">
        <DialogHeader>
          <DialogTitle className="text-white">Chat Settings & Modes</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a chat mode or customize your experience
          </DialogDescription>
        </DialogHeader>


        <Tabs defaultValue="modes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1">
            <TabsTrigger value="modes">Modes</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="modes" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Card
                    key={mode.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-2",
                      "hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10",
                      selectedMode === mode.id 
                        ? "border-violet-500 bg-gradient-to-br from-violet-500/20 to-purple-500/20" 
                        : "border-gray-700 bg-gray-800/50"
                    )}
                    onClick={() => handleModeSelect(mode.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        selectedMode === mode.id 
                          ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20" 
                          : "bg-gray-700/50"
                      )}>
                        <Icon className={cn("h-5 w-5", mode.color)} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-white">{mode.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {mode.description}
                        </p>
                      </div>
                      {selectedMode === mode.id && (
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 mt-2 animate-pulse" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {selectedMode === 'custom' && (
              <Card className="p-4 space-y-4 bg-gray-800/50 border-gray-700">
                <h4 className="text-sm font-medium text-white">Custom Mode Settings</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="show-metrics" className="text-sm text-gray-300">
                        Show Metrics Panel
                      </Label>
                      {isSettingLocked('showMetrics') && (
                        <div className="flex items-center gap-1 text-xs text-orange-400">
                          <Lock className="h-3 w-3" />
                          <span>Admin Override</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="show-metrics"
                        checked={isSettingLocked('showMetrics') ? getLockedValue('showMetrics') : customSettings.showMetrics}
                        disabled={isSettingLocked('showMetrics')}
                        onCheckedChange={(checked) =>
                          setCustomSettings({ ...customSettings, showMetrics: checked })
                        }
                      />
                      {isSettingLocked('showMetrics') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowChangeRequest(true)}
                          className="h-6 px-2 text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Request Change
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-analysis" className="text-sm text-gray-300">
                      Show Prompt Analysis
                    </Label>
                    <Switch
                      id="show-analysis"
                      checked={customSettings.showAnalysis}
                      onCheckedChange={(checked) => 
                        setCustomSettings({ ...customSettings, showAnalysis: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save" className="text-sm text-gray-300">
                      Auto-save Threads
                    </Label>
                    <Switch
                      id="auto-save"
                      checked={customSettings.autoSave}
                      onCheckedChange={(checked) => 
                        setCustomSettings({ ...customSettings, autoSave: checked })
                      }
                    />
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card className="p-4 space-y-4 bg-gray-800/50 border-gray-700">
              <h4 className="text-sm font-medium flex items-center gap-2 text-white">
                <Eye className="h-4 w-4" />
                Display Preferences
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-sm text-gray-300">Theme</Label>
                  <RadioGroup
                    value={customSettings.theme}
                    onValueChange={(value) => 
                      setCustomSettings({ ...customSettings, theme: value as any })
                    }
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <RadioGroupItem value="light" id="light" className="border-gray-600 text-violet-500" />
                      <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <RadioGroupItem value="dark" id="dark" className="border-gray-600 text-violet-500" />
                      <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <Moon className="h-4 w-4 text-blue-400" />
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <RadioGroupItem value="system" id="system" className="border-gray-600 text-violet-500" />
                      <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                  <Label htmlFor="voice-enabled" className="text-sm text-gray-200 font-medium">
                    Enable Voice Input
                  </Label>
                  <Switch
                    id="voice-enabled"
                    checked={customSettings.voiceEnabled}
                    onCheckedChange={(checked) => 
                      setCustomSettings({ ...customSettings, voiceEnabled: checked })
                    }
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-4 bg-gray-800/50 border-gray-700">
              <h4 className="text-sm font-medium flex items-center gap-2 text-white">
                <Brain className="h-4 w-4" />
                Model Preferences
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-sm text-gray-300">
                    Preferred Provider
                  </Label>
                  <Select
                    value={customSettings.preferredProvider}
                    onValueChange={(value) =>
                      setCustomSettings({ ...customSettings, preferredProvider: value })
                    }
                  >
                    <SelectTrigger id="provider" className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50">
                      <SelectValue placeholder="Auto-select" className="text-gray-300" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="auto" className="text-gray-300 hover:bg-gray-700/50">Auto-select</SelectItem>
                      <SelectItem value="openai" className="text-gray-300 hover:bg-gray-700/50">OpenAI</SelectItem>
                      <SelectItem value="claude" className="text-gray-300 hover:bg-gray-700/50">Anthropic</SelectItem>
                      <SelectItem value="gemini" className="text-gray-300 hover:bg-gray-700/50">Google</SelectItem>
                      <SelectItem value="perplexity" className="text-gray-300 hover:bg-gray-700/50">Perplexity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="optimization" className="text-sm text-gray-300">
                    Optimization Priority
                  </Label>
                  <RadioGroup defaultValue="balanced" className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <RadioGroupItem value="quality" id="quality" className="border-gray-600 text-violet-500" />
                      <Label htmlFor="quality" className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        Quality
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <RadioGroupItem value="balanced" id="balanced" className="border-gray-600 text-violet-500" />
                      <Label htmlFor="balanced" className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <Brain className="h-4 w-4 text-blue-400" />
                        Balanced
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <RadioGroupItem value="budget" id="budget" className="border-gray-600 text-violet-500" />
                      <Label htmlFor="budget" className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        Budget
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <RadioGroupItem value="speed" id="speed" className="border-gray-600 text-violet-500" />
                      <Label htmlFor="speed" className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        Speed
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card className="p-4 space-y-4 bg-gray-800/50 border-gray-700">
              <h4 className="text-sm font-medium flex items-center gap-2 text-white">
                <Shield className="h-4 w-4" />
                Privacy & Security
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                  <div className="space-y-0.5">
                    <Label htmlFor="share-data" className="text-sm text-gray-200 font-medium">
                      Share Data for Improvement
                    </Label>
                    <p className="text-xs text-gray-400">
                      Help improve AI responses with anonymous usage data
                    </p>
                  </div>
                  <Switch id="share-data" />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                  <div className="space-y-0.5">
                    <Label htmlFor="telemetry" className="text-sm text-gray-200 font-medium">
                      Allow Telemetry
                    </Label>
                    <p className="text-xs text-gray-400">
                      Send anonymous performance metrics
                    </p>
                  </div>
                  <Switch id="telemetry" defaultChecked />
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-4 bg-gray-800/50 border-gray-700">
              <h4 className="text-sm font-medium flex items-center gap-2 text-white">
                <Users className="h-4 w-4" />
                Collaboration
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-sharing" className="text-sm text-gray-200 font-medium">
                      Allow Thread Sharing
                    </Label>
                    <p className="text-xs text-gray-400">
                      Let others in your organization view shared threads
                    </p>
                  </div>
                  <Switch id="allow-sharing" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications" className="text-sm text-gray-200 font-medium">
                      Collaboration Notifications
                    </Label>
                    <p className="text-xs text-gray-400">
                      Get notified when someone shares a thread with you
                    </p>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-4 bg-gray-800/50 border-gray-700">
              <h4 className="text-sm font-medium flex items-center gap-2 text-white">
                <Zap className="h-4 w-4" />
                Performance
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-3 p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="max-retries" className="text-sm text-gray-200 font-medium">
                      Max Retries on Error
                    </Label>
                    <span className="text-sm font-bold text-violet-400">
                      {customSettings.autoRetry ? '3' : '0'}
                    </span>
                  </div>
                  <Slider
                    id="max-retries"
                    min={0}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    disabled={!customSettings.autoRetry}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                  <Label htmlFor="auto-retry" className="text-sm text-gray-200 font-medium">
                    Auto-retry on Error
                  </Label>
                  <Switch
                    id="auto-retry"
                    checked={customSettings.autoRetry}
                    onCheckedChange={(checked) => 
                      setCustomSettings({ ...customSettings, autoRetry: checked })
                    }
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Admin Override Banner */}
        {adminOverrides?.adminOverrides && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-300">Settings Locked by Administrator</h4>
                <p className="text-xs text-orange-200/80 mt-1">
                  Some settings have been overridden by your organization administrator.
                  {adminOverrides.overrideReason && (
                    <span className="block mt-1">
                      <strong>Reason:</strong> {adminOverrides.overrideReason}
                    </span>
                  )}
                </p>
                <p className="text-xs text-orange-200/60 mt-2">
                  Overridden by {adminOverrides.overriddenByUser?.name} on{' '}
                  {new Date(adminOverrides.overriddenAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Change Request Modal */}
        {showChangeRequest && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">Request Settings Change</h3>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  Submit a request to your administrator to modify the locked settings.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="change-message" className="text-sm text-gray-300">
                      Message to Administrator
                    </Label>
                    <textarea
                      id="change-message"
                      placeholder="Please explain why you need these settings changed..."
                      className="w-full mt-2 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
                      rows={4}
                      onChange={(e) => {
                        // Store message in state if needed
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowChangeRequest(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const message = (document.getElementById('change-message') as HTMLTextAreaElement)?.value;
                      if (message) {
                        handleChangeRequest(message);
                      }
                    }}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}