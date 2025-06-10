package models

import (
	"fmt"
	"gorm.io/gorm"
)

// Note represents a secure user note
type Note struct {
	gorm.Model
	UserID      uint         `json:"-"`
	Title       string       `json:"title" binding:"required"`
	Content     string       `json:"content" binding:"required"`
	Encrypted   bool         `json:"encrypted"`
	Archived    bool         `json:"archived"`
	Attachments []Attachment `json:"attachments" gorm:"foreignKey:NoteID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Shares      []NoteShare  `json:"shares" gorm:"foreignKey:NoteID"`
}

func (n Note) String() string {
	return fmt.Sprintf("Note #%d: %s", n.ID, n.Title)
}

// Attachment represents a file attached to a note
type Attachment struct {
	gorm.Model
	NoteID   uint   `json:"-"`
	FileName string `json:"file_name"`
	URL      string `json:"url"`
	Size     int64  `json:"size"`
	MIMEType string `json:"mime_type"`
}

// NoteShare represents a shared note and permission level
type NoteShare struct {
	gorm.Model
	NoteID           uint   `json:"-"`
	SharedWithUserID uint   `json:"shared_with"`
	Permission       string `json:"permission"` // "read", "write"
}
