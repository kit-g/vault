package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type Model struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	CreatedAt time.Time `json:"created_at"`
}

type ModifiableModel struct {
	Model
	UpdatedAt time.Time `json:"updated_at"`
}

type SoftDeleteModel struct {
	ModifiableModel
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}
