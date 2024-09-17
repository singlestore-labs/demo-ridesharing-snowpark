DROP DATABASE IF EXISTS rideshare_demo;
CREATE DATABASE rideshare_demo;
USE rideshare_demo;

-- Drop all existing pipelines if recreating tables.
DROP PIPELINE IF EXISTS rideshare_ice_trips;
DROP PIPELINE IF EXISTS rideshare_kafka_trips;
DROP PIPELINE IF EXISTS rideshare_kafka_riders;
DROP PIPELINE IF EXISTS rideshare_kafka_drivers;

-- Create the trips table.
DROP TABLE IF EXISTS trips;
CREATE TABLE trips (
    id VARCHAR(255) NOT NULL,
    driver_id VARCHAR(255),
    rider_id VARCHAR(255),
    status VARCHAR(20),
    request_time DATETIME(6),
    accept_time DATETIME(6),
    pickup_time DATETIME(6),
    dropoff_time DATETIME(6),
    fare INT NOT NULL,
    distance DOUBLE NOT NULL,
    pickup_lat DOUBLE NOT NULL,
    pickup_long DOUBLE NOT NULL,
    dropoff_lat DOUBLE NOT NULL,
    dropoff_long DOUBLE NOT NULL,
    city VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    SORT KEY (status, city)
);

-- Setup a pipeline to ingest trip data from an iceberg catalog. This assumes that the catalog is a Snowflake catalog stored on S3.
SET GLOBAL enable_iceberg_ingest = ON;
SET GLOBAL pipelines_extractor_get_offsets_timeout_ms = 90000;
CREATE OR REPLACE PIPELINE rideshare_ice_trips AS
LOAD DATA S3 ''
CONFIG '{"region" : "us-west-2",
        "catalog_type": "SNOWFLAKE",
        "table_id": "RIDESHARE_DEMO.public.trips_ice",
        "catalog.uri": "jdbc:snowflake://tpb44528.snowflakecomputing.com",
        "catalog.jdbc.user":"RIDESHARE_INGEST",
        "catalog.jdbc.password":"RIDESHARE_INGEST",
        "catalog.jdbc.role":"RIDESHARE_INGEST"}'
CREDENTIALS '{"aws_access_key_id" : "KEY_ID",
             "aws_secret_access_key": "SECRET_KEY"
}'
REPLACE INTO TABLE trips (
    id <- ID,
    driver_id <- DRIVER_ID,
    rider_id <- RIDER_ID,
    status <- STATUS,
    @request_time <- REQUEST_TIME,
    @accept_time <- ACCEPT_TIME,
    @pickup_time <- PICKUP_TIME,
    @dropoff_time <- DROPOFF_TIME,
    fare <- FARE,
    distance <- DISTANCE,
    pickup_lat <- PICKUP_LAT,
    pickup_long <- PICKUP_LONG,
    dropoff_lat <- DROPOFF_LAT,
    dropoff_long <- DROPOFF_LONG,
    city <- CITY
)
FORMAT ICEBERG
SET request_time = FROM_UNIXTIME(@request_time/1000000),
    accept_time = FROM_UNIXTIME(@accept_time/1000000),
    pickup_time = FROM_UNIXTIME(@pickup_time/1000000),
    dropoff_time = FROM_UNIXTIME(@dropoff_time/1000000);
START PIPELINE rideshare_ice_trips FOREGROUND;

SELECT COUNT(*) FROM trips;

-- Create a kafka pipeline to ingest trip data in real-time. Consumes the ridesharing-sim-trips topic and upserts into the trips table.
DROP PIPELINE IF EXISTS rideshare_kafka_trips;
CREATE OR REPLACE PIPELINE rideshare_kafka_trips AS
    LOAD DATA KAFKA 'pkc-rgm37.us-west-2.aws.confluent.cloud:9092/ridesharing-sim-trips'
    CONFIG '{"sasl.username": "username",
         "sasl.mechanism": "PLAIN",
         "security.protocol": "SASL_SSL",
         "ssl.ca.location": "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem"}'
    CREDENTIALS '{"sasl.password": "password"}'
    DISABLE OUT_OF_ORDER OPTIMIZATION
    REPLACE INTO TABLE trips
    FORMAT JSON
    (
        id <- id,
        rider_id <- rider_id,
        driver_id <- driver_id,
        status <- status,
        @request_time <- request_time,
        @accept_time <- accept_time,
        @pickup_time <- pickup_time,
        @dropoff_time <- dropoff_time,
        fare <- fare,
        distance <- distance,
        pickup_lat <- pickup_lat,
        pickup_long <- pickup_long,
        dropoff_lat <- dropoff_lat,
        dropoff_long <- dropoff_long,
        city <- city
    )
    SET request_time = STR_TO_DATE(@request_time, '%Y-%m-%dT%H:%i:%s.%f'),
        accept_time = STR_TO_DATE(@accept_time, '%Y-%m-%dT%H:%i:%s.%f'),
        pickup_time = STR_TO_DATE(@pickup_time, '%Y-%m-%dT%H:%i:%s.%f'),
        dropoff_time = STR_TO_DATE(@dropoff_time, '%Y-%m-%dT%H:%i:%s.%f');
