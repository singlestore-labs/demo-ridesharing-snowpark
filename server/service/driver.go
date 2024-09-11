package service

import (
	"server/database"
	"server/model"
)

func GetAllDrivers(db string) []model.Driver {
	var drivers = make([]model.Driver, 0)
	if db == "snowflake" {
		database.SetupSnowflakeQuery()
		rows, err := database.SnowflakeDB.Query("SELECT * FROM drivers")
		if err != nil {
			return nil
		}
		defer rows.Close()
		for rows.Next() {
			var driver model.Driver
			err := rows.Scan(
				&driver.ID,
				&driver.FirstName,
				&driver.LastName,
				&driver.Email,
				&driver.PhoneNumber,
				&driver.DateOfBirth,
				&driver.CreatedAt,
				&driver.LocationCity,
				&driver.LocationLat,
				&driver.LocationLong,
				&driver.Status,
			)
			if err != nil {
				continue
			}
			drivers = append(drivers, driver)
		}
		if err = rows.Err(); err != nil {
			return nil
		}
	} else {
		database.SingleStoreDB.Find(&drivers)
		return drivers
	}
	return drivers
}

func GetDriversByCity(db string, city string) []model.Driver {
	var drivers = make([]model.Driver, 0)
	if db == "snowflake" {
		database.SetupSnowflakeQuery()
		query := "SELECT * FROM drivers WHERE location_city = ?"
		rows, err := database.SnowflakeDB.Query(query, city)
		if err != nil {
			return nil
		}
		defer rows.Close()
		for rows.Next() {
			var driver model.Driver
			err := rows.Scan(
				&driver.ID,
				&driver.FirstName,
				&driver.LastName,
				&driver.Email,
				&driver.PhoneNumber,
				&driver.DateOfBirth,
				&driver.CreatedAt,
				&driver.LocationCity,
				&driver.LocationLat,
				&driver.LocationLong,
				&driver.Status,
			)
			if err != nil {
				continue
			}
			drivers = append(drivers, driver)
		}
		if err = rows.Err(); err != nil {
			return nil
		}
	} else {
		database.SingleStoreDB.Where("location_city = ?", city).Find(&drivers)
	}
	return drivers
}
