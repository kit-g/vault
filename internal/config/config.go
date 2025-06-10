package config

import (
	"fmt"
	"os"
	"reflect"
	"strconv"
)

type Config struct {
	DBHost               string `env:"DB_HOST" default:"localhost" required:"true"`
	DBPort               string `env:"DB_PORT" default:"5432" required:"true"`
	DBUser               string `env:"DB_USER" default:""`
	DBPassword           string `env:"DB_PASSWORD" default:""`
	DBName               string `env:"DB_NAME" required:"true"`
	DBSSLMode            string `env:"DB_SSLMODE" default:"disable"   required:"true"`
	JWTSecret            string `env:"JWT_SECRET" required:"true"`
	AuthTokenLifespan    int    `env:"AUTH_TOKEN_LIFESPAN" default:"180" required:"true"`       // 3 hours
	RefreshTokenLifespan int    `env:"REFRESH_TOKEN_LIFESPAN" default:"100800" required:"true"` // 10 weeks

	AppName string `env:"APP_NAME" default:"vault-api"`
}

func Load() (*Config, error) {
	cfg := &Config{}
	v := reflect.ValueOf(cfg).Elem()
	t := v.Type()

	for i := 0; i < v.NumField(); i++ {
		field := t.Field(i)
		envKey := field.Tag.Get("env")
		defaultVal := field.Tag.Get("default")
		required := field.Tag.Get("required") == "true"

		envVal, found := os.LookupEnv(envKey)

		var finalVal string
		if found {
			finalVal = envVal
		} else if defaultVal != "" {
			finalVal = defaultVal
		} else if required {
			return nil, fmt.Errorf("required env var %s not set", envKey)
		}

		switch field.Type.Kind() {
		case reflect.String:
			v.Field(i).SetString(finalVal)
		case reflect.Int:
			intVal, err := strconv.Atoi(finalVal)
			if err != nil {
				return nil, fmt.Errorf("invalid int for %s: %v", envKey, err)
			}
			v.Field(i).SetInt(int64(intVal))
		default:
			return nil, fmt.Errorf("unsupported config type: %s", field.Type.Kind())
		}
	}
	return cfg, nil
}
