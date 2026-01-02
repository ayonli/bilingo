package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type AuthConfig struct {
	CookieName string        // The name of the authentication cookie
	Duration   time.Duration // The duration for which the authentication is valid
	Secret     string        // The secret key used for authentication
}

type Config struct {
	AppName string // The name of the application
	AppUrl  string // The base URL of the application
	DBUrl   string // The database connection URL
	Auth    AuthConfig
}

func init() {
	_ = godotenv.Load()
}

func GetConfig() Config {
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = "dev"
	}

	cfg := func() Config {
		switch appEnv {
		case "prod", "production":
			return Prod
		case "test":
			return Test
		default:
			return Dev
		}
	}()

	// Set default values
	if cfg.AppName == "" {
		cfg.AppName = "Bilingo"
	}
	if cfg.Auth.CookieName == "" {
		cfg.Auth.CookieName = "auth_token"
	}
	if cfg.Auth.Duration == 0 {
		cfg.Auth.Duration = 7 * 24 * time.Hour // 7 days
	}
	if cfg.Auth.Secret == "" {
		cfg.Auth.Secret = "bilingo-secret-key-change-in-production"
	}

	return cfg
}
