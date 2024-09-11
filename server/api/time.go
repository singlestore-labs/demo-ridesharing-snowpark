package api

import (
	"server/service"

	"github.com/gin-gonic/gin"
)

func GetMinuteAvgWaitTimeLastHour(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	c.JSON(200, service.GetMinuteAvgWaitTimeLastHour(db, city))
}

func GetHourlyAvgWaitTimeLastDay(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	c.JSON(200, service.GetHourlyAvgWaitTimeLastDay(db, city))
}

func GetDailyAvgWaitTimeLastWeek(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	c.JSON(200, service.GetDailyAvgWaitTimeLastWeek(db, city))
}
