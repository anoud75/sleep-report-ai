-- 1. Delete duplicate organizations (keep the first one created)
DELETE FROM organizations 
WHERE name = 'King Khalid University Hospital' 
AND id != '25ef673d-3a75-41b7-814f-c3f589bc0ea3';

-- 2. Link your profile to the organization
UPDATE profiles 
SET organization_id = '25ef673d-3a75-41b7-814f-c3f589bc0ea3'
WHERE id = 'f7ca5d04-af03-4796-8ae4-26c555daf0a0';

-- 3. Approve the organization
UPDATE organizations 
SET is_approved = true 
WHERE id = '25ef673d-3a75-41b7-814f-c3f589bc0ea3';

-- 4. Approve your profile
UPDATE profiles 
SET is_approved = true 
WHERE id = 'f7ca5d04-af03-4796-8ae4-26c555daf0a0';

-- 5. Fix user_roles foreign key constraint to reference auth.users
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Insert your super_admin role
INSERT INTO user_roles (user_id, role) 
VALUES ('f7ca5d04-af03-4796-8ae4-26c555daf0a0', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;