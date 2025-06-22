-- Function to count attachments
DROP FUNCTION IF EXISTS count_attachments() CASCADE;
CREATE OR REPLACE FUNCTION count_attachments() RETURNS TRIGGER
AS
$$
BEGIN
    IF
        -- new attachment
        TG_OP = 'INSERT' THEN
        UPDATE users u
        SET attachment_count = attachment_count + 1
        FROM notes n
        WHERE n.id = new.note_id::UUID
          AND u.id = n.user_id::UUID;

    ELSIF
        -- hard delete
        TG_OP = 'DELETE' THEN
        UPDATE users u
        SET attachment_count = greatest(attachment_count - 1, 0)
        FROM notes n
        WHERE n.id = old.note_id::UUID
          AND u.id = n.user_id::UUID;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for attachments
CREATE TRIGGER on_attachment
    AFTER INSERT OR DELETE
    ON attachments
    FOR EACH ROW
EXECUTE PROCEDURE count_attachments();

COMMENT ON FUNCTION count_attachments()
    IS 'Trigger function to update the attachment count for a user when an attachment is inserted or deleted.';
COMMENT ON TRIGGER on_attachment ON attachments
    IS 'Trigger to update the attachment count for a user when an attachment is inserted or deleted.';


-- one-time update of users attachment counts
WITH attachment_counts AS (
    SELECT n.user_id, count(a.id) as count
    FROM notes n
    LEFT JOIN attachments a ON a.note_id = n.id
    GROUP BY n.user_id
)
UPDATE users u
SET attachment_count = coalesce(ac.count, 0)
FROM attachment_counts ac
WHERE u.id = ac.user_id;

