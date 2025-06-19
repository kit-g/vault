package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type Model struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;"`
	CreatedAt time.Time `json:"created_at"`
}

func (m *Model) BeforeCreate(_ *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

type ModifiableModel struct {
	Model
	UpdatedAt time.Time `json:"updated_at"`
}

type SoftDeleteModel struct {
	ModifiableModel
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}
