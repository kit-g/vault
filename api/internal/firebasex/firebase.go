package firebasex

import (
	"context"
	"firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"fmt"
	"google.golang.org/api/option"
	"log"
)

var firebaseApp *firebase.App
var AuthClient *auth.Client

// Init initializes the Firebase app and auth client.
// It expects the JSON content of the account credentials file.
func Init(credentialsFile string) error {
	var err error
	opt := option.WithCredentialsJSON([]byte(credentialsFile))

	firebaseApp, err = firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return fmt.Errorf("error initializing Firebase app: %w", err)
	}

	AuthClient, err = firebaseApp.Auth(context.Background())
	if err != nil {
		return fmt.Errorf("error getting Firebase Auth client: %w", err)
	}

	log.Println("Firebase Admin SDK initialized successfully")
	return nil
}

// VerifyIDToken takes a Firebase ID token (as a string) and verifies it.
// If the token is valid, it returns the decoded token. Otherwise, it returns an error.
func VerifyIDToken(idToken string) (*auth.Token, error) {
	token, err := AuthClient.VerifyIDToken(context.Background(), idToken)
	if err != nil {
		return nil, fmt.Errorf("error verifying Firebase ID token: %w", err)
	}
	return token, nil
}
