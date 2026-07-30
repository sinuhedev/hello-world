

begin;
SET  application_name = 'true';
select * from vehicles where available = :'application_name' ;
commit;





show application_name;

select application_name from dual;


select * from vehicles;