package jwtx

import (
	"testing"
	"time"
)

func TestJWTGenerateAndParse(t *testing.T) {
	// Initialize with test values
	testSecret := "test-secret-key"
	testAuthLifespan := 60      // 60 minutes
	testRefreshLifespan := 1440 // 24 hours

	Init(testSecret, testAuthLifespan, testRefreshLifespan)

	// Test user ID
	var userID uint = 123

	// Generate a token
	token, err := Generate(userID)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Parse the token
	claims, err := Parse(token)
	if err != nil {
		t.Fatalf("Failed to parse token: %v", err)
	}

	// Verify the claims
	if claims["sub"] != float64(userID) {
		t.Errorf("Expected user ID %v, got %v", userID, claims["sub"])
	}

	// Verify expiration time is in the future
	expTime := time.Unix(int64(claims["exp"].(float64)), 0)
	if expTime.Before(time.Now()) {
		t.Errorf("Token expiration time is in the past")
	}

	// Verify issued at time
	iatTime := time.Unix(int64(claims["iat"].(float64)), 0)
	if iatTime.After(time.Now()) {
		t.Errorf("Token issued at time is in the future")
	}
}

func TestRefreshToken(t *testing.T) {
	// Initialize with test values if not already done
	testSecret := "test-secret-key"
	testAuthLifespan := 60
	testRefreshLifespan := 1440

	Init(testSecret, testAuthLifespan, testRefreshLifespan)

	// Test user ID
	var userID uint = 123

	// Generate a refresh token
	token, err := GenerateRefresh(userID)
	if err != nil {
		t.Fatalf("Failed to generate refresh token: %v", err)
	}

	// Parse the token
	claims, err := Parse(token)
	if err != nil {
		t.Fatalf("Failed to parse refresh token: %v", err)
	}

	// Verify the claims
	if claims["sub"] != float64(userID) {
		t.Errorf("Expected user ID %v, got %v", userID, claims["sub"])
	}

	if claims["type"] != "refresh" {
		t.Errorf("Expected token type 'refresh', got %v", claims["type"])
	}

	// Verify expiration time is in the future
	expTime := time.Unix(int64(claims["exp"].(float64)), 0)
	if expTime.Before(time.Now()) {
		t.Errorf("Refresh token expiration time is in the past")
	}
}
