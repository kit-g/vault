package models

import "github.com/google/uuid"

type UserIn struct {
	Email    string `json:"email" binding:"required,email" example:"jane@mail.com"`
	Password string `json:"password" binding:"required,min=6" example:"password123"`
	Username string `json:"username" binding:"required,min=1" example:"jane_doe"`
}

type UserOut struct {
	ID       uuid.UUID `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Email    string    `json:"email" example:"jane@mail.com"`
	Username string    `json:"username" example:"jane_doe"`
}

type Session struct {
	Token   string `json:"token"`
	Refresh string `json:"refresh"`
}

type Login struct {
	Email    string `json:"email" binding:"required,email" example:"jane@mail.com"`
	Password string `json:"password" binding:"required"`
}

type LoginOut struct {
	Session Session `json:"session"`
	User    UserOut `json:"user"`
}

func NewSession(token string, refresh string) Session {
	return Session{
		Token:   token,
		Refresh: refresh,
	}
}

func NewUserOut(user User) UserOut {
	return UserOut{
		ID:       user.ID,
		Email:    user.Email,
		Username: user.Username,
	}
}

func NewLoginOut(token string, refresh string, user User) LoginOut {
	return LoginOut{
		Session: NewSession(token, refresh),
		User:    NewUserOut(user),
	}
}
