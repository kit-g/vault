package models

import (
	"testing"
)

func TestNewSession(t *testing.T) {
	tests := []struct {
		name     string
		token    string
		refresh  string
		expected Session
	}{
		{
			name:    "Creates session with valid tokens",
			token:   "valid-token",
			refresh: "valid-refresh",
			expected: Session{
				Token:   "valid-token",
				Refresh: "valid-refresh",
			},
		},
		{
			name:    "Creates session with empty tokens",
			token:   "",
			refresh: "",
			expected: Session{
				Token:   "",
				Refresh: "",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewSession(tt.token, tt.refresh)
			if got != tt.expected {
				t.Errorf("NewSession() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestNewUserOut(t *testing.T) {
	tests := []struct {
		name string
		user User
		want UserOut
	}{
		{
			name: "Creates UserOut from valid User",
			user: User{
				Email:    "test@example.com",
				Username: "testuser",
				Password: "should-not-be-exposed",
			},
			want: UserOut{
				Email:    "test@example.com",
				Username: "testuser",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewUserOut(tt.user)
			if got.ID != tt.want.ID {
				t.Errorf("NewUserOut().ID = %v, want %v", got.ID, tt.want.ID)
			}
			if got.Email != tt.want.Email {
				t.Errorf("NewUserOut().Email = %v, want %v", got.Email, tt.want.Email)
			}
			if got.Username != tt.want.Username {
				t.Errorf("NewUserOut().Username = %v, want %v", got.Username, tt.want.Username)
			}
		})
	}
}

func TestNewLoginOut(t *testing.T) {
	tests := []struct {
		name    string
		token   string
		refresh string
		user    User
		want    LoginOut
	}{
		{
			name:    "Creates LoginOut with valid data",
			token:   "valid-token",
			refresh: "valid-refresh",
			user: User{
				Email:    "test@example.com",
				Username: "testuser",
				Password: "should-not-be-exposed",
			},
			want: LoginOut{
				Session: Session{
					Token:   "valid-token",
					Refresh: "valid-refresh",
				},
				User: UserOut{
					Email:    "test@example.com",
					Username: "testuser",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewLoginOut(tt.token, tt.refresh, tt.user)

			// Check Session
			if got.Session != tt.want.Session {
				t.Errorf("NewLoginOut().Session = %v, want %v", got.Session, tt.want.Session)
			}

			// Check User
			if got.User.ID != tt.want.User.ID {
				t.Errorf("NewLoginOut().User.ID = %v, want %v", got.User.ID, tt.want.User.ID)
			}
			if got.User.Email != tt.want.User.Email {
				t.Errorf("NewLoginOut().User.Email = %v, want %v", got.User.Email, tt.want.User.Email)
			}
			if got.User.Username != tt.want.User.Username {
				t.Errorf("NewLoginOut().User.Username = %v, want %v", got.User.Username, tt.want.User.Username)
			}
		})
	}
}
