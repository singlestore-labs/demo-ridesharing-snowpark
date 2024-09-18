package model

import (
	"time"
)

// Driver represents a driver account in a ridesharing app
type Driver struct {
	ID           string    `json:"id"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	Email        string    `json:"email"`
	PhoneNumber  string    `json:"phone_number"`
	DateOfBirth  time.Time `json:"date_of_birth"`
	CreatedAt    time.Time `json:"created_at"`
	LocationCity string    `json:"location_city"`
	LocationLat  float64   `json:"location_lat"`
	LocationLong float64   `json:"location_long"`
	Status       string    `json:"status"`
}

func (d *Driver) ToUTC() {
	d.CreatedAt = d.CreatedAt.UTC()
	d.DateOfBirth = d.DateOfBirth.UTC()
}
