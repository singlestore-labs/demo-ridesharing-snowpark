# Ridesharing Simulation

**Attention**: The code in this repository is intended for experimental use only and is not fully tested, documented, or supported by SingleStore. Visit the [SingleStore Forums](https://www.singlestore.com/forum/) to ask questions about this repository.

## Overview

Ride-sharing apps such as Uber and Lyft generate massive amounts of data every day. Being able to efficiently ingest and analyze this data is key to making crucial data-driven decisions. This demo showcases how SingleStore can be used to accelerate an existing analytics dashboard, enabling low-latency analytics on real-time data.

This demos builds upon the [previous ridesharing demo](https://github.com/singlestore-labs/demo-ridesharing-sim), showcasing how SingleStore's Native App inside Snowpark Container Services (SPCS) can be used to power real-time analytics on your data without it ever leaving your Snowflake environment.

Just like before, this demo consists of three main components:
- [Simulator](#simulator)
- [API Server](#api-server)
- [React Dashboard](#react-dashboard)

Our simulator generates realistic ride-sharing trip data and streams it to a Kafka topic. Using the Snowflake Kafka Connector, this data is then ingested into Snowflake tables. An API Server queries this data and exposes it through a RESTful interface. Finally, a React Dashboard consumes this API to provide dynamic visualizations of rider, driver, and trip information.

One new addition is a simple proxy service that will allow our API Server to be reachable by our React application. Since Snowflake requires any requests into SPCS to be authenticated, requests to our backend needs to have the Snowflake JWT. The proxy service will help automatically add this to every request.

Then we will showcase our new Snowpark Native App, allowing you to leverage SingleStore's real-time capabilities while maintaining full control of your data.

## Getting Started

## Resources

* [Documentation](https://docs.singlestore.com)
* [Twitter](https://twitter.com/SingleStoreDevs)
* [SingleStore Forums](https://www.singlestore.com/forum)
