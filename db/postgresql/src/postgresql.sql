CREATE TABLE gnextia."user"(
   id serial PRIMARY KEY,
   name VARCHAR (50) UNIQUE NOT NULL
);


SELECT * FROM gnextia.user;

INSERT INTO gnextia.user (id,name) VALUES 
  (DEFAULT,'Juan1'),
  (DEFAULT,'Juan2');


CREATE OR REPLACE FUNCTION gnextia.inc(val integer) 
RETURNS integer AS $$
BEGIN
  RETURN val + 1;
END; $$
LANGUAGE PLPGSQL;




CREATE OR REPLACE FUNCTION gnextia.inc2(val integer) 
RETURNS integer AS $$
BEGIN
  RETURN val + 2;
END; $$
LANGUAGE PLPGSQL;



SELECT gnextia.inc2(20);




CREATE OR REPLACE PROCEDURE gnextia.transfer(a integer, b varchar) 
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE gnextia.user
    SET name = b
    WHERE id = a;

    COMMIT;
END $$;




CREATE OR REPLACE PROCEDURE gnextia.show() 
LANGUAGE plpgsql AS $$
BEGIN
    select * from gnextia.user;
END $$;

CALL gnextia.show();



-----------------

CREATE OR REPLACE FUNCTION gnextia.show_cities2(ref refcursor) RETURNS refcursor AS $$
BEGIN
  OPEN ref FOR SELECT * FROM gnextia.user; 
  RETURN ref;                                                      
END;
$$ LANGUAGE plpgsql;


DO $$
DECLARE
  cities_cur REFCURSOR;
BEGIN
   SELECT gnextia.show_cities2('cities_cur'); 
   FETCH ALL IN 'cities_cur';
END $$;

-------



CALL gnextia.transfer(1,'sinuhe');


DO $$
DECLARE
  counter integer := 0;
BEGIN 
   call gnextia.transfer(2,'sinuhe');
END $$;





DO $$DECLARE
  counter integer := 0;
BEGIN 
   counter := counter + 1;
   RAISE NOTICE 'The current value osssf counter is %', counter;
END$$;





CREATE OR REPLACE FUNCTION function_1(refcursor) RETURNS refcursor AS $$
BEGIN
        OPEN $1 FOR SELECT * FROM gnextia."user";
        RETURN $1;    
END;
$$ LANGUAGE plpgsql;
  
SELECT gnextia.function_1();




CREATE OR REPLACE FUNCTION function_1() RETURNS refcursor AS '
DECLARE
        ref_cursor REFCURSOR := 'mycursor';
BEGIN
        OPEN ref_cursor FOR  SELECT * FROM "user".ACCOUNT;
        RETURN (ref_cursor);    
END;
'
  
----------------

CREATE TABLE gnextia.strings (
  id serial primary key,
  val varchar
);
INSERT INTO gnextia.strings (val)
VALUES ('a'), ('b'), ('c');


-- iterate over the data in a cursor
CREATE OR REPLACE FUNCTION gnextia.josh_test()
RETURNS SETOF varchar AS $$
DECLARE
  curs CURSOR FOR SELECT * FROM gnextia.strings;
  row  RECORD;
BEGIN
  open curs;
  LOOP
    FETCH FROM curs INTO row;
    EXIT WHEN NOT FOUND;
    return next row.val;
  END LOOP;
  
  -- RAISE NOTICE '%', val;
END; $$ LANGUAGE plpgsql;

SELECT gnextia.josh_test();
      
      
SELECT * FROM gnextia.user;



CREATE OR REPLACE FUNCTION gnextia.get_film () 
   RETURNS TABLE (
      film_title VARCHAR,
      film_release_year INT
) 
AS $$
BEGIN
   RETURN QUERY SELECT
      name,
      id
   FROM
      gnextia.user;
END; $$ 
 
LANGUAGE 'plpgsql';


SELECT  * FROM  gnextia.get_film ();

      


CREATE OR REPLACE FUNCTION gnextia.demo ()
RETURNS SETOF record
AS $$
    SELECT * FROM gnextia.USER;
$$ LANGUAGE SQL;

SELECT * FROM gnextia.demo() AS (a int, b text);



CREATE OR REPLACE FUNCTION gnextia.test() RETURNS SETOF RECORD AS $$
DECLARE
 rec record;
BEGIN
  select 1,2 into rec;
  return next rec;

  select 3,4 into rec;
  return next rec;
END $$ language plpgsql;


select * from gnextia.test() as x(a int ,b int) ;


CREATE OR REPLACE FUNCTION gnextia.show_cities_multiple(ref refcursor) RETURNS refcursor AS $$                        
BEGIN
  OPEN ref FOR SELECT name FROM gnextia.user; 
  RETURN  ref;                                                                              -- Return the cursor to the caller                                                                           -- Return the cursor to the caller
END;
$$ LANGUAGE plpgsql;


SELECT gnextia.show_cities_multiple('smb');



BEGIN;
 
SELECT gnextia.show_cities_multiple('smb');
   FETCH ALL IN "smb";
COMMIT;

