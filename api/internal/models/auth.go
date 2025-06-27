package models

import (
	"github.com/google/uuid"
	"time"
)

type PublicUserOut struct {
	ID        uuid.UUID `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" binding:"required"`
	Username  string    `json:"username" example:"jane_doe" binding:"required"`
	AvatarUrl string    `json:"avatar_url" example:"https://vault.awry.me/avatars/123e4567-e89b-12d3-a456-426614174000"`
} // @name PublicUserOut

type UserOut struct {
	ID                uuid.UUID `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" binding:"required"`
	Email             string    `json:"email" example:"jane@mail.com"`
	Username          string    `json:"username" example:"jane_doe" binding:"required"`
	AvatarUrl         string    `json:"avatar_url" example:"https://vault.awry.me/avatars/123e4567-e89b-12d3-a456-426614174000"`
	NotesCount        int       `json:"notes_count" example:"42"`
	DeletedNotesCount int       `json:"deleted_notes_count" example:"5"`
	AttachmentsCount  int       `json:"attachments_count" example:"10"`
	CreatedAt         time.Time `json:"created_at" example:"2023-01-01T12:00:00Z"`
} // @name UserOut

type Session struct {
	Token   string `json:"token" binding:"required"`
	Refresh string `json:"refresh" binding:"required"`
} // @name Session

type Login struct {
	Email    string `json:"email" binding:"required,email" example:"jane@mail.com"`
	Password string `json:"password" binding:"required"`
} // @name Login

type LoginOut struct {
	Session Session `json:"session" binding:"required"`
	User    UserOut `json:"user" binding:"required"`
} // @name LoginOut

func NewSession(token string, refresh string) Session {
	return Session{
		Token:   token,
		Refresh: refresh,
	}
}

func NewUserOut(user User) UserOut {
	return UserOut{
		ID:                user.ID,
		Email:             user.Email,
		Username:          user.Username,
		AvatarUrl:         user.AvatarUrl,
		NotesCount:        user.NotesCount,
		DeletedNotesCount: user.DeletedNotesCount,
		AttachmentsCount:  user.AttachmentsCount,
		CreatedAt:         user.CreatedAt,
	}
}

func NewPublicUserOut(out User) PublicUserOut {
	return PublicUserOut{
		ID:        out.ID,
		Username:  out.Username,
		AvatarUrl: out.AvatarUrl,
	}

}

func NewLoginOut(token string, refresh string, user User) LoginOut {
	return LoginOut{
		Session: NewSession(token, refresh),
		User:    NewUserOut(user),
	}
}
