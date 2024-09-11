package database

import (
	"database/sql"
	"log"
	"server/config"

	sf "github.com/snowflakedb/gosnowflake"
)

var SnowflakeDB *sql.DB

func connectSnowflake() {
	if config.Snowflake.Account == "" || config.Snowflake.User == "" || config.Snowflake.Password == "" || config.Snowflake.Database == "" || config.Snowflake.Schema == "" || config.Snowflake.Warehouse == "" {
		log.Println("Snowflake configuration is not set")
		return
	}

	cfg := &sf.Config{
		Account:   config.Snowflake.Account,
		User:      config.Snowflake.User,
		Password:  config.Snowflake.Password,
		Database:  config.Snowflake.Database,
		Schema:    config.Snowflake.Schema,
		Warehouse: config.Snowflake.Warehouse,
	}
	dsn, err := sf.DSN(cfg)
	if err != nil {
		log.Printf("Failed to create DSN: %v", err)
	}
	const maxRetries = 5

	for attempt := 1; attempt <= maxRetries; attempt++ {
		// Connect to Snowflake
		SnowflakeDB, err = sql.Open("snowflake", dsn)
		if err == nil {
			// Test the connection
			err = SnowflakeDB.Ping()
			if err == nil {
				// Set the session timezone to UTC
				_, err = SnowflakeDB.Exec("ALTER SESSION SET TIMEZONE = 'UTC'")
				if err == nil {
					log.Printf("Successfully connected to Snowflake on attempt %d", attempt)
					return
				}
			}
		}

		log.Printf("Attempt %d failed: %v", attempt, err)
		if attempt < maxRetries {
			log.Println("Retrying...")
		}
	}

	log.Printf("Failed to connect to Snowflake after %d attempts", maxRetries)
}

func SetupSnowflakeQuery() {
	_, _ = SnowflakeDB.Exec("ALTER SESSION SET TIMEZONE = 'UTC'")
}
