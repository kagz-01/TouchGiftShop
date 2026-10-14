-- Add poll_vote_index to pool_contributions to track which gift option a contributor voted for
--
-- Original statement was a bare ADD COLUMN, so it aborted on any database where
-- the column had already been added by hand — which stopped the whole
-- migration runner mid-file and left every later migration unapplied.
-- Migrations must be re-runnable: this one is now guarded.
ALTER TABLE pool_contributions
ADD COLUMN IF NOT EXISTS poll_vote_index INT DEFAULT NULL;
