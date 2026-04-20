-- Create enum types
DO $$ BEGIN
  CREATE TYPE role AS ENUM ('organization', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM ('open', 'in_review', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM ('created', 'updated', 'deleted', 'assigned', 'status_changed', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name TEXT NOT NULL,
  role role NOT NULL DEFAULT 'member',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  department TEXT,
  position TEXT,
  bio TEXT,
  avatar_url TEXT,
  oauth_provider TEXT,
  oauth_id TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status event_status NOT NULL DEFAULT 'upcoming',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  max_attendees INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Event Attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status complaint_status NOT NULL DEFAULT 'open',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submitted_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response TEXT,
  responded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP,
  target_role TEXT DEFAULT 'organization' NOT NULL,
  is_anonymous BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Task Audit Logs table
CREATE TABLE IF NOT EXISTS task_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action audit_action NOT NULL,
  old_value TEXT,
  new_value TEXT,
  field_changed TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_complaints_org ON complaints(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_task ON task_audit_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON task_audit_logs(organization_id);

-- ============================================
-- Seeding Demo Data (Idempotent)
-- ============================================

DO $$ 
DECLARE
  org_id UUID := '4aae5727-0e65-4c95-91cd-d069f718c245';
  admin1_id UUID := '3caa0037-ef67-4a9d-8221-64050f501e0a';
  admin2_id UUID := 'fed87ae6-d7ab-436f-83a0-c65585aad255';
  member1_id UUID := '9ed3c61a-7281-416c-9388-b6c9cfa9e849';
  member2_id UUID := '77f0ccbf-c0a7-4b74-8c3c-61bdf115a8da';
  member3_id UUID := '206c9a91-2434-4077-823f-d1c3682536b2';
  member4_id UUID := 'b6461cf5-6e1a-4ff5-b92c-a9141d44489b';
  member5_id UUID := '579dbaa8-804b-4f60-af87-b6c0922785ed';
  member6_id UUID := '39fb12ee-807f-472c-9cf6-c544e03036be';
  member7_id UUID := '53f1328b-7eb0-4258-a81d-1a86d901f332';
  
  task1_id UUID := '5130553f-7bb2-423a-b51d-de32c0432559';
  task2_id UUID := '3e9e51a2-d636-4810-934e-6729afab0edb';
  task3_id UUID := '7ba932fe-a9c0-42ff-9d45-3460200ce891';
  task4_id UUID := 'c60ca530-5380-4275-aad7-ef0744385e05';
  task5_id UUID := '5b396c3a-0506-4acb-a9a1-1a04ec98722c';
  
  event1_id UUID := '1f4b2d1d-2b50-4fd0-b0c7-cf3fc4c8c0bf';
  event2_id UUID := '4a53aed6-0d90-47cc-adae-f8733d1321d2';
BEGIN

-- Insert Organization (1)
IF NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Acme Corp') THEN
  INSERT INTO organizations (id, name, description) 
  VALUES (org_id, 'Acme Corp', 'A highly dynamic and fast-paced startup.');
ELSE
  SELECT id INTO org_id FROM organizations WHERE name = 'Acme Corp';
END IF;

-- Insert Admins (2)
INSERT INTO users (id, name, email, password_hash, role, organization_id, is_active)
VALUES 
(admin1_id, 'Alice Admin', 'admin1@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'admin', org_id, true),
(admin2_id, 'Bob Boss', 'admin2@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'admin', org_id, true)
ON CONFLICT (email) DO NOTHING;

-- Insert Members (7)
INSERT INTO users (id, name, email, password_hash, role, organization_id, is_active)
VALUES 
(member1_id, 'Charlie Carter', 'member1@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'member', org_id, true),
(member2_id, 'Diana Davidson', 'member2@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'member', org_id, true),
(member3_id, 'Ethan Edwards', 'member3@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'member', org_id, true),
(member4_id, 'Fiona Foster', 'member4@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'member', org_id, true),
(member5_id, 'George Grant', 'member5@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'member', org_id, true),
(member6_id, 'Hannah Hughes', 'member6@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'member', org_id, true),
(member7_id, 'Ian Irvine', 'member7@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'member', org_id, true)
ON CONFLICT (email) DO NOTHING;

-- Insert Organization Owner Account (1) mapped to same Org ID
INSERT INTO users (id, name, email, password_hash, role, organization_id, is_active)
VALUES 
('2d1e78d0-2625-4281-a0e9-df55f4e4a542', 'Acme Corp', 'org@acme.com', '$2b$10$CmN6Amu3MufY1YPoQ1DzWeEWry/He6.9j1C4hZsUA2mUTBoQKfWaq', 'organization', org_id, true)
ON CONFLICT (email) DO NOTHING;

-- Insert Demo Tasks
IF NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Deploy v2.0 to Production') THEN
  INSERT INTO tasks (id, title, description, status, priority, organization_id, created_by_id, assigned_to_id, due_date)
  VALUES 
  (task1_id, 'Deploy v2.0 to Production', 'Ensure all staging tests pass before pushing.', 'in_progress', 'high', org_id, admin1_id, member1_id, NOW() + INTERVAL '2 days'),
  (task2_id, 'Design new Landing Page', 'Update the UI to a modern light theme.', 'done', 'medium', org_id, admin2_id, member2_id, NOW() - INTERVAL '1 day'),
  (task3_id, 'Fix Login Middleware Bug', 'Users are being redirected wrongly. Fix auth token cookies.', 'todo', 'urgent', org_id, admin1_id, member3_id, NOW() + INTERVAL '1 day'),
  (task4_id, 'Prepare Q3 Financial Report', 'Gather all analytics data across the multitenant system.', 'todo', 'high', org_id, admin2_id, member4_id, NOW() + INTERVAL '5 days'),
  (task5_id, 'Onboard New Employees', 'Setup equipment and accounts for new hires.', 'in_progress', 'low', org_id, admin1_id, member5_id, NOW() + INTERVAL '7 days');
END IF;

-- Insert Demo Events
IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Q3 All Hands Meeting') THEN
  INSERT INTO events (id, title, description, location, status, organization_id, created_by_id, start_date, end_date)
  VALUES 
  (event1_id, 'Q3 All Hands Meeting', 'Company wide sync to discuss roadmap and accomplishments.', 'Virtual - Zoom', 'upcoming', org_id, admin1_id, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours'),
  (event2_id, 'Team Building Retreat', 'Annual getaway to boost team morale.', 'Lake Tahoe Cabin', 'upcoming', org_id, admin2_id, NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days');

  -- Add Attendees
  INSERT INTO event_attendees (event_id, user_id)
  VALUES 
  (event1_id, admin1_id), (event1_id, admin2_id), (event1_id, member1_id), (event1_id, member2_id), (event1_id, member3_id), (event1_id, member4_id),
  (event2_id, admin2_id), (event2_id, member5_id), (event2_id, member6_id), (event2_id, member7_id);
END IF;

END $$;
