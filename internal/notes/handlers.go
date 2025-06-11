package notes

import (
	"github.com/gin-gonic/gin"
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

	note := models.NewNote(input, userID)

	if err := db.DB.Create(&note).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewNoteOut(note), nil
}
