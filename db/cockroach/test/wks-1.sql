
select to_json(v) from vehicles v;

SELECT ARRAY[true,false,true];

WITH RECURSIVE cte (n, factorial) AS (
    VALUES (0, 1) -- initial subquery
  UNION ALL
    SELECT n+1, (n+1)*factorial FROM cte WHERE n < 9 -- recursive subquery
)
SELECT * FROM cte;