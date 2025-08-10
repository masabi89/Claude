-- Control Plane DB (public)
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('trial','basic','pro','enterprise')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE org_users (
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('org_admin','project_manager','team_member','client','super_admin')),
  PRIMARY KEY (tenant_id, user_id)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','trial','past_due','canceled')),
  current_period_end TIMESTAMPTZ
);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID,
  actor_id UUID,
  action TEXT,
  entity TEXT,
  entity_id UUID,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant DB template (per tenant)
CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE app.projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','active','completed','archived')),
  start_date DATE,
  end_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE app.tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES app.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo','in_progress','review','done')),
  priority TEXT NOT NULL CHECK (priority IN ('low','medium','high','urgent')),
  due_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE app.task_assignees (
  task_id UUID REFERENCES app.tasks(id) ON DELETE CASCADE,
  user_id UUID,
  PRIMARY KEY (task_id, user_id)
);

CREATE TABLE app.comments (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES app.tasks(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE app.files (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  url TEXT NOT NULL,
  size_bytes BIGINT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_project ON app.tasks(project_id);
CREATE INDEX idx_tasks_status ON app.tasks(status);
CREATE INDEX idx_tasks_due ON app.tasks(due_date);
