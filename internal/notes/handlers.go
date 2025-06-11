package notes

import (
	e "errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"strconv"
	"vault/internal/db"
	"vault/internal/errors"
	"vault/internal/models"
)

// CreateNote godoc
// @Summary      Create a new note
// @Description  Creates a note for the authenticated user
// @Tags         notes
// @Accept       json
// @Produce      json
// @Param        note  body      models.NoteIn  true  "Note object"
// @Success      201   {object}  models.NoteOut
// @Failure      400   {object}  models.ErrorResponse
// @Failure      401   {object}  models.ErrorResponse
// @Failure      500   {object}  models.ErrorResponse
// @Router       /notes [post]
// @Security     BearerAuth
func CreateNote(c *gin.Context) (any, error) {
	userIDParam, exists := c.Get("userID")
	if !exists {
		return nil, errors.NewUnauthorizedError("User ID not found", nil)
	}

	userID, ok := userIDParam.(uint)
	if !ok {
		return nil, errors.NewServerError(nil)
	}

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
// @Summary      List user notes
// @Description  Returns paginated notes for the authenticated user with optional filtering
// @Tags         notes
// @Accept       json
// @Produce      json
// @Param        page       query     int     false  "Page number"     default(1)
// @Param        limit      query     int     false  "Items per page"  default(10)
// @Param        archived   query     bool    false  "Filter by archived status"
// @Param        encrypted  query     bool    false  "Filter by encrypted status"
// @Success      200        {array}   models.NoteOut
// @Failure      401        {object}  models.ErrorResponse  "Unauthorized"
// @Failure      500        {object}  models.ErrorResponse  "Server error"
// @Router       /notes [get]
// @Security     BearerAuth
func GetNotes(c *gin.Context) (any, error) {
	userID, exists := c.Get("userID")
	if !exists {
		return nil, errors.NewUnauthorizedError("User ID not found", nil)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var (
		archived, archivedSet   = c.GetQuery("archived")
		encrypted, encryptedSet = c.GetQuery("encrypted")
	)

	query := db.DB.
		Model(&models.Note{}).
		Where("user_id = ?", userID).
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

	var notes []models.Note
	if err := query.Find(&notes).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	var out []models.NoteOut
	for _, n := range notes {
		out = append(out, models.NewNoteOut(&n))
	}

	return out, nil
}

// GetNote godoc
// @Summary      Get a single note
// @Description  Retrieves a specific note owned by the authenticated user
// @Tags         notes
// @Produce      json
// @Param        noteId  path      string  true  "Note UUID"
// @Success      200     {object}  models.NoteOut
// @Failure      400     {object}  models.ErrorResponse
// @Failure      401     {object}  models.ErrorResponse
// @Failure      404     {object}  models.ErrorResponse
// @Failure      500     {object}  models.ErrorResponse
// @Router       /notes/{noteId} [get]
// @Security     BearerAuth
func GetNote(c *gin.Context) (any, error) {
	userID, exists := c.Get("userID")
	if !exists {
		return nil, errors.NewUnauthorizedError("User ID not found", nil)
	}

	noteIDStr := c.Param("noteId")
	noteID, err := uuid.Parse(noteIDStr)

	if err != nil {
		return nil, errors.NewValidationError(err)
	}

	var note models.Note
	if err := db.DB.
		Where("user_id = ? AND id = ?", userID, noteID).
		First(&note).Error; err != nil {

		if e.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewNotFoundError("Note not found", err)
		}
		return nil, errors.NewServerError(err)
	}

	return models.NewNoteOut(&note), nil
}
