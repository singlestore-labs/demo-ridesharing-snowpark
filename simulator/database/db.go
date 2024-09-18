package database

import (
	"simulator/model"
	"sync"

	cmap "github.com/orcaman/concurrent-map/v2"
)

var Local *LocalStore

type LocalStore struct {
	Riders      cmap.ConcurrentMap[string, model.Rider]
	Drivers     cmap.ConcurrentMap[string, model.Driver]
	Trips       cmap.ConcurrentMap[string, model.Trip]
	AcceptMutex sync.Mutex
}

func InitializeLocal() {
	Local = &LocalStore{
		Riders:  cmap.New[model.Rider](),
		Drivers: cmap.New[model.Driver](),
		Trips:   cmap.New[model.Trip](),
	}
}
