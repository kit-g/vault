package notes

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"strconv"
	"vault/internal/awsx"
	"vault/internal/db"
	"vault/internal/errors"
	"vault/internal/models"
)

// CreateNote godoc
//
//	@Summary		Create a new n
//	@Summary		Create a new note
//	@Description	Creates a note for the authenticated user
//	@ID				createNote
//	@Tags			notes
//	@Accept			json
//	@Produce		json
//	@Param			note	body		NoteIn	true	"Note object"
//	@Success		201		{object}	NoteOut
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/notes [post]
//	@Security		BearerAuth
func CreateNote(c *gin.Context, userID uuid.UUID) (any, error) {
	var input models.NoteIn

	if err := c.ShouldBindJSON(&input); err != nil {
		return nil, errors.NewValidationError(err)
	}

	note := models.NewNote(&input, userID)

	if err := db.DB.Create(&note).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewNoteOut(&note), nil
}

// GetNotes godoc
//
//	@Summary		List user notes
//	@Description	Returns paginated notes for the authenticated user with optional filtering
//	@Tags			notes
//	@Accept			json
//	@Produce		json
//	@ID				getNotes
//	@Param			page		query		int		false	"Page number"		default(1)
//	@Param			limit		query		int		false	"Items per page"	default(10)
//	@Param			archived	query		bool	false	"Filter by archived status"
//	@Param			encrypted	query		bool	false	"Filter by encrypted status"
//	@Success		200			{object}    NotesResponse
//	@Failure		401			{object}	ErrorResponse	"Unauthorized"
//	@Failure		500			{object}	ErrorResponse	"Server error"
//	@Router			/notes [get]
//	@Security		BearerAuth
func GetNotes(c *gin.Context, userID uuid.UUID) (any, error) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var (
		archived, archivedSet   = c.GetQuery("archived")
		encrypted, encryptedSet = c.GetQuery("encrypted")
	)

	var notes []models.NoteWithCount

	query := db.DB.
		Model(&models.Note{}).
		Joins("JOIN users ON users.id = notes.user_id").
		Select("notes.*, users.notes_count").
		Where("notes.user_id = ?", userID).
		Preload("Attachments").
		Order("created_at desc").
		Limit(limit).
		Offset(offset)

	if archivedSet {
		if v, err := strconv.ParseBool(archived); err == nil {
			query = query.Where("archived = ?", v)
		}
	}

	if encryptedSet {
		if v, err := strconv.ParseBool(encrypted); err == nil {
			query = query.Where("encrypted = ?", v)
		}
	}

	if err := query.Find(&notes).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	var out []models.NoteOut
	total := 0

	for _, n := range notes {
		if total == 0 {
			total = n.NotesCount
		}
		out = append(out, models.NewNoteOut(&n.Note))
	}
	return models.NotesResponse{
		Notes: out,
		Total: total,
	}, nil
}

// GetNote godoc
//
//	@Summary		Get a single note
//	@Description	Retrieves a specific note owned by the authenticated user
//	@Tags			notes
//	@ID			    getNote
//	@Produce		json
//	@Param			noteId	path		string	true	"Note UUID"
//	@Success		200		{object}	NoteOut
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		404		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/notes/{noteId} [get]
//	@Security		BearerAuth
func GetNote(c *gin.Context, userID uuid.UUID) (any, error) {
	noteIDStr := c.Param("noteId")
	noteID, err := uuid.Parse(noteIDStr)

	if err != nil {
		return nil, errors.NewValidationError(err)
	}

	var note models.Note
	if err := db.DB.
		Where("user_id = ? AND id = ?", userID, noteID).
		Preload("Attachments").
		First(&note).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewNotFoundError("Note not found", err)
		}
		return nil, errors.NewServerError(err)
	}

	return models.NewNoteOut(&note), nil
}

// EditNote godoc
//
//	@Summary		Edit a note
//	@Description	Updates the note fields for the authenticated user
//	@Tags			notes
//	@ID				editNote
//	@Accept			json
//	@Produce		json
//	@Param			noteId	path		string			true	"Note ID"
//	@Param			note	body		NoteIn	true	"Note fields"
//	@Success		200		{object}	NoteOut
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		404		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/notes/{noteId} [put]
//	@Security		BearerAuth
func EditNote(c *gin.Context, userID uuid.UUID) (any, error) {
	noteIDStr := c.Param("noteId")
	noteID, err := uuid.Parse(noteIDStr)
	if err != nil {
		return nil, errors.NewValidationError(fmt.Errorf("invalid note ID: %w", err))
	}

	var input models.NoteIn
	if err := c.ShouldBindJSON(&input); err != nil {
		return nil, errors.NewValidationError(err)
	}

	var note models.Note
	if err := db.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewNotFoundError("Note not found", err)
		}
		return nil, errors.NewServerError(err)
	}

	note.Title = input.Title
	note.Content = input.Content

	if err := db.DB.Save(&note).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewNoteOut(&note), nil
}

