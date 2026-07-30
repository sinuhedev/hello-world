SET sql_mode=ORACLE;
SET sql_mode=;
SELECT @@SQL_MODE, @@GLOBAL.SQL_MODE;

SET @LOG='';

-- SET SESSION sql_mode=ORACLE;
-- DELIMITER /

SELECT @@SQL_MODE;

CREATE OR REPLACE PROCEDURE phel6() 
BEGIN
  DECLARE  query varchar(20);
  DECLARE  query2 varchar(20);
  SELECT 'Hello world from MariaDB PL/SQL Procedure!';
END; 


CREATE PROCEDURE de4ddmo()
BEGIN
   SELECT * FROM USER;
END;

CALL de4ddmo();


CREATE OR REPLACE PROCEDURE phellu() BEGIN
  DECLARE  query varchar(20);
  DECLARE  query2 varchar(20);
  SELECT 'Hello world from MariaDB PL/SQL Procedure!';
END;

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `user_type` varchar(50) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SELECT * FROM gnextia.user;


CREATE or replace FUNCTION hello2(s CHAR(20)) RETURNS char(50) 
  RETURN CONCAT('Hello, ',s,'!');





CREATE OR REPLACE PACKAGE pck AS
  FUNCTION fgetSalary(eid INT) RETURN  char(50);
  PROCEDURE phire(ename TEXT, esalary DECIMAL(10,2));
END;

CREATE OR REPLACE PACKAGE BODY  pck AS
  FUNCTION fgetSalary(eid INT) RETURN char(50) IS
  BEGIN
      RETURN CONCAT('Hello, ','ddd','!');
   END;
  
  PROCEDURE phire(ename TEXT, esalary DECIMAL(10,2)) IS
    BEGIN
      SELECT * FROM "user";
    END;
END;


CALL pck.phire('',20);
SELECT  pck.fgetSalary(20);

/

DECLARE 
 str varchar2(200) := 'sinuhe';
BEGIN
 

   FOR rec IN 1..20
    LOOP
       str := str || 'ya';
    END LOOP;

  SELECT str FROM dual;
END

/


 SELECT CURRENT_TIMESTAMP() FROM dual;
 
 
/ 
 
 BEGIN
  SELECT 'Hello world from MariaDB anonymous PL/SQL block!';
END;

/





CREATE OR REPLACE PROCEDURE hello123(msg varchar) AS
  vString VARCHAR2(255) := NULL;
BEGIN
  SELECT msg INTO vString FROM dual;
  SELECT vString;
END;

/

DECLARE 
   vString VARCHAR2(255) := 'hola';
BEGIN
  hello123(vString);
END;



CREATE TABLE IF NOT EXISTS gnextia.myquery(
  name varchar2(50),
  query varchar2(200),
  PRIMARY KEY (name)
)ENGINE=MEMORY;

SELECT * FROM  gnextia.myquery;
SELECT query FROM gnextia.myquery WHERE name = 'getUser';



show TABLE myquery;


CREATE OR REPLACE PROCEDURE run_query(name varchar,columns varchar,param1 varchar) AS
  query VARCHAR2(200);
query1 VARCHAR2(200);
query2 VARCHAR2(200);
BEGIN
  
  IF (SELECT locate('select',columns)) > 0 THEN
    SELECT 'column error' AS error FROM dual;
  END IF;
  
--  query := ' SELECT * FROM USER where id = ?';

