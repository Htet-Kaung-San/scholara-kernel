-- Promote the most recently created user to ADMIN
-- (Using the correct table name "profiles" which Prisma maps to)

UPDATE profiles
SET role = 'ADMIN'
WHERE created_at = (
  SELECT MAX(created_at) 
  FROM profiles
);

-- Verify the change
SELECT email, role FROM profiles WHERE role = 'ADMIN';
