package models

import (
	"fmt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;not null"`
	Email    string `gorm:"uniqueIndex;not null"`
	Password string
}

func (u User) String() string {
	return fmt.Sprintf("%s, #%d", u.Username, u.ID)
}
