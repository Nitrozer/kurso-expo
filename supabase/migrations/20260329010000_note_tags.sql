ALTER TABLE notes ADD COLUMN tags TEXT[] DEFAULT '{}';
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
