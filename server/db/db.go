package db

import (
	"fmt"
	"strings"
	"sync"

	"github.com/ayonli/bilingo/config"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type defaultDbType struct {
	Conn  *gorm.DB
	Error error
}

var (
	defaultDb defaultDbType
	once      sync.Once
)

func init() {
	// Load .env file if it exists (ignore errors if file doesn't exist)
	_ = godotenv.Load()
}

// ConnError wraps a database connection error with a standard message.
func ConnError(reason error) error {
	return fmt.Errorf("database connection error: %w", reason)
}

// CreateConn creates a database connection based on the provided database URL.
// Supported formats:
//   - SQLite: sqlite://path/to/database.db or file:path/to/database.db
//   - MySQL: mysql://user:password@tcp(host:port)/dbname?params
//   - PostgreSQL: postgresql://user:password@host:port/dbname?params or postgres://...
func CreateConn(dbURL string) (*gorm.DB, error) {
	if dbURL == "" {
		return nil, fmt.Errorf("database URL is empty")
	}

	var dialect gorm.Dialector

	switch {
	case strings.HasPrefix(dbURL, "sqlite://"):
		// SQLite: sqlite://path/to/database.db
		dbPath := strings.TrimPrefix(dbURL, "sqlite://")
		// Add _loc=auto to properly parse time values
		if !strings.Contains(dbPath, "?") {
			dbPath += "?_loc=auto"
		} else if !strings.Contains(dbPath, "_loc=") {
			dbPath += "&_loc=auto"
		}
		dialect = sqlite.Open(dbPath)

	case strings.HasPrefix(dbURL, "file:"):
		// SQLite: file:path/to/database.db
		dbPath := strings.TrimPrefix(dbURL, "file:")
		if !strings.Contains(dbPath, "?") {
			dbPath += "?_loc=auto"
		} else if !strings.Contains(dbPath, "_loc=") {
			dbPath += "&_loc=auto"
		}
		dialect = sqlite.Open(dbPath)

	case strings.HasPrefix(dbURL, "mysql://"):
		// MySQL: mysql://user:password@tcp(host:port)/dbname?params
		dsn := strings.TrimPrefix(dbURL, "mysql://")
		dialect = mysql.Open(dsn)

	case strings.HasPrefix(dbURL, "postgresql://"), strings.HasPrefix(dbURL, "postgres://"):
		// PostgreSQL: postgresql://user:password@host:port/dbname?params
		dialect = postgres.Open(dbURL)

	default:
		return nil, fmt.Errorf("unsupported database URL format: %s", dbURL)
	}

	db, err := gorm.Open(dialect, &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}

// Default returns the default database connection according to the configuration.
func Default() (*gorm.DB, error) {
	once.Do(func() {
		cfg := config.GetConfig()
		if cfg.DBUrl == "" {
			defaultDb.Error = fmt.Errorf("database URL is not set")
			return
		}

		db, err := CreateConn(cfg.DBUrl)
		if err != nil {
			defaultDb.Error = err
			return
		}
		defaultDb.Conn = db
	})

	if defaultDb.Error != nil {
		return nil, defaultDb.Error
	}
	return defaultDb.Conn, nil
}
