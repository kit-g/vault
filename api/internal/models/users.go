package models

import (
	"fmt"
)

type User struct {
	ModifiableModel
	Username string `gorm:"uniqueIndex;not null"`
	Email    string `gorm:"uniqueIndex;not null"`
	Password string
}

func (u User) String() string {
	return fmt.Sprintf("%s, #%d", u.Username, u.ID)
}
