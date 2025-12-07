-- Create admin user
-- Email: admin@tawawunak.sa
-- Password: Admin123!

INSERT INTO "User" (id, email, "passwordHash", "fullName", role, suspended, "tokenVersion", "mfaEnabled", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@tawawunak.sa',
  '$2a$10$PohQ3sfPqP5GZcmhL5PEWuktvi2ympmV8695GSG9q9YL7GQ/kX8Yu',
  'System Administrator',
  'ADMIN',
  false,
  0,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, "fullName", role FROM "User" WHERE email = 'admin@tawawunak.sa';

