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
	// Connect to Snowflake
	SnowflakeDB, err = sql.Open("snowflake", dsn)
	if err != nil {
		log.Printf("Failed to connect to Snowflake: %v", err)
	}
	// Test the connection
	err = SnowflakeDB.Ping()
	if err != nil {
		log.Printf("Failed to ping Snowflake: %v", err)
	}
	// Set the session timezone to UTC
	_, err = SnowflakeDB.Exec("ALTER SESSION SET TIMEZONE = 'UTC'")
	if err != nil {
		log.Printf("Failed to set session timezone: %v", err)
	}
	log.Println("Successfully connected to Snowflake")
}

func SetupSnowflakeQuery() {
	_, _ = SnowflakeDB.Exec("ALTER SESSION SET TIMEZONE = 'UTC'")
}
