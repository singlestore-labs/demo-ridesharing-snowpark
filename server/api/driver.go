package api

import (
	"server/service"

	"github.com/gin-gonic/gin"
)

func GetDrivers(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	if city != "" {
		c.JSON(200, service.GetDriversByCity(db, city))
	} else {
		c.JSON(200, service.GetAllDrivers(db))
	}
}
