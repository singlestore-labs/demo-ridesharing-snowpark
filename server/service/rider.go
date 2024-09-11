package service

import (
	"server/database"
	"server/model"
)

func GetAllRiders(db string) []model.Rider {
	var riders = make([]model.Rider, 0)
	if db == "snowflake" {
		database.SetupSnowflakeQuery()
		rows, err := database.SnowflakeDB.Query("SELECT * FROM riders")
		if err != nil {
			return nil
		}
		defer rows.Close()
		for rows.Next() {
			var rider model.Rider
			err := rows.Scan(
				&rider.ID,
				&rider.FirstName,
				&rider.LastName,
				&rider.Email,
				&rider.PhoneNumber,
				&rider.DateOfBirth,
				&rider.CreatedAt,
				&rider.LocationCity,
				&rider.LocationLat,
				&rider.LocationLong,
				&rider.Status,
			)
			if err != nil {
				continue
			}
			riders = append(riders, rider)
		}
		if err = rows.Err(); err != nil {
			return nil
		}
	} else {
		database.SingleStoreDB.Find(&riders)
	}
	return riders
}

func GetRidersByCity(db string, city string) []model.Rider {
	var riders = make([]model.Rider, 0)
	if db == "snowflake" {
		database.SetupSnowflakeQuery()
		query := "SELECT * FROM riders WHERE location_city = ?"
		rows, err := database.SnowflakeDB.Query(query, city)
		if err != nil {
			return nil
		}
		defer rows.Close()
		for rows.Next() {
			var rider model.Rider
			err := rows.Scan(
				&rider.ID,
				&rider.FirstName,
				&rider.LastName,
				&rider.Email,
				&rider.PhoneNumber,
				&rider.DateOfBirth,
				&rider.CreatedAt,
				&rider.LocationCity,
				&rider.LocationLat,
				&rider.LocationLong,
				&rider.Status,
			)
			if err != nil {
				continue
			}
			riders = append(riders, rider)
		}
		if err = rows.Err(); err != nil {
			return nil
		}
	} else {
		database.SingleStoreDB.Where("location_city = ?", city).Find(&riders)
	}
	return riders
}
