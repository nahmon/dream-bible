-- Add input text storage for admin visibility
alter table user_events add column if not exists input_text text;
