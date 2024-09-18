package exporter

import (
	"context"
	"crypto/tls"
	"log"
	"net"
	"simulator/config"
	"simulator/model"
	"time"

	"github.com/goccy/go-json"
	"github.com/twmb/franz-go/pkg/kerr"
	"github.com/twmb/franz-go/pkg/kgo"
	"github.com/twmb/franz-go/pkg/kmsg"
	"github.com/twmb/franz-go/pkg/sasl/plain"
	"github.com/twmb/franz-go/pkg/sr"
)

var KafkaClient *kgo.Client
var SchemaRegistryClient *sr.Client

var Serde sr.Serde

func InitializeKafkaClient() {
	if config.Kafka.Broker == "" {
		return
	}
	seeds := []string{config.Kafka.Broker}

	if config.Kafka.SASLUsername != "" && config.Kafka.SASLPassword != "" {
		tlsDialer := &tls.Dialer{NetDialer: &net.Dialer{Timeout: 10 * time.Second}}
		opts := []kgo.Opt{
			kgo.SeedBrokers(seeds...),
			kgo.ConsumerGroup("simulator"),
			kgo.SASL(plain.Auth{
				User: config.Kafka.SASLUsername,
				Pass: config.Kafka.SASLPassword,
			}.AsMechanism()),
			kgo.Dialer(tlsDialer.DialContext),
		}
		cl, err := kgo.NewClient(opts...)
		if err != nil {
			log.Fatalf("unable to create kafka client: %v", err)
		}
		KafkaClient = cl
	} else {
		cl, err := kgo.NewClient(
			kgo.SeedBrokers(seeds...),
			kgo.ConsumerGroup("simulator"),
		)
		if err != nil {
			log.Fatalf("unable to create kafka client: %v", err)
		}
		KafkaClient = cl
	}
	log.Printf("kafka client connected successfully!\n")

	for _, topic := range []string{"ridesharing-sim-trips", "ridesharing-sim-riders", "ridesharing-sim-drivers"} {
		CreateTopic(topic)
	}
}

func CreateTopic(topic string) {
	req := kmsg.NewPtrCreateTopicsRequest()
	t := kmsg.NewCreateTopicsRequestTopic()
	t.Topic = topic
	t.NumPartitions = 1
	t.ReplicationFactor = 3
	req.Topics = append(req.Topics, t)

	res, err := req.RequestWith(context.Background(), KafkaClient)
	if err != nil {
		log.Fatalf("unable to create kafka topic: %v", err)
	}

	if err := kerr.ErrorForCode(res.Topics[0].ErrorCode); err != nil && err != kerr.TopicAlreadyExists {
		log.Fatalf("kafka topic creation failure: %v", err)
		return
	}
	log.Printf("kafka topic %s created successfully!\n", t.Topic)
}

func KafkaProduceTrip(trip model.Trip) {
	trip.ToUTC()
	jsonTrip, err := json.Marshal(trip)
	if err != nil {
		log.Fatalf("unable to marshal trip: %v", err)
	}
	KafkaClient.Produce(
		context.Background(),
		&kgo.Record{
			Key:   []byte(trip.ID),
			Topic: "ridesharing-sim-trips",
			Value: jsonTrip,
		},
		func(r *kgo.Record, err error) {
			if err != nil {
				log.Printf("unable to produce: %v", err)
			}
		},
	)
}

func KafkaProduceDriver(driver model.Driver) {
	driver.CreatedAt = time.Now()
	driver.ToUTC()
	jsonDriver, err := json.Marshal(driver)
	if err != nil {
		log.Fatalf("unable to marshal driver: %v", err)
	}

	KafkaClient.Produce(
		context.Background(),
		&kgo.Record{
			Key:   []byte(driver.ID),
			Topic: "ridesharing-sim-drivers",
			Value: jsonDriver,
		},
		func(r *kgo.Record, err error) {
			if err != nil {
				log.Printf("Unable to produce driver: %v", err)
			}
		},
	)
}

func KafkaProduceRider(rider model.Rider) {
	rider.CreatedAt = time.Now()
	rider.ToUTC()
	jsonRider, err := json.Marshal(rider)
	if err != nil {
		log.Fatalf("unable to marshal rider: %v", err)
	}

	KafkaClient.Produce(
		context.Background(),
		&kgo.Record{
			Key:   []byte(rider.ID),
			Topic: "ridesharing-sim-riders",
			Value: jsonRider,
		},
		func(r *kgo.Record, err error) {
			if err != nil {
				log.Printf("Unable to produce rider: %v", err)
			}
		},
	)
}
