/*
  # Populate clave_compuesta_cto field
  
  1. Problem
    - clave_compuesta_cto is null in lineas_analisis
    - This prevents joining with lineas_contrato data
    
  2. Solution
    - Set clave_compuesta_cto = clave_compuesta for all records
    - Both contrato and coste tables use the same key structure
*/

UPDATE lineas_analisis
SET clave_compuesta_cto = clave_compuesta
WHERE clave_compuesta_cto IS NULL;
