package config

import "time"

var Dev = Config{
	AppName: "Bilingo (Dev)",
	AppUrl:  "http://localhost:5173",
	DBUrl:   "sqlite://bilingo.db",
	Auth: AuthConfig{
		CookieName: "auth_token",
		Duration:   7 * 24 * time.Hour, // 7 days
		Secret:     "bilingo-secret-key-change-in-production",
	},
}
