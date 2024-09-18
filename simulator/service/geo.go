package service

import (
	"fmt"
	"log"
	"math"
	"math/rand"
	"os"
	"path/filepath"
	"simulator/config"
	"strings"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/planar"
)

var polygons = map[string]orb.Polygon{}

func GenerateCoordinateInCity(city string) (float64, float64) {
	bounds := polygons[city].Bound()
	for {
		lat := bounds.Min.Lat() + rand.Float64()*(bounds.Max.Lat()-bounds.Min.Lat())
		lng := bounds.Min.Lon() + rand.Float64()*(bounds.Max.Lon()-bounds.Min.Lon())
		point := orb.Point{lng, lat}
		if planar.PolygonContains(polygons[city], point) {
			return lat, lng
		}
	}
}

func GetDistanceBetweenCoordinates(lat1, lng1, lat2, lng2 float64) float64 {
	const earthRadius = 6371000
	lat1Rad := lat1 * math.Pi / 180
	lng1Rad := lng1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	lng2Rad := lng2 * math.Pi / 180
	dlat := lat2Rad - lat1Rad
	dlng := lng2Rad - lng1Rad
	a := math.Sin(dlat/2)*math.Sin(dlat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(dlng/2)*math.Sin(dlng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	distance := earthRadius * c
	return distance
}

func GenerateMiddleCoordinates(startLat, startLng, endLat, endLng, intervalDistance float64) [][2]float64 {
	totalDistance := GetDistanceBetweenCoordinates(startLat, startLng, endLat, endLng)
	numPoints := int(math.Floor(totalDistance / intervalDistance))
	result := make([][2]float64, numPoints)

	for i := 0; i < numPoints; i++ {
		t := float64(i+1) * intervalDistance / totalDistance
		interpolatedLat := startLat + t*(endLat-startLat)
		interpolatedLng := startLng + t*(endLng-startLng)
		result[i] = [2]float64{interpolatedLat, interpolatedLng}
	}

	return result
}

func LoadGeoData() {
	for _, city := range config.ValidCities {
		polygon, err := loadPolygon(city)
		if err != nil {
			log.Fatalf("Failed to load polygon for city %s: %v", city, err)
		}
		polygons[city] = polygon
	}
	log.Println("Loaded polygons for cities:", config.ValidCities)
}

func loadPolygon(city string) (orb.Polygon, error) {
	fileName := strings.ReplaceAll(strings.ToLower(city), " ", "-") + ".geojson"
	data, err := os.ReadFile(filepath.Join("data", fileName))
	if err != nil {
		return nil, err
	}
	fc, err := geojson.UnmarshalFeatureCollection(data)
	if err != nil {
		return nil, err
	}
	if len(fc.Features) == 0 {
		return nil, fmt.Errorf("no features found in GeoJSON")
	}
	polygon, ok := fc.Features[0].Geometry.(orb.Polygon)
	if !ok {
		return nil, fmt.Errorf("first feature is not a polygon")
	}
	return polygon, nil
}
