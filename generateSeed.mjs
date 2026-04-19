import fs from "fs";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

async function generateSeed() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const orgId = randomUUID();
  const orgName = "Acme Corp";

  let sql = `
-- ============================================
-- Seeding Demo Data (Idempotent)
-- ============================================

DO $$ 
DECLARE
  org_id UUID := '${orgId}';
  admin1_id UUID := '${randomUUID()}';
  admin2_id UUID := '${randomUUID()}';
  member1_id UUID := '${randomUUID()}';
  member2_id UUID := '${randomUUID()}';
  member3_id UUID := '${randomUUID()}';
  member4_id UUID := '${randomUUID()}';
  member5_id UUID := '${randomUUID()}';
  member6_id UUID := '${randomUUID()}';
  member7_id UUID := '${randomUUID()}';
  
  task1_id UUID := '${randomUUID()}';
  task2_id UUID := '${randomUUID()}';
  task3_id UUID := '${randomUUID()}';
  task4_id UUID := '${randomUUID()}';
  task5_id UUID := '${randomUUID()}';
  
  event1_id UUID := '${randomUUID()}';
  event2_id UUID := '${randomUUID()}';
BEGIN

-- Insert Organization (1)
IF NOT EXISTS (SELECT 1 FROM organizations WHERE name = '${orgName}') THEN
  INSERT INTO organizations (id, name, description) 
  VALUES (org_id, '${orgName}', 'A highly dynamic and fast-paced startup.');
ELSE
  SELECT id INTO org_id FROM organizations WHERE name = '${orgName}';
END IF;

-- Insert Admins (2)
INSERT INTO users (id, name, email, password_hash, role, organization_id, is_active)
VALUES 
(admin1_id, 'Alice Admin', 'admin1@acme.com', '${passwordHash}', 'admin', org_id, true),
(admin2_id, 'Bob Boss', 'admin2@acme.com', '${passwordHash}', 'admin', org_id, true)
ON CONFLICT (email) DO NOTHING;

-- Insert Members (7)
INSERT INTO users (id, name, email, password_hash, role, organization_id, is_active)
VALUES 
(member1_id, 'Charlie Carter', 'member1@acme.com', '${passwordHash}', 'member', org_id, true),
(member2_id, 'Diana Davidson', 'member2@acme.com', '${passwordHash}', 'member', org_id, true),
(member3_id, 'Ethan Edwards', 'member3@acme.com', '${passwordHash}', 'member', org_id, true),
(member4_id, 'Fiona Foster', 'member4@acme.com', '${passwordHash}', 'member', org_id, true),
(member5_id, 'George Grant', 'member5@acme.com', '${passwordHash}', 'member', org_id, true),
(member6_id, 'Hannah Hughes', 'member6@acme.com', '${passwordHash}', 'member', org_id, true),
(member7_id, 'Ian Irvine', 'member7@acme.com', '${passwordHash}', 'member', org_id, true)
ON CONFLICT (email) DO NOTHING;

-- Insert Organization Owner Account (1) mapped to same Org ID
INSERT INTO users (id, name, email, password_hash, role, organization_id, is_active)
VALUES 
('${randomUUID()}', '${orgName}', 'org@acme.com', '${passwordHash}', 'organization', org_id, true)
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
`;

  fs.appendFileSync('init.sql', sql);
  console.log("Appended seed data to init.sql");
}

generateSeed().catch(console.error);