// DeleteNote godoc
//
//	@Summary		Delete a note
//	@Description	Deletes a note owned by the authenticated user
//	@Tags			notes
//	@Produce		json
//	@ID				deleteNote
//	@Param			noteId	path	string	true	"Note ID"
//	@Param			hard	query	boolean	false	"Hard delete flag" default(false)
//	@Success		204		"No Content"
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		404		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/notes/{noteId} [delete]
//	@Security		BearerAuth
func DeleteNote(c *gin.Context, userID uuid.UUID) (any, error) {

	noteIDStr := c.Param("noteId")
	noteID, err := uuid.Parse(noteIDStr)
	if err != nil {
		return nil, errors.NewValidationError(fmt.Errorf("invalid note ID: %w", err))
	}

	hard, _ := strconv.ParseBool(c.DefaultQuery("hard", "false"))

	tx := db.DB
	if hard {
		tx = tx.Unscoped()
	}

	// Find the note
	var note models.Note
	if err := tx.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewNotFoundError("Note not found", err)
		}
		return nil, errors.NewServerError(err)
	}

	if err := tx.Delete(&note).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NoContent, nil
}

// GetUploadURL handles presigned upload URL generation for a specific note.
//
//	@Summary		Generate a presigned S3 upload URL
//	@Description	Generates a presigned URL for uploading an attachment to a specific note
//	@Tags			notes
//	@ID				getUploadURL
//	@Accept			json
//	@Produce		json
//	@Param			noteId	path		string						true	"Note ID"
//	@Param			body	body		PresignUploadRequest	true	"Upload parameters"
//	@Success		200		{object}	PresignUploadResponse
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/notes/{noteId}/attachments [post]
func GetUploadURL(c *gin.Context, userID uuid.UUID) (any, error) {
	var input models.PresignUploadRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		return nil, errors.NewValidationError(err)
	}

	noteIDStr := c.Param("noteId")
	noteID, err := uuid.Parse(noteIDStr)

	var count int64
	if err := db.DB.Model(&models.Note{}).
		Where("id = ? AND user_id = ?", noteID, userID).
		Count(&count).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	if count == 0 {
		return nil, errors.NewForbiddenError("You do not have access to this note", err)
	}

	key := models.AttachmentKey(noteIDStr, input.Filename)

	url, err := awsx.GeneratePresignedPutURL(key, input.ContentType)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.PresignUploadResponse{
		URL: url,
		Key: key,
	}, nil
}

// GetDownloadURL godoc
//
//	@Summary		Get presigned download URL for an attachment
//	@Description	Generates a temporary URL for securely downloading a note's attachment.
//	@Tags			notes
//	@ID				getDownloadURL
//	@Security		BearerAuth
//	@Param			noteId			path		string	true	"Note ID (UUID)"
//	@Param			attachmentId	path		string	true	"Attachment ID (UUID)"
//	@Success		200				{object}	PresignDownloadResponse
//	@Failure		400				{object}	ErrorResponse
//	@Failure		401				{object}	ErrorResponse
//	@Failure		404				{object}	ErrorResponse
//	@Failure		500				{object}	ErrorResponse
//	@Router			/notes/{noteId}/attachments/{attachmentId} [get]
func GetDownloadURL(c *gin.Context, _ uuid.UUID) (any, error) {
	noteID, err := uuid.Parse(c.Param("noteId"))
	if err != nil {
		return nil, errors.NewValidationError(fmt.Errorf("invalid note ID"))
	}

	attachmentID, err := uuid.Parse(c.Param("attachmentId"))
	if err != nil {
		return nil, errors.NewValidationError(fmt.Errorf("invalid attachment ID"))
	}

	var attachment models.Attachment

	err = db.DB.
		Joins("JOIN notes ON notes.id = attachments.note_id").
		Where(
			"notes.id = ? AND attachments.id = ? AND notes.user_id = ?",
			noteID,
			attachmentID,
			c.GetUint("userID"),
		).
		First(&attachment).Error

	key := attachment.Key()

	url, err := awsx.GeneratePresignedGetURL(key)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.PresignDownloadResponse{URL: url}, nil
}

// GetDeletedNotes godoc
//
//	@Summary		List deleted notes
//	@Description	Returns paginated soft-deleted notes for the authenticated user
//	@Tags			notes
//	@Accept			json
//	@Produce		json
//	@ID				getDeletedNotes
//	@Param			page	query		int	false	"Page number"		default(1)
//	@Param			limit	query		int	false	"Items per page"	default(10)
//	@Success		200		{object}	NotesResponse
//	@Failure		401		{object}	ErrorResponse	"Unauthorized"
//	@Failure		500		{object}	ErrorResponse	"Server error"
//	@Router			/notes/deleted [get]
//	@Security		BearerAuth
func GetDeletedNotes(c *gin.Context, userID uuid.UUID) (any, error) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var notes []models.NoteWithCount
	if err := db.DB.
		Unscoped().
		Joins("JOIN users ON users.id = notes.user_id").
		Select("notes.*, users.notes_count").
		Where("notes.user_id = ? AND notes.deleted_at IS NOT NULL", userID).
		Preload("Attachments").
		Order("deleted_at desc").
		Limit(limit).
		Offset(offset).
		Find(&notes).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	var out []models.NoteOut
	total := 0

	for _, n := range notes {
		out = append(out, models.NewNoteOut(&n.Note))
		if total == 0 {
			total = n.NotesCount
		}
	}

	return models.NotesResponse{
		Notes: out,
		Total: total,
	}, nil
}

