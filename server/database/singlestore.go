package database

import (
	"fmt"
	"log"
	"server/config"
	"time"

	singlestore "github.com/singlestore-labs/gorm-singlestore"
	"gorm.io/gorm"
)

var SingleStoreDB *gorm.DB

func connectSingleStore() {
	if config.SingleStore.Host == "" || config.SingleStore.Port == "" || config.SingleStore.Username == "" || config.SingleStore.Password == "" || config.SingleStore.Database == "" {
		log.Println("SingleStore configuration is not set")
		return
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=UTC", config.SingleStore.Username, config.SingleStore.Password, config.SingleStore.Host, config.SingleStore.Port, config.SingleStore.Database)

	maxRetries := 5
	for attempt := 1; attempt <= maxRetries; attempt++ {
		db, err := gorm.Open(singlestore.Open(dsn), &gorm.Config{})
		if err == nil {
			SingleStoreDB = db
			log.Println("Successfully connected to SingleStore")
			return
		}
		log.Printf("Attempt %d: failed to connect to singlestore database: %v", attempt, err)
		if attempt < maxRetries {
			time.Sleep(time.Second * 5)
		}
	}
	log.Printf("Failed to connect to SingleStore after %d attempts", maxRetries)
}
