package models

import (
	"fmt"
)

type User struct {
	ModifiableModel
	Username          string `gorm:"uniqueIndex;not null"`
	Email             string `gorm:"uniqueIndex;not null"`
	Password          string
	NotesCount        int `gorm:"type:integer;default:0;not null"`
	DeletedNotesCount int `gorm:"type:integer;default:0;not null"`
}

func (u User) String() string {
	return fmt.Sprintf("%s, #%d", u.Username, u.ID)
}
