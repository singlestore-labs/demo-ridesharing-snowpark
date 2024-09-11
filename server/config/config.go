package config

import "os"

var Port = os.Getenv("PORT")

var SingleStore = struct {
	Host     string
	Port     string
	Username string
	Password string
	Database string
}{
	Host:     os.Getenv("SINGLESTORE_HOST"),
	Port:     os.Getenv("SINGLESTORE_PORT"),
	Username: os.Getenv("SINGLESTORE_USERNAME"),
	Password: os.Getenv("SINGLESTORE_PASSWORD"),
	Database: os.Getenv("SINGLESTORE_DATABASE"),
}

var Snowflake = struct {
	Account   string
	User      string
	Password  string
	Warehouse string
	Database  string
	Schema    string
}{
	os.Getenv("SNOWFLAKE_ACCOUNT"),
	os.Getenv("SNOWFLAKE_USER"),
	os.Getenv("SNOWFLAKE_PASSWORD"),
	os.Getenv("SNOWFLAKE_WAREHOUSE"),
	os.Getenv("SNOWFLAKE_DATABASE"),
	os.Getenv("SNOWFLAKE_SCHEMA"),
}

func Verify() {
	if Port == "" {
		Port = "8000"
	}
}
