package api

import (
	"server/service"

	"github.com/gin-gonic/gin"
)

func GetPricingRecommendation(c *gin.Context) {
	city := c.Query("city")
	pricingRecommendation, err := service.GetPricingRecommendation(city)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, pricingRecommendation)
}
