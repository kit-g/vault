package config

import (
	"fmt"
	"os"
	"reflect"
	"strconv"
)

type DBConfig struct {
	DBHost     string `env:"DB_HOST" default:"localhost" required:"true"`
	DBPort     string `env:"DB_PORT" default:"5432" required:"true"`
	DBUser     string `env:"DB_USER" default:""`
	DBPassword string `env:"DB_PASSWORD" default:""`
	DBName     string `env:"DB_NAME" required:"true"`
	DBSSLMode  string `env:"DB_SSLMODE" default:"disable"   required:"true"`
	AppName    string `env:"APP_NAME" default:"vault-api"`
}

type AwsConfig struct {
	AwsRegion        string `env:"REGION" required:"true"`
	AttachmentBucket string `env:"ATTACHMENT_BUCKET" required:"true"`
}

type Config struct {
	DBConfig
	AwsConfig
	JWTSecret            string `env:"JWT_SECRET" required:"true"`
	AuthTokenLifespan    int    `env:"AUTH_TOKEN_LIFESPAN" default:"180" required:"true"`       // 3 hours
	RefreshTokenLifespan int    `env:"REFRESH_TOKEN_LIFESPAN" default:"100800" required:"true"` // 10 weeks
}

type IngestConfig struct {
	DBConfig
	AwsConfig
}

func ApiConfig() (*Config, error) {
	cfg := &Config{}
	if err := populate(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}

func fromEnv(v reflect.Value, t reflect.Type) error {
	for i := 0; i < v.NumField(); i++ {
		field := t.Field(i)
		fieldVal := v.Field(i)

		if field.Type.Kind() == reflect.Struct {
			if err := fromEnv(fieldVal, field.Type); err != nil {
				return err
			}
			continue
		}

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
			return fmt.Errorf("required env var %s not set", envKey)
		}

		switch field.Type.Kind() {
		case reflect.String:
			fieldVal.SetString(finalVal)
		case reflect.Int:
			intVal, err := strconv.Atoi(finalVal)
			if err != nil {
				return fmt.Errorf("invalid int for %s: %v", envKey, err)
			}
			fieldVal.SetInt(int64(intVal))
		default:
			return fmt.Errorf("unsupported config type: %s", field.Type.Kind())
		}
	}
	return nil
}

func NewIngestConfig() (*IngestConfig, error) {
	cfg := &IngestConfig{}
	if err := populate(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}

func populate(cfg any) error {
	v := reflect.ValueOf(cfg).Elem()
	t := v.Type()

	if err := fromEnv(v, t); err != nil {
		return err
	}
	return nil
}
