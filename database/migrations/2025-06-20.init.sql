DROP FUNCTION IF EXISTS count_notes() CASCADE;
CREATE OR REPLACE FUNCTION count_notes() RETURNS TRIGGER
AS
$$
BEGIN
    IF
        -- new note
        TG_OP = 'INSERT' THEN

        UPDATE users
        SET notes_count = notes_count + 1
        WHERE id = new.user_id::UUID;

    ELSIF
        -- soft-delete (was not deleted, now is)
        (TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
        UPDATE users
        SET notes_count         = greatest(notes_count - 1, 0)
          , deleted_notes_count = deleted_notes_count + 1
        WHERE id = new.user_id::UUID;

    ELSIF
        -- undo soft-delete (was deleted, now is not)
        (TG_OP = 'UPDATE' AND OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL) THEN
        UPDATE users
        SET notes_count         = notes_count + 1
          , deleted_notes_count = greatest(deleted_notes_count - 1, 0)
        WHERE id = new.user_id::UUID;

    ELSIF
        -- hard delete
        TG_OP = 'DELETE' THEN
        -- if soft-deleted, we need to decrement the deleted_notes_count
        IF OLD.deleted_at IS NULL THEN
            UPDATE users
            SET notes_count = greatest(notes_count - 1, 0)
            WHERE id = old.user_id::UUID;
        END IF;

        -- if hard-deleted, we need to increment the deleted_notes_count
        IF OLD.deleted_at IS NOT NULL THEN
            UPDATE users
            SET deleted_notes_count = deleted_notes_count - 1
            WHERE id = old.user_id::UUID;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;;

CREATE TRIGGER on_note
    AFTER INSERT OR DELETE OR UPDATE OF deleted_at
    ON notes
    FOR EACH ROW
EXECUTE PROCEDURE count_notes();

COMMENT ON FUNCTION count_notes()
    IS 'Trigger function to update the notes count for a user when a note is inserted, deleted, or updated.';
COMMENT ON TRIGGER on_note ON notes
    IS 'Trigger function to update the notes count for a user when a note is inserted, deleted, or updated.';

-- TRUNCATE notes CASCADE ;