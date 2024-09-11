package api

import (
	"server/service"

	"github.com/gin-gonic/gin"
)

func GetRiders(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	if city != "" {
		c.JSON(200, service.GetRidersByCity(db, city))
	} else {
		c.JSON(200, service.GetAllRiders(db))
	}
}
