-- Thread Management Updates
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS share_token VARCHAR(255) UNIQUE;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'standard';
ALTER TABLE threads ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_threads_pinned ON threads(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_threads_shared ON threads(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_threads_share_token ON threads(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_threads_deleted ON threads(deleted_at) WHERE deleted_at IS NOT NULL;

-- Thread collaborators for shared access
CREATE TABLE IF NOT EXISTS thread_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'owner')),
  joined_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_thread_user UNIQUE(thread_id, user_id),
  CONSTRAINT unique_thread_email UNIQUE(thread_id, email),
  CONSTRAINT user_or_email CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX idx_collaborators_thread ON thread_collaborators(thread_id);
CREATE INDEX idx_collaborators_user ON thread_collaborators(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_collaborators_email ON thread_collaborators(email) WHERE email IS NOT NULL;

-- Thread activity log for audit trail
CREATE TABLE IF NOT EXISTS thread_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'edited', 'shared', 'unshared', 'pinned', 'unpinned', 'deleted', 'restored', 'collaborator_added', 'collaborator_removed')),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_thread ON thread_activity(thread_id, created_at DESC);
CREATE INDEX idx_activity_user ON thread_activity(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_activity_action ON thread_activity(action, created_at DESC);

-- Messages updates for collaboration
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS edited_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_messages_edited ON messages(edited_at) WHERE edited_at IS NOT NULL;

-- Prompt templates for reusable prompts
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  category VARCHAR(100),
  variables JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_org ON prompt_templates(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_templates_user ON prompt_templates(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_templates_category ON prompt_templates(category) WHERE category IS NOT NULL;
CREATE INDEX idx_templates_public ON prompt_templates(is_public) WHERE is_public = true;

-- Prompt analysis history
CREATE TABLE IF NOT EXISTS prompt_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  prompt TEXT NOT NULL,
  analysis JSONB NOT NULL,
  provider VARCHAR(50),
  model VARCHAR(100),
  token_count INTEGER,
  cost_estimate DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analysis_thread ON prompt_analysis(thread_id, created_at DESC);
CREATE INDEX idx_analysis_user ON prompt_analysis(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analysis_model ON prompt_analysis(provider, model) WHERE provider IS NOT NULL;

-- Real-time presence tracking
CREATE TABLE IF NOT EXISTS thread_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  socket_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'idle', 'typing')),
  cursor_position JSONB,
  last_seen TIMESTAMP DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

CREATE INDEX idx_presence_thread ON thread_presence(thread_id);
CREATE INDEX idx_presence_active ON thread_presence(thread_id, status) WHERE status = 'active';

-- Function to clean up old presence records
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM thread_presence 
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to track thread activity
CREATE OR REPLACE FUNCTION track_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically log certain actions
  IF TG_OP = 'UPDATE' THEN
    IF OLD.is_pinned != NEW.is_pinned THEN
      INSERT INTO thread_activity (thread_id, user_id, action, metadata)
      VALUES (NEW.id, NEW.user_id, 
        CASE WHEN NEW.is_pinned THEN 'pinned' ELSE 'unpinned' END,
        jsonb_build_object('old_value', OLD.is_pinned, 'new_value', NEW.is_pinned));
    END IF;
    
    IF OLD.is_shared != NEW.is_shared THEN
      INSERT INTO thread_activity (thread_id, user_id, action, metadata)
      VALUES (NEW.id, NEW.user_id,
        CASE WHEN NEW.is_shared THEN 'shared' ELSE 'unshared' END,
        jsonb_build_object('share_token', NEW.share_token));
    END IF;
    
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      INSERT INTO thread_activity (thread_id, user_id, action)
      VALUES (NEW.id, NEW.user_id, 'deleted');
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      INSERT INTO thread_activity (thread_id, user_id, action)
      VALUES (NEW.id, NEW.user_id, 'restored');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity tracking
DROP TRIGGER IF EXISTS track_thread_activity_trigger ON threads;
CREATE TRIGGER track_thread_activity_trigger
AFTER UPDATE ON threads
FOR EACH ROW
EXECUTE FUNCTION track_thread_activity();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to new tables
DROP TRIGGER IF EXISTS update_thread_collaborators_updated_at ON thread_collaborators;
CREATE TRIGGER update_thread_collaborators_updated_at
BEFORE UPDATE ON thread_collaborators
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;
CREATE TRIGGER update_prompt_templates_updated_at
BEFORE UPDATE ON prompt_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();