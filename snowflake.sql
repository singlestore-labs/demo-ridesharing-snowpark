-- complete previous snowflake setup from https://github.com/singlestore-labs/demo-ridesharing-sim
-- you should have a database called rideshare_demo and the following tables:
-- trips, riders, drivers

-- new setup
GRANT CREATE COMPUTE POOL ON account TO ROLE RIDESHARE_INGEST;

USE ROLE RIDESHARE_INGEST;
USE DATABASE RIDESHARE_DEMO;

DROP COMPUTE POOL rideshare_demo_compute_pool;
CREATE COMPUTE POOL rideshare_demo_compute_pool
MIN_NODES = 1
MAX_NODES = 1
INSTANCE_FAMILY = CPU_X64_M;

DESC COMPUTE POOL rideshare_demo_compute_pool;

GRANT ALL ON COMPUTE POOL rideshare_demo_compute_pool TO ROLE RIDESHARE_INGEST;

-- Setup network rule to allow external access to all http traffic and the snowflake database
CREATE OR REPLACE NETWORK RULE RIDESHARE_DEMO_RULE
  TYPE = 'HOST_PORT'
  MODE = 'EGRESS'
  VALUE_LIST= (
    '0.0.0.0:443',
    '0.0.0.0:80',
    'SOUQODV-SNOWFLAKE_INTEGRATION.snowflakecomputing.com',
);

-- Setup external access integration to allow access to the network rule
CREATE OR REPLACE EXTERNAL ACCESS INTEGRATION RIDESHARE_DEMO_EAI
  ALLOWED_NETWORK_RULES = (RIDESHARE_DEMO_RULE)
  ENABLED = true;

-- Allow our role to use the external access integration as well as create a service endpoint
USE ROLE ACCOUNTADMIN;
GRANT USAGE ON INTEGRATION RIDESHARE_DEMO_EAI TO ROLE RIDESHARE_INGEST;
GRANT BIND SERVICE ENDPOINT ON ACCOUNT TO ROLE RIDESHARE_INGEST;
USE ROLE RIDESHARE_INGEST;

-- Create image repository  
CREATE OR REPLACE IMAGE REPOSITORY rideshare_demo_repository;
SHOW IMAGE REPOSITORIES;
-- List images in repo (can be called later to verify that images have been pushed to the repo)
call system$registry_list_images('/rideshare_demo/public/rideshare_demo_repository');

-- Create our actual service
DROP SERVICE IF EXISTS rideshare_demo_service;
CREATE SERVICE rideshare_demo_service
  IN COMPUTE POOL rideshare_demo_compute_pool
  FROM SPECIFICATION $$
spec:
  container:
    - name: proxy
      image: /rideshare_demo/public/rideshare_demo_repository/ridesharing_proxy:spcs
    - name: web
      image: /rideshare_demo/public/rideshare_demo_repository/ridesharing_web:spcs
    - name: backend
      image: /rideshare_demo/public/rideshare_demo_repository/ridesharing_server:spcs
      env:
        PORT: 8000
        SINGLESTORE_HOST: aggregator-node.gjhg.svc.spcs.internal
        SINGLESTORE_PORT: 3306
        SINGLESTORE_USERNAME: root
        SINGLESTORE_PASSWORD: password
        SINGLESTORE_DATABASE: rideshare_demo
        SNOWFLAKE_ACCOUNT: SOUQODV-SNOWFLAKE_INTEGRATION
        SNOWFLAKE_USER: RIDESHARE_INGEST
        SNOWFLAKE_PASSWORD: RIDESHARE_INGEST
        SNOWFLAKE_WAREHOUSE: RIDESHARE_INGEST
        SNOWFLAKE_DATABASE: RIDESHARE_DEMO
        SNOWFLAKE_SCHEMA: PUBLIC
  endpoint:
    - name: proxyendpoint
      port: 9000
      public: true
$$
  MIN_INSTANCES=1
  MAX_INSTANCES=1
  EXTERNAL_ACCESS_INTEGRATIONS = (RIDESHARE_DEMO_EAI)
;
GRANT USAGE ON SERVICE rideshare_demo_service TO ROLE RIDESHARE_INGEST;

-- IMPORTANT: Grant our application role access to the SingleStore database
USE ROLE ACCOUNTADMIN;
GRANT APPLICATION ROLE SINGLESTORE_DB_APP.APP_PUBLIC TO ROLE RIDESHARE_INGEST;
USE ROLE RIDESHARE_INGEST;

-- Check the status of our service
SELECT SYSTEM$GET_SERVICE_STATUS('rideshare_demo_service');
CALL SYSTEM$GET_SERVICE_LOGS('rideshare_demo_service', '0', 'proxy', 250);
CALL SYSTEM$GET_SERVICE_LOGS('rideshare_demo_service', '0', 'web', 250);
CALL SYSTEM$GET_SERVICE_LOGS('rideshare_demo_service', '0', 'backend', 250);

SHOW ENDPOINTS IN SERVICE rideshare_demo_service;

-- IMPORTANT: Allow the SingleStore database to access the kafka brokers
USE ROLE ACCOUNTADMIN;
ALTER NETWORK RULE SINGLESTORE_DB_APP_APP_DATA.CONFIGURATION.SINGLESTORE_DB_APP_ALL_ACCESS_EAI_NETWORK_RULE SET
    VALUE_LIST= (
        '0.0.0.0:443',
        '0.0.0.0:80',
        'pkc-rgm37.us-west-2.aws.confluent.cloud:9092',
        'b0-pkc-rgm37.us-west-2.aws.confluent.cloud:9092',
        'b1-pkc-rgm37.us-west-2.aws.confluent.cloud:9092',
        'b2-pkc-rgm37.us-west-2.aws.confluent.cloud:9092',
        'b3-pkc-rgm37.us-west-2.aws.confluent.cloud:9092',
        'b4-pkc-rgm37.us-west-2.aws.confluent.cloud:9092',
        'b5-pkc-rgm37.us-west-2.aws.confluent.cloud:9092'
);