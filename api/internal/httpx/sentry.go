package httpx

import (
	"fmt"
	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
)

// InitSentry initializes Sentry with the provided DSN and returns a middleware to enable Sentry for Gin routes.
func InitSentry(sentryDsn string) gin.HandlerFunc {
	options := sentry.ClientOptions{Dsn: sentryDsn}

	if err := sentry.Init(options); err != nil {
		fmt.Printf("Sentry initialization failed: %v\n", err)
	}

	return sentrygin.New(sentrygin.Options{Repanic: true})
}
