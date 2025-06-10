package jwtx

import (
	"github.com/golang-jwt/jwt/v5"
	"time"
)

var secret string
var authTokenLifespan int
var refreshTokenLifespan int

func Init(s string, authTokenDuration int, refreshTokenDuration int) {
	secret = s
	authTokenLifespan = authTokenDuration
	refreshTokenLifespan = refreshTokenDuration
}

func Generate(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Duration(authTokenLifespan) * time.Minute).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func Parse(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte(secret), nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, err
	}
}

func GenerateRefresh(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID,
		"exp":  time.Now().Add(time.Duration(refreshTokenLifespan) * time.Minute).Unix(), // 7 days
		"type": "refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
