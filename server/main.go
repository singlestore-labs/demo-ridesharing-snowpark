package main

import (
	"server/api"
	"server/config"
	"server/database"
)

func main() {
	config.Verify()
	database.Initialize()

	r := api.SetupRouter()
	r.Run(":" + config.Port)
}
