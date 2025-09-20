'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Link,
  Copy,
  Users,
  UserPlus,
  Shield,
  Clock,
  Mail,
  Check,
  X,
  Loader2,
  Globe,
  Lock,
  Eye,
  Edit3,
  Crown,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import QRCode from 'qrcode';

interface Collaborator {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
  joinedAt: string;
  lastAccessed?: string;
  isOnline?: boolean;
}

interface OrganizationMember {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
  department?: string;
  jobTitle?: string;
  lastActiveAt?: string;
  isCurrentUser?: boolean;
  isAlreadyCollaborator?: boolean;
}

interface ShareOptions {
  requireAuth: boolean;
  allowEdit: boolean;
  expiresAt?: Date;
  maxCollaborators?: number;
}

interface ShareThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thread: {
    id: string;
    title: string;
    isShared: boolean;
    shareId?: string;
  };
  onShare: (options: ShareOptions) => Promise<{ shareUrl: string }>;
  onUnshare: () => Promise<void>;
  onAddCollaborator: (email: string, role: string) => Promise<void>;
  onRemoveCollaborator: (collaboratorId: string) => Promise<void>;
  onUpdateCollaboratorRole: (collaboratorId: string, role: string) => Promise<void>;
  collaborators: Collaborator[];
  organizationMembers?: OrganizationMember[];
  onInviteOrganizationMember?: (memberId: string, role: string) => Promise<void>;
}

