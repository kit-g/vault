package models

import (
	"fmt"
	"github.com/google/uuid"
	"time"
)

// Note represents a secure user note
type Note struct {
	SoftDeleteModel
	UserID      uuid.UUID    `json:"-" gorm:"index;type:uuid;not null"`
	User        User         `json:"user" gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Title       string       `json:"title" binding:"required"`
	Content     string       `json:"content" binding:"required"`
	Encrypted   bool         `json:"encrypted"`
	Archived    bool         `json:"archived"`
	Attachments []Attachment `json:"attachments" gorm:"foreignKey:NoteID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Shares      []NoteShare  `json:"shares" gorm:"foreignKey:NoteID"`
}

func (n *Note) String() string {
	return fmt.Sprintf("Note #%d: %s", n.ID, n.Title)
}

// Attachment represents a file attached to a note
type Attachment struct {
	Model
	NoteID    uuid.UUID `json:"note_id"`
	FileName  string    `json:"file_name"`
	MimeType  string    `json:"mime_type"`
	Size      int64     `json:"size"`
	Shared    bool      `json:"shared"`
	CreatedAt time.Time `json:"created_at"`
}

func (a *Attachment) String() string {
	return fmt.Sprintf("Attachment #%s of type %s to note #%s", a.ID, a.MimeType, a.NoteID)
}

func AttachmentKey(noteId string, filename string) string {
	return fmt.Sprintf("attachments/%s/%s", noteId, filename)
}

func (a *Attachment) Key() string {
	return AttachmentKey(a.NoteID.String(), a.FileName)
}

func NewAttachment(noteId uuid.UUID, fileName string, mimeType string, size int64) Attachment {
	return Attachment{
		NoteID:    noteId,
		FileName:  fileName,
		MimeType:  mimeType,
		Size:      size,
		CreatedAt: time.Now(),
	}
}

type Permission string // @name Permission

const (
	ReadPermission  Permission = "read"
	WritePermission Permission = "write"
)

func NewPermission(v string) (Permission, error) {
	switch v {
	case "read":
		return ReadPermission, nil
	case "write":
		return WritePermission, nil
	default:
		return "", fmt.Errorf("invalid permission: %s", v)
	}
}

// NoteShare represents a shared note and permission level
type NoteShare struct {
	Model
	NoteID           uuid.UUID  `json:"-"`
	SharedWithUserID uuid.UUID  `json:"-" gorm:"index"`
	SharedWith       User       `json:"shared_with" gorm:"foreignKey:SharedWithUserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Permission       Permission `json:"permission"` // "read", "write"
	Expires          *time.Time `json:"expires,omitempty"`
}

type NoteIn struct {
	Title   string `json:"title" binding:"required" example:"Meeting Notes"`
	Content string `json:"content" binding:"required" example:"Notes from the meeting with the client."`
} // @name NoteIn

type AttachmentOut struct {
	ID       uuid.UUID `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" binding:"required"`
	Filename string    `json:"filename" example:"document.pdf"`
	MimeType string    `json:"mime_type" example:"application/pdf"`
	Size     int64     `json:"size" example:"123456"`
} // @name AttachmentOut

func NewAttachmentOut(a *Attachment) AttachmentOut {
	return AttachmentOut{
		ID:       a.ID,
		Filename: a.FileName,
		MimeType: a.MimeType,
		Size:     a.Size,
	}
}

type NoteOut struct {
	ID          uuid.UUID       `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" binding:"required"`
	Title       string          `json:"title" example:"Meeting Notes"`
	Content     string          `json:"content" example:"Notes from the meeting with the client."`
	Author      PublicUserOut   `json:"author"  binding:"required"`
	Encrypted   bool            `json:"encrypted"`
	Archived    bool            `json:"archived"`
	CreatedAt   time.Time       `json:"created_at" binding:"required"`
	UpdatedAt   time.Time       `json:"updated_at"`
	Attachments []AttachmentOut `json:"attachments"`
	Shares      []NoteShareOut  `json:"shares"`
} // @name NoteOut

func NewNote(n *NoteIn, userID uuid.UUID) Note {
	return Note{
		Title:   n.Title,
		Content: n.Content,
		UserID:  userID,
	}
}

func NewNoteOut(n *Note) NoteOut {
	attachments := make([]AttachmentOut, len(n.Attachments))
	for i, att := range n.Attachments {
		attachments[i] = NewAttachmentOut(&att)
	}
	shares := make([]NoteShareOut, len(n.Shares))
	for i, share := range n.Shares {
		shares[i] = NewNoteShareOut(&share)
	}

	return NoteOut{
		ID:          n.ID,
		Title:       n.Title,
		Content:     n.Content,
		Encrypted:   n.Encrypted,
		Archived:    n.Archived,
		CreatedAt:   n.CreatedAt,
		UpdatedAt:   n.UpdatedAt,
		Author:      NewPublicUserOut(n.User),
		Attachments: attachments,
		Shares:      shares,
	}
}

func NewNoteShare(noteId uuid.UUID, with User, permission Permission, expires *time.Time) NoteShare {
	return NoteShare{
		NoteID:           noteId,
		SharedWithUserID: with.ID,
		Permission:       permission,
		Expires:          expires,
	}
}

type NotesResponse struct {
	Notes []NoteOut `json:"notes" binding:"required"`
	Total int       `json:"total" example:"10" binding:"required"`
} // @name NotesResponse

type NoteWithCount struct {
	Note
	NotesCount int `gorm:"column:notes_count"`
}

func (NoteWithCount) TableName() string {
	return "notes"
}

type AttachmentRef struct {
	AttachmentOut `json:"attachment" binding:"required"`
	NoteOut       `json:"note" binding:"required"`
} // @name AttachmentRef

type AttachmentResponse struct {
	Attachments []AttachmentRef `json:"attachments" binding:"required"`
	Total       int             `json:"total" example:"10" binding:"required"`
} // @name AttachmentResponse

type NoteShareOut struct {
	ID         uuid.UUID      `json:"id" binding:"required"`
	Permission string         `json:"permission" binding:"required" example:"read"`
	Expires    *time.Time     `json:"expires,omitempty" example:"2024-12-31T23:59:59Z"`
	SharedWith *PublicUserOut `json:"with,omitempty"`
} // @name Share

func NewNoteShareOut(share *NoteShare) NoteShareOut {
	var userOut *PublicUserOut
	if share.SharedWith.ID != uuid.Nil {
		u := NewPublicUserOut(share.SharedWith)
		userOut = &u
	}

	return NoteShareOut{
		ID:         share.ID,
		Permission: string(share.Permission),
		Expires:    share.Expires,
		SharedWith: userOut,
	}
}

type NoteShareResponse struct {
	Shares []NoteShareOut `json:"shared"`
} // @name NoteShareResponse
