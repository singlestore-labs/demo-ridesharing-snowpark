package database

import (
	"log"
	"time"
)

func Initialize() {
	connectSingleStore()
	connectSnowflake()
	go KeepAlive()
}

func KeepAlive() {
	for {
		log.Println("Cleaning up tables...")
		SingleStoreDB.Exec("DELETE FROM trips WHERE status != 'completed'")
		SingleStoreDB.Exec("DELETE FROM trips WHERE request_time < DATE_SUB(NOW(), INTERVAL 2 DAY)")
		SingleStoreDB.Exec("DELETE FROM riders")
		SingleStoreDB.Exec("DELETE FROM drivers")
		SnowflakeDB.Exec("DELETE FROM trips WHERE status != 'completed'")
		SnowflakeDB.Exec("DELETE FROM riders")
		SnowflakeDB.Exec("DELETE FROM drivers")
		time.Sleep(time.Hour * 1)
	}
}