export function ShareThreadDialog({
  open,
  onOpenChange,
  thread,
  onShare,
  onUnshare,
  onAddCollaborator,
  onRemoveCollaborator,
  onUpdateCollaboratorRole,
  collaborators = [],
  organizationMembers = [],
  onInviteOrganizationMember,
}: ShareThreadDialogProps) {
  const [activeTab, setActiveTab] = useState('link');
  const [orgMembersLoading, setOrgMembersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Share options
  const [requireAuth, setRequireAuth] = useState(true);
  const [allowEdit, setAllowEdit] = useState(false);
  const [expiresIn, setExpiresIn] = useState('never');
  const [maxCollaborators, setMaxCollaborators] = useState<number | undefined>();
  
  // Collaborator invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const [isInviting, setIsInviting] = useState(false);
  const [invitingMemberIds, setInvitingMemberIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (thread.isShared && thread.shareId) {
      const url = `${window.location.origin}/aioptimise/shared/${thread.shareId}`;
      setShareUrl(url);
      generateQRCode(url);
    }
  }, [thread.isShared, thread.shareId]);

  const generateQRCode = async (url: string) => {
    try {
      const qr = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qr);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const options: ShareOptions = {
        requireAuth,
        allowEdit,
      };

      if (expiresIn !== 'never') {
        const expiresAt = new Date();
        switch (expiresIn) {
          case '1hour':
            expiresAt.setHours(expiresAt.getHours() + 1);
            break;
          case '1day':
            expiresAt.setDate(expiresAt.getDate() + 1);
            break;
          case '1week':
            expiresAt.setDate(expiresAt.getDate() + 7);
            break;
          case '1month':
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            break;
        }
        options.expiresAt = expiresAt;
      }

      if (maxCollaborators) {
        options.maxCollaborators = maxCollaborators;
      }

      const result = await onShare(options);
      setShareUrl(result.shareUrl);
      await generateQRCode(result.shareUrl);
      toast.success('Thread shared successfully!');
    } catch (error) {
      toast.error('Failed to share thread');
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnshare = async () => {
    setIsSharing(true);
    try {
      await onUnshare();
      setShareUrl('');
      setQrCodeUrl('');
      toast.success('Thread sharing disabled');
    } catch (error) {
      toast.error('Failed to unshare thread');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    try {
      await onAddCollaborator(inviteEmail, inviteRole);
      setInviteEmail('');
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleInviteOrganizationMember = async (memberId: string, role: string) => {
    setInvitingMemberIds(prev => new Set(prev).add(memberId));
    try {
      const response = await fetch(`/api/aioptimise/threads/${thread.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      const result = await response.json();
      toast.success(result.message || 'Invitation sent successfully!');

      // Call the optional callback if provided
      if (onInviteOrganizationMember) {
        await onInviteOrganizationMember(memberId, role);
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setInvitingMemberIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const filteredOrgMembers = organizationMembers.filter(member => {
    if (member.isCurrentUser || member.isAlreadyCollaborator) return false;
    if (!searchTerm) return true;
    return (
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-3 w-3" />;
      case 'EDITOR':
        return <Edit3 className="h-3 w-3" />;
      default:
        return <Eye className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'EDITOR':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-black/95 backdrop-blur-2xl border-indigo-500/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 rounded-lg pointer-events-none" />
        <DialogHeader className="relative">
          <DialogTitle className="text-gray-100">Share Thread</DialogTitle>
          <DialogDescription className="text-gray-400">
            Share "{thread.title}" with others or manage collaborators
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="link" className="text-gray-300 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <Link className="h-4 w-4 mr-2" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="members" className="text-gray-300 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team ({filteredOrgMembers.length})
            </TabsTrigger>
            <TabsTrigger value="collaborators" className="text-gray-300 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <Users className="h-4 w-4 mr-2" />
              Collaborators ({collaborators.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-gray-300 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <Shield className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-4 space-y-4">
            {thread.isShared ? (
              <>
                <div className="space-y-3">
                  <Label className="text-gray-200">Share URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="bg-gray-900/50 text-gray-200 border-gray-700 focus:border-indigo-500/50"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="icon"
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-400 hover:text-gray-200"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="space-y-3">
                    <Label className="text-gray-200">QR Code</Label>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      Anyone with the link can {allowEdit ? 'edit' : 'view'}
                    </span>
                  </div>
                  <Button
                    onClick={handleUnshare}
                    variant="destructive"
                    size="sm"
                  >
                    Disable Sharing
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="p-3 bg-muted rounded-full w-fit mx-auto">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Thread is private
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable sharing to generate a link
                  </p>
                </div>
                <Button onClick={handleShare} disabled={isSharing}>
                  {isSharing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2" />
                      Enable Sharing
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-200">Organization Members</Label>
                <div className="text-xs text-gray-400">
                  {filteredOrgMembers.length} members available to invite
                </div>
              </div>

              {organizationMembers.length > 0 && (
                <Input
                  placeholder="Search members by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-900/50 text-gray-200 border-gray-700 focus:border-indigo-500/50"
                />
              )}
            </div>

            <ScrollArea className="h-[300px] border rounded-lg border-gray-700">
              {organizationMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <AlertCircle className="h-12 w-12 text-gray-500 mb-3" />
                  <p className="text-sm text-gray-400">
                    No organization members found. Make sure you're part of an organization.
                  </p>
                </div>
              ) : filteredOrgMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Users className="h-12 w-12 text-gray-500 mb-3" />
                  <p className="text-sm text-gray-400">
                    {searchTerm ? 'No members match your search.' : 'All team members are already collaborators or invited.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredOrgMembers.map((member) => {
                    const isInviting = invitingMemberIds.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.image} />
                            <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-sm">
                              {member.name?.[0] || member.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-200">
                                {member.name || member.email}
                              </span>
                              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                {member.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {member.jobTitle && (
                                <span>{member.jobTitle}</span>
                              )}
                              {member.department && member.jobTitle && (
                                <span>•</span>
                              )}
                              {member.department && (
                                <span>{member.department}</span>
                              )}
                            </div>
                            {member.lastActiveAt && (
                              <span className="text-xs text-gray-500">
                                Last active {formatDistanceToNow(new Date(member.lastActiveAt))} ago
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue="VIEWER"
                            onValueChange={(role) => handleInviteOrganizationMember(member.id, role)}
                            disabled={isInviting}
                          >
                            <SelectTrigger className="w-24 h-8 bg-gray-900/50 border-gray-600 text-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="VIEWER" className="text-gray-300 hover:bg-gray-800">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-3 w-3" />
                                  Viewer
                                </div>
                              </SelectItem>
                              <SelectItem value="EDITOR" className="text-gray-300 hover:bg-gray-800">
                                <div className="flex items-center gap-2">
                                  <Edit3 className="h-3 w-3" />
                                  Editor
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {isInviting && (
                            <div className="flex items-center gap-2 text-xs text-indigo-400">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Inviting...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="collaborators" className="mt-4 space-y-4">
            <div className="space-y-3">
              <Label className="text-foreground">Invite Collaborator</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                  <SelectTrigger className="w-32 bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleInviteCollaborator}
                  disabled={isInviting || !inviteEmail}
                >
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg border-border">
              {collaborators.length > 0 ? (
                <div className="p-4 space-y-3">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collaborator.image} />
                          <AvatarFallback className="bg-primary/10 text-foreground text-xs">
                            {collaborator.name?.[0] || collaborator.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {collaborator.name || collaborator.email || 'Unknown User'}
                            </span>
                            {collaborator.isOnline && (
                              <div className="h-2 w-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(collaborator.joinedAt))} ago
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(collaborator.role)}>
                          {getRoleIcon(collaborator.role)}
                          <span className="ml-1">{collaborator.role}</span>
                        </Badge>
                        <Button
                          onClick={() => onRemoveCollaborator(collaborator.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No collaborators yet. Invite someone to collaborate!
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Require Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Users must sign in to access the thread
                  </p>
                </div>
                <Switch
                  checked={requireAuth}
                  onCheckedChange={setRequireAuth}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Allow Editing</Label>
                  <p className="text-xs text-muted-foreground">
                    Anyone with the link can add messages
                  </p>
                </div>
                <Switch
                  checked={allowEdit}
                  onCheckedChange={setAllowEdit}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Link Expiration</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="1hour">1 Hour</SelectItem>
                    <SelectItem value="1day">1 Day</SelectItem>
                    <SelectItem value="1week">1 Week</SelectItem>
                    <SelectItem value="1month">1 Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Max Collaborators</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={maxCollaborators || ''}
                  onChange={(e) => setMaxCollaborators(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="1"
                  max="100"
                  className="bg-background text-foreground border-border"
                />
              </div>

              {!thread.isShared && (
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying Settings...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Apply Settings & Share
                    </>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}