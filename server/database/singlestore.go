package database

import (
	"fmt"
	"log"
	"server/config"

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

	db, err := gorm.Open(singlestore.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("failed to connect to singlestore database: %v", err)
	}
	SingleStoreDB = db
	log.Println("Successfully connected to SingleStore")
}