SELECT query INTO query1 FROM gnextia.myquery WHERE name = 'getUser';

  console.info('query1: '||query1);

  query2 := '
    with w_table as (' 
    || query1 ||  
  ') select ' || columns ||' from w_table';

console.info(query2);

  prepare run_query from query2;
  EXECUTE run_query USING param1; 
END;



CALL console.clear();
CALL console.print();


CALL run_query('getUser','*','1');







-------

CREATE OR REPLACE PROCEDURE ya(name varchar,columns varchar,param1 varchar) AS
  query1 VARCHAR2(200);
 query2 VARCHAR2(200);
BEGIN
  
  IF (SELECT locate('select',columns)) > 0 THEN
    SELECT 'column error' AS error FROM dual;
  END IF;
  
--  query := ' SELECT * FROM USER where id = ?';

  SELECT query INTO query1 FROM gnextia.myquery WHERE name = 'getUser';

  console.info('query1: '||query1);

  query2 := '
    with w_table as (' 
    || query1 ||  
  ') select ' || columns ||' from w_table';

  console.info(query2);

  prepare run_query from query2;
  EXECUTE run_query USING param1; 
END;




CALL ya('getUser','*','1');

CALL console.print();













  SELECT query FROM gnextia.myquery WHERE name = name;

SELECT * FROM USER;



DECLARE
 username USER.username%TYPE;
 u USER%ROWTYPE;
BEGIN
  SELECT * INTO u FROM  `USER` LIMIT 1;
  SET @LOG = u.id;
END;


BEGIN
    SET @LOG := 'ss';
END;


SELECT @LOG FROM DUAL;

DECLARE 
query1 varchar2(200);
name varchar2(200):='getUser';
BEGIN
  
SELECT query INTO query1 FROM gnextia.myquery WHERE name = name;
SELECT query1;
  END;

-----------------------------------

CREATE OR REPLACE PACKAGE console AS
  PROCEDURE enable();
  PROCEDURE disable();
  PROCEDURE info(msg varchar2);
  PROCEDURE clear();
  PROCEDURE print();
END;

CREATE OR REPLACE PACKAGE BODY console AS
  show_log BOOLEAN := TRUE;

  -- enable
  PROCEDURE enable() IS
  BEGIN
    show_log := TRUE;
  END;
  
  -- disable
  PROCEDURE disable() IS
  BEGIN
    show_log := FALSE;
  END;
  
  -- init
  PROCEDURE init() IS
  BEGIN
    IF show_log THEN
      CREATE TEMPORARY TABLE IF NOT EXISTS gnextia.tmp_console(
        datetime TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        msg varchar2(200)
      )ENGINE=MEMORY;
    END IF;
  END;

  -- info
  PROCEDURE info(msg varchar2) IS
  BEGIN
    IF show_log THEN
      init();
      INSERT INTO gnextia.tmp_console(msg) value (msg);
    END IF;
  END;

  -- clear
  PROCEDURE clear() IS
  BEGIN
    IF show_log THEN
      init();
      TRUNCATE TABLE gnextia.tmp_console;
    END IF;
  END;

  -- print
  PROCEDURE print() IS
  BEGIN
    IF show_log THEN
      init();
      SELECT * FROM gnextia.tmp_console;
    END IF;
  END;
  
END;



CALL console.enable();
CALL console.info('hola');
call console.clear();
call console.print();

SELECT * FROM tmp_console;

-----------------------------------


CREATE OR REPLACE PACKAGE myquery IS
  PROCEDURE trx(vname varchar2(100),vcolumns varchar2(100),vparam1 varchar2(100));
  PROCEDURE print();
END;


CREATE OR REPLACE PACKAGE BODY myquery IS
  -- trx
  PROCEDURE trx(vname varchar2(100),vcolumns varchar2(100),vparam1 varchar2(100)) IS
    vquery VARCHAR2(200);
    vquery2 VARCHAR2(200);
  BEGIN
    IF (SELECT locate('select',vcolumns)) > 0 THEN
      SELECT 'column error' AS error FROM dual;
    END IF;

    SELECT query INTO vquery FROM myquery WHERE name = vname;
  
    console.info('vquery: '||vquery);
  
    vquery2 := '
      with w_table as (' 
      || vquery ||  
    ') select ' || vcolumns ||' from w_table';
  
    console.info(vquery2);
  
    prepare run_query from vquery2;
    EXECUTE run_query USING vparam1; 
  END;

  PROCEDURE print() IS
  BEGIN
    SELECT * FROM myquery;
  END;
  
END;

CALL console.print();
CALL myquery.print();
CALL myquery.trx('USR00','*','1,\'hola\'');

--------------------------------------



DECLARE
  run_query varchar2(200);
  param varchar2(200):='1,\'hola\'';
BEGIN
  
   SELECT param;
   
   
--   prepare run_query from 'SELECT * FROM USER where id = ? and username = ?';
--   EXECUTE run_query USING param; 
END;




SELECT *  FROM information_schema.parameters  WHERE SPECIFIC_NAME = 'test';


SELECT version();


select  json_value('{"key1":123}', '$.key1'); 



CREATE OR REPLACE FUNCTION SPLIT_STR(x VARCHAR2(255),delim VARCHAR2(3),pos INT) RETURN VARCHAR2 IS
BEGIN
  RETURN REPLACE(
          SUBSTRING(SUBSTRING_INDEX(x, delim, pos),
          LENGTH(SUBSTRING_INDEX(x, delim, pos -1)) + 1),
          delim, ''
        );
END;

SELECT SPLIT_STR('1,"hi, estuve",2',',',2);




SELECT JSON_VALUE('
{
  "id": 5,
  "name": "sinuhe , ya"
}
','$.name') ;

SELECT JSON_KEYS('{"id":5,"name":"sinuhe , ya"}') ;



DECLARE
  vjson varchar2(200):='{"id":5,"name":"sinuhe , ya"}';
BEGIN
  SELECT JSON_KEYS(vjson);
END;





