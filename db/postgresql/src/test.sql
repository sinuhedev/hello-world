CREATE EXTENSION pldbgapi;

CREATE TABLE public.user(
   id serial PRIMARY KEY,
   name VARCHAR (50) UNIQUE NOT NULL
);



INSERT INTO public.user (id,name) VALUES 
  (DEFAULT,'Juan1'),
  (DEFAULT,'Juan2');
  
select * from public.user


   CREATE OR REPLACE FUNCTION public.show() RETURNS refcursor AS $$
    DECLARE
      ref refcursor;                                                     
    BEGIN
      OPEN ref FOR SELECT name FROM public.user;
      RETURN ref;                                                       
    END;
    $$ LANGUAGE plpgsql;
   
   
   
create or replace FUNCTION public.test()
  returns TABLE ( name varchar) 
AS
$func$
  SELECT name
  FROM public.user;
$func$ 
LANGUAGE sql;
   

select public.test();


