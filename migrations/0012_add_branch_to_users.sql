ALTER TABLE users ADD COLUMN branch VARCHAR(100);

-- Create index for branch column
CREATE INDEX users_branch_idx ON users(branch);