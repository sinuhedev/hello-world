CREATE USER IF NOT EXISTS root;
GRANT CREATE ON DATABASE demo TO root;

CREATE DATABASE IF NOT EXISTS demo;

USE demo;

DROP SCHEMA IF EXISTS abbey_schema CASCADE;
CREATE SCHEMA abbey_schema AUTHORIZATION abbey;


CREATE TABLE demo.public.vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      creation_time TIMESTAMPTZ DEFAULT now(),
      available BOOL,
      last_location STRING
  );
  
 