START PIPELINE rideshare_kafka_trips;

-- Create a riders table and kafka pipeline that consumes the ridesharing-sim-riders topic and upserts data.
DROP TABLE IF EXISTS riders;
CREATE TABLE riders (
    id VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(255),
    date_of_birth DATETIME(6),
    created_at DATETIME(6),
    location_city VARCHAR(255),
    location_lat DOUBLE,
    location_long DOUBLE,
    status VARCHAR(20),
    PRIMARY KEY (id),
    SORT KEY (status, location_city)
);
DROP PIPELINE IF EXISTS rideshare_kafka_riders;
CREATE OR REPLACE PIPELINE rideshare_kafka_riders AS
    LOAD DATA KAFKA 'pkc-rgm37.us-west-2.aws.confluent.cloud:9092/ridesharing-sim-riders'
    CONFIG '{"sasl.username": "username",
         "sasl.mechanism": "PLAIN",
         "security.protocol": "SASL_SSL",
         "ssl.ca.location": "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem"}'
    CREDENTIALS '{"sasl.password": "password"}'
    DISABLE OUT_OF_ORDER OPTIMIZATION
    REPLACE INTO TABLE riders
    FORMAT JSON
    (
        id <- id,
        first_name <- first_name,
        last_name <- last_name,
        email <- email,
        phone_number <- phone_number,
        @date_of_birth <- date_of_birth,
        @created_at <- created_at,
        location_city <- location_city,
        location_lat <- location_lat,
        location_long <- location_long,
        status <- status
    )
    SET date_of_birth = STR_TO_DATE(@date_of_birth, '%Y-%m-%dT%H:%i:%s.%f'),
        created_at = STR_TO_DATE(@created_at, '%Y-%m-%dT%H:%i:%s.%f');
START PIPELINE rideshare_kafka_riders;

-- Create a drivers table and kafka pipeline that consumes the ridesharing-sim-drivers topic and upserts data.
DROP TABLE IF EXISTS drivers;
CREATE TABLE drivers (
    id VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(255),
    date_of_birth DATETIME(6),
    created_at DATETIME(6),
    location_city VARCHAR(255),
    location_lat DOUBLE,
    location_long DOUBLE,
    status VARCHAR(20),
    PRIMARY KEY (id),
    SORT KEY (status, location_city)
);
DROP PIPELINE IF EXISTS rideshare_kafka_drivers;
CREATE OR REPLACE PIPELINE rideshare_kafka_drivers AS
    LOAD DATA KAFKA 'pkc-rgm37.us-west-2.aws.confluent.cloud:9092/ridesharing-sim-drivers'
    CONFIG '{"sasl.username": "username",
         "sasl.mechanism": "PLAIN",
         "security.protocol": "SASL_SSL",
         "ssl.ca.location": "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem"}'
    CREDENTIALS '{"sasl.password": "password"}'
    DISABLE OUT_OF_ORDER OPTIMIZATION
    REPLACE INTO TABLE drivers
    FORMAT JSON
    (
        id <- id,
        first_name <- first_name,
        last_name <- last_name,
        email <- email,
        phone_number <- phone_number,
        @date_of_birth <- date_of_birth,
        @created_at <- created_at,
        location_city <- location_city,
        location_lat <- location_lat,
        location_long <- location_long,
        status <- status
    )
    SET date_of_birth = STR_TO_DATE(@date_of_birth, '%Y-%m-%dT%H:%i:%s.%f'),
        created_at = STR_TO_DATE(@created_at, '%Y-%m-%dT%H:%i:%s.%f');
START PIPELINE rideshare_kafka_drivers;

-- Debug query to see the current number of trips, riders, and drivers grouped by their status.
SELECT 'trips' as entity, status, COUNT(*) as count
    FROM trips
    GROUP BY status
    UNION ALL
    SELECT 'riders' as entity, status, COUNT(*) as count
    FROM riders
    GROUP BY status
    UNION ALL
    SELECT 'drivers' as entity, status, COUNT(*) as count
    FROM drivers
    GROUP BY status
    ORDER BY entity, status;