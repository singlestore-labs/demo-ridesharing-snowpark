package model

import "time"

// Trip represents a single trip in the ridesharing simulation
type Trip struct {
	ID       string `avro:"id" json:"id"`
	DriverID string `avro:"driver_id" json:"driver_id"`
	RiderID  string `avro:"rider_id" json:"rider_id"`
	// Status can be "requested", "accepted", "en_route", "completed"
	Status      string    `avro:"status" json:"status"`
	RequestTime time.Time `avro:"request_time" json:"request_time"`
	AcceptTime  time.Time `avro:"accept_time" json:"accept_time"`
	PickupTime  time.Time `avro:"pickup_time" json:"pickup_time"`
	DropoffTime time.Time `avro:"dropoff_time" json:"dropoff_time"`
	Fare        int       `avro:"fare" json:"fare"`
	Distance    float64   `avro:"distance" json:"distance"`
	PickupLat   float64   `avro:"pickup_lat" json:"pickup_lat"`
	PickupLong  float64   `avro:"pickup_long" json:"pickup_long"`
	DropoffLat  float64   `avro:"dropoff_lat" json:"dropoff_lat"`
	DropoffLong float64   `avro:"dropoff_long" json:"dropoff_long"`
	City        string    `avro:"city" json:"city"`
}

func (t *Trip) ToUTC() {
	t.RequestTime = t.RequestTime.UTC()
	t.AcceptTime = t.AcceptTime.UTC()
	t.PickupTime = t.PickupTime.UTC()
	t.DropoffTime = t.DropoffTime.UTC()
}
