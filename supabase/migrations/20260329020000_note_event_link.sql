ALTER TABLE notes ADD COLUMN event_id UUID REFERENCES schedule_events(id) ON DELETE SET NULL;
CREATE INDEX idx_notes_event ON notes(event_id);
