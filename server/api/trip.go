package api

import (
	"server/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetCities(c *gin.Context) {
	db := c.Query("db")
	c.JSON(200, service.GetCities(db))
}

func GetCurrentTripStatus(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	if city != "" {
		c.JSON(200, service.GetCurrentTripStatusByCity(db, city))
		return
	}
	c.JSON(200, service.GetCurrentTripStatus(db))
}

func GetTotalTripStatistics(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	c.JSON(200, service.GetTotalTripStatistics(db, city))
}

func GetDailyTripStatistics(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	c.JSON(200, service.GetDailyTripStatistics(db, city))
}

func GetSecondTripCountsLastHour(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	interval := c.Query("interval")
	if interval == "" {
		interval = "1"
	}
	intervalInt, err := strconv.Atoi(interval)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid interval"})
		return
	}
	c.JSON(200, service.GetSecondTripCountsLastHour(db, city, intervalInt))
}

func GetMinuteTripCountsLastHour(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	c.JSON(200, service.GetMinuteTripCountsLastHour(db, city))
}

func GetHourlyTripCountsLastDay(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	c.JSON(200, service.GetHourlyTripCountsLastDay(db, city))
}

func GetDailyTripCountsLastWeek(c *gin.Context) {
	db := c.Query("db")
	city := c.Query("city")
	c.JSON(200, service.GetDailyTripCountsLastWeek(db, city))
}