// RestoreNote godoc
//
//	@Summary		Restore a deleted note
//	@Description	Restores a soft-deleted note owned by the authenticated user
//	@Tags			notes
//	@ID				restoreNote
//	@Param			noteId	path		string	true	"Note ID"
//	@Success		204		"No Content"
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		404		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/notes/{noteId}/restore [post]
//	@Security		BearerAuth
func RestoreNote(c *gin.Context, userID uuid.UUID) (any, error) {
	noteIDStr := c.Param("noteId")
	noteID, err := uuid.Parse(noteIDStr)
	if err != nil {
		return nil, errors.NewValidationError(fmt.Errorf("invalid note ID: %w", err))
	}

	var note models.Note
	if err := db.DB.Unscoped().
		Where("id = ? AND user_id = ? AND deleted_at IS NOT NULL", noteID, userID).
		First(&note).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewNotFoundError("Note not found", err)
		}
		return nil, errors.NewServerError(err)
	}

	if err := db.DB.Model(&note).Unscoped().Update("deleted_at", nil).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewNoteOut(&note), nil
}

// DeleteAttachment godoc
//
//	@Summary	Delete an attachment
//	@Tags		notes
//	@ID			deleteAttachment
//	@Param		noteId			path	string	true	"Note ID"
//	@Param		attachmentId	path	string	true	"Attachment ID"
//	@Success	204				"No Content"
//	@Failure	400				{object}	ErrorResponse
//	@Failure	401				{object}	ErrorResponse
//	@Failure	404				{object}	ErrorResponse
//	@Router		/notes/{noteId}/attachments/{attachmentId} [delete]
//	@Security	BearerAuth
func DeleteAttachment(c *gin.Context, userID uuid.UUID) (any, error) {
	noteID, err := uuid.Parse(c.Param("noteId"))
	if err != nil {
		return nil, errors.NewValidationError(fmt.Errorf("invalid note ID"))
	}

	attachmentID, err := uuid.Parse(c.Param("attachmentId"))
	if err != nil {
		return nil, errors.NewValidationError(fmt.Errorf("invalid attachment ID"))
	}

	var attachment models.Attachment
	err = db.DB.
		Joins("JOIN notes ON notes.id = attachments.note_id").
		Where(
			"notes.id = ? AND attachments.id = ? AND notes.user_id = ?",
			noteID,
			attachmentID,
			userID,
		).
		First(&attachment).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewNotFoundError("Attachment not found", err)
		}
		return nil, errors.NewServerError(err)
	}

	// delete from S3
	if err := awsx.DeleteAttachment(attachment.Key()); err != nil {
		return nil, errors.NewServerError(fmt.Errorf("failed to delete attachment from S3: %w", err))
	}

	// delete from DB
	if err := db.DB.Delete(&attachment).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NoContent, nil
}

// ShareNoteToUser shares a note with another user.
//
//	@Summary		Share note with user
//	@Description	Allows the authenticated user to share a note they own with another user, specifying read or write permissions.
//	@Tags			notes
//	@ID				shareNoteToUser
//	@Accept			json
//	@Produce		json
//	@Param			noteId	path		string						true	"Note ID (UUID)"
//	@Param			request	body		ShareToUserRequest	true	"Sharing request"
//	@Success		204		        	"No Content"
//	@Failure		400		{object}	ErrorResponse	"Bad request (invalid UUID, payload, or permission)"
//	@Failure		404		{object}	ErrorResponse	"Note not found or not owned by user"
//	@Failure		500		{object}	ErrorResponse	"Internal server error"
//	@Security		BearerAuth
//	@Router			/notes/{noteId}/share [post]
func ShareNoteToUser(c *gin.Context, userID uuid.UUID) (any, error) {
	noteID, err := uuid.Parse(c.Param("noteId"))
	if err != nil {
		return nil, errors.NewValidationError(fmt.Errorf("invalid note ID: %w", err))
	}

	var req models.ShareToUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		return nil, errors.NewValidationError(err)
	}

	var note models.Note
	if err := db.DB.First(&note, "id = ? AND user_id = ?", noteID, userID).Error; err != nil {
		return nil, errors.NewNotFoundError("Note not found", err)
	}

	permission, err := models.NewPermission(req.Permission)

	if err != nil {
		return nil, errors.NewValidationError(err)
	}

	share := models.NewNoteShare(note.ID, req.SharedWith, permission)
	onConflict := clause.OnConflict{UpdateAll: true}
	if err := db.DB.Clauses(onConflict).Create(&share).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NoContent, nil
}
