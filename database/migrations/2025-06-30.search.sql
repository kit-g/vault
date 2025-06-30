CREATE EXTENSION IF NOT EXISTS pg_trgm;

COMMENT ON COLUMN notes.search_vector IS 'Search vector for the note and all its attachments';

DROP FUNCTION IF EXISTS note_to_search() CASCADE;
CREATE OR REPLACE FUNCTION note_to_search() RETURNS trigger AS
$$
BEGIN
    NEW.search_vector :=
            setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_note_2
    BEFORE INSERT OR UPDATE OF title, content
    ON notes
    FOR EACH ROW
EXECUTE FUNCTION note_to_search();

DROP FUNCTION IF EXISTS attachment_to_search() CASCADE;
CREATE OR REPLACE FUNCTION attachment_to_search() RETURNS trigger AS
$$
BEGIN

    UPDATE notes
    SET search_vector =
            setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(content, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.file_name, '')), 'C')
    WHERE id = COALESCE(NEW.note_id, OLD.note_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_attachment_2
    BEFORE INSERT OR DELETE
    ON attachments
    FOR EACH ROW
EXECUTE FUNCTION attachment_to_search();


COMMENT ON FUNCTION note_to_search() IS 'Converts the note into a search vector';
COMMENT ON FUNCTION attachment_to_search() IS 'Converts the note into a search vector';
COMMENT ON TRIGGER on_attachment_2 ON attachments IS 'Converts the note into a search vector';
COMMENT ON TRIGGER on_note_2 ON notes IS 'Converts the note into a search vector';

DROP INDEX IF EXISTS idx_notes_search_vector;
CREATE INDEX IF NOT EXISTS idx_notes_search_vector
    ON notes USING gin (search_vector);
