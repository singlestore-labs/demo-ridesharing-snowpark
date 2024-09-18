package database

import "time"

func Initialize() {
	connectSingleStore()
	connectSnowflake()
	go KeepAlive()
}

func KeepAlive() {
	for {
		SingleStoreDB.Exec("SELECT 1")
		SnowflakeDB.Exec("SELECT 1")
		time.Sleep(time.Hour * 1)
	}
}
