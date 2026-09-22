export type OrgRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  role: OrgRole;
  created_at: string;
}

export interface OrgMember {
  user_id: number;
  email: string;
  name: string | null;
  role: OrgRole;
  joined_at: string;
}

export interface OrgInvite {
  id: number;
  email: string;
  role: OrgRole;
  expires_at: string;
  created_at: string;
  invited_by_email: string | null;
}

export interface InvitePreview {
  organization_name: string;
  email: string;
  role: OrgRole;
}

export type ChannelType = 'email' | 'slack' | 'discord' | 'webhook';

export interface NotificationChannel {
  id: number;
  org_id: number;
  type: ChannelType;
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
}

export interface SessionSummary {
  id: number;
  user_agent: string | null;
  ip: string | null;
  last_used_at: string | null;
  created_at: string;
  expires_at: string;
  current: boolean;
}

export interface CurrentUser {
  id: number;
  email: string;
  name: string | null;
}
