package service

import (
	"server/database"
	"strings"
)

type PricingRecommendation struct {
	Multiplier           float64 `json:"multiplier"`
	LastMinuteRequests   int     `json:"last_minute_requests"`
	AvgRequestsPerMinute float64 `json:"avg_requests_per_minute"`
}

func GetPricingRecommendation(city string) (PricingRecommendation, error) {
	lastMinuteRequests, err := getLastMinuteRequests(city)
	if err != nil {
		return PricingRecommendation{}, err
	}

	avgRequestsPerMinute, err := getAvgRequestsPerMinute(city)
	if err != nil {
		return PricingRecommendation{}, err
	}

	multiplier := calculateMultiplier(lastMinuteRequests, avgRequestsPerMinute)

	return PricingRecommendation{
		Multiplier:           multiplier,
		LastMinuteRequests:   lastMinuteRequests,
		AvgRequestsPerMinute: avgRequestsPerMinute,
	}, nil
}

func getLastMinuteRequests(city string) (int, error) {
	var query string
	var args []interface{}

	query = `
		SELECT COUNT(*)
		FROM trips
		WHERE request_time >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
		{{ city_filter }}
	`
	// Replace placeholders based on whether city is provided
	if city != "" {
		query = strings.ReplaceAll(query, "{{ city_filter }}", "AND city = ?")
		args = append(args, city)
	} else {
		query = strings.ReplaceAll(query, "{{ city_filter }}", "")
	}

	var count int
	err := database.SingleStoreDB.Raw(query, args...).Scan(&count).Error
	if err != nil {
		return 0, err
	}
	return count, nil
}

func getAvgRequestsPerMinute(city string) (float64, error) {
	var query string
	var args []interface{}

	database.SetupSnowflakeQuery()
	query = `
		WITH minute_requests AS (
			SELECT DATE_TRUNC('minute', request_time) as minute,
				   COUNT(*) as requests_per_minute
			FROM trips
			WHERE request_time >= DATEADD(day, -7, CURRENT_TIMESTAMP())
			{{ city_filter }}
			GROUP BY 1
		)
		SELECT AVG(requests_per_minute)
		FROM minute_requests;
	`
	// Replace placeholders based on whether city is provided
	if city != "" {
		query = strings.ReplaceAll(query, "{{ city_filter }}", "AND city = ?")
		args = append(args, city)
	} else {
		query = strings.ReplaceAll(query, "{{ city_filter }}", "")
	}

	var avg float64
	err := database.SnowflakeDB.QueryRow(query, args...).Scan(&avg)
	if err != nil {
		return 0, err
	}
	return avg, nil
}

func calculateMultiplier(lastMinuteRequests int, avgRequestsPerMinute float64) float64 {
	ratio := float64(lastMinuteRequests) / avgRequestsPerMinute
	if ratio <= 1.15 {
		return 1.0
	} else if ratio <= 1.5 {
		return 1.2
	} else if ratio <= 2.25 {
		return 1.5
	} else {
		return 2.0
	}
}
