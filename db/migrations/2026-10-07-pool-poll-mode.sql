-- Add poll_vote_index to pool_contributions to track which gift option a contributor voted for

ALTER TABLE pool_contributions 
ADD COLUMN poll_vote_index INT DEFAULT NULL;
