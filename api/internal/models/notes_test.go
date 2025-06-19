package models

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"testing"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(&Note{}, &Attachment{}, &NoteShare{})
	require.NoError(t, err)

	return db
}

func TestNote_DB(t *testing.T) {
	db := setupTestDB(t)

	t.Run("Create and retrieve note", func(t *testing.T) {
		userID := uuid.New()
		note := Note{
			UserID:  userID,
			Title:   "Test Note",
			Content: "Test Content",
		}

		// Create
		result := db.Create(&note)
		assert.NoError(t, result.Error)

		// Retrieve
		var retrieved Note
		result = db.First(&retrieved, note.ID)
		assert.NoError(t, result.Error)
		assert.Equal(t, note.Title, retrieved.Title)
		assert.Equal(t, note.Content, retrieved.Content)
		assert.Equal(t, note.UserID, retrieved.UserID)
	})

	t.Run("Note with attachments", func(t *testing.T) {
		userID := uuid.New()
		note := Note{

			UserID:  userID,
			Title:   "Note with Attachment",
			Content: "Content with attachment",
		}

		attachment := Attachment{
			FileName: "test.pdf",
			MimeType: "application/pdf",
			Size:     1024,
		}

		// Create note with attachment
		note.Attachments = []Attachment{attachment}
		result := db.Create(&note)
		assert.NoError(t, result.Error)

		// Retrieve with attachments
		var retrieved Note
		result = db.Preload("Attachments").First(&retrieved, note.ID)
		assert.NoError(t, result.Error)
		assert.Len(t, retrieved.Attachments, 1)
		assert.Equal(t, attachment.FileName, retrieved.Attachments[0].FileName)
	})

	t.Run("Note sharing", func(t *testing.T) {
		noteID := uuid.New()
		sharedWithUserID := uuid.New()
		share := NoteShare{
			NoteID:           noteID,
			SharedWithUserID: sharedWithUserID,
			Permission:       ReadPermission,
		}

		// Create share
		result := db.Create(&share)
		assert.NoError(t, result.Error)

		// Retrieve share
		var retrieved NoteShare
		result = db.First(&retrieved, share.ID)
		assert.NoError(t, result.Error)
		assert.Equal(t, noteID, retrieved.NoteID)
		assert.Equal(t, sharedWithUserID, retrieved.SharedWithUserID)
		assert.Equal(t, ReadPermission, retrieved.Permission)
	})

	t.Run("Soft delete note", func(t *testing.T) {
		note := Note{
			UserID:  uuid.New(),
			Title:   "To be deleted",
			Content: "This note will be deleted",
		}

		// Create
		result := db.Create(&note)
		assert.NoError(t, result.Error)

		// Soft delete
		result = db.Delete(&note)
		assert.NoError(t, result.Error)

		// Try to retrieve
		var retrieved Note
		result = db.First(&retrieved, note.ID)
		assert.Error(t, result.Error) // Should not find the deleted note
		assert.Equal(t, gorm.ErrRecordNotFound, result.Error)

		// Retrieve with unscoped
		result = db.Unscoped().First(&retrieved, note.ID)
		assert.NoError(t, result.Error)
		assert.NotNil(t, retrieved.DeletedAt)
	})
}
