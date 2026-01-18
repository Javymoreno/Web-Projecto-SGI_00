/*
  # Create function to get distinct versions

  1. New Functions
    - `get_distinct_versions` - Returns distinct version numbers for a given table and obra
      - Parameters:
        - table_name: text (name of the table: lineas_analisis, lineas_contrato, or lineas_coste)
        - obra_code: text (cod_obra to filter by)
      - Returns: array of integers (distinct version numbers)
  
  2. Security
    - Function runs with invoker's rights (uses RLS)
    - Safe for authenticated users
*/

CREATE OR REPLACE FUNCTION get_distinct_versions(
  table_name text,
  obra_code text
)
RETURNS integer[]
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result integer[];
BEGIN
  EXECUTE format(
    'SELECT ARRAY_AGG(DISTINCT version ORDER BY version) FROM %I WHERE cod_obra = $1',
    table_name
  )
  INTO result
  USING obra_code;
  
  RETURN COALESCE(result, ARRAY[0]);
END;
$$;