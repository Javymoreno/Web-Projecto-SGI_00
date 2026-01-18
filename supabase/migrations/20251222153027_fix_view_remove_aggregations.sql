/*
  # Fix vw_analisisdetallado - Remove aggregations
  
  1. Problem
    - Current view uses MAX/SUM aggregations which corrupt data
    - Multiple rows exist per clave_compuesta (Partida, Texto, Mediciones, etc.)
    - Aggregations mix values from different row types
    
  2. Solution
    - Use DISTINCT ON to get only the first relevant row
    - Filter by tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
    - Remove MAX/SUM aggregations
    - Get actual values directly from the matching row
*/

DROP VIEW IF EXISTS public.vw_analisisdetallado;

CREATE OR REPLACE VIEW public.vw_analisisdetallado AS
SELECT
  la.id,
  la.indice,
  la.file_name,
  la.cod_obra,
  la.origen,
  la.version AS versionada,
  la."Nivel",
  la."EDT",
  la.codigo,
  la.codigo2,
  la.ud,
  la.resumen,
  la."Resumen2",
  la."UserText",
  la."UserText1",
  la."UserNumber",
  la."Nota",
  la.nat,
  la."CodSup",
  la."CodInf",
  la."Guid_SGI",
  la."Cap_SIS",
  la.clave_compuesta,
  la.clave_compuesta_cto,
  la.plan_guid,
  la.inserted_at,
  
  -- Contrato versions
  COALESCE(c0.canpres, 0) AS Contrato_v0_cant,
  COALESCE(c0.cant_descomp, 0) AS Contrato_v0_cantdescomp,
  COALESCE(c0.pres, 0) AS Contrato_v0_precio,
  COALESCE(c0.imppres, 0) AS Contrato_v0_importe,
  COALESCE(c0.tipo_informacion, '') AS Contrato_v0_tipo,

  COALESCE(c1.canpres, 0) AS Contrato_v1_cant,
  COALESCE(c1.cant_descomp, 0) AS Contrato_v1_cantdescomp,
  COALESCE(c1.pres, 0) AS Contrato_v1_precio,
  COALESCE(c1.imppres, 0) AS Contrato_v1_importe,
  COALESCE(c1.tipo_informacion, '') AS Contrato_v1_tipo,

  COALESCE(c2.canpres, 0) AS Contrato_v2_cant,
  COALESCE(c2.cant_descomp, 0) AS Contrato_v2_cantdescomp,
  COALESCE(c2.pres, 0) AS Contrato_v2_precio,
  COALESCE(c2.imppres, 0) AS Contrato_v2_importe,
  COALESCE(c2.tipo_informacion, '') AS Contrato_v2_tipo,

  -- Coste versions
  COALESCE(t0.canpres, 0) AS Coste_v0_cant,
  COALESCE(t0.cant_descomp, 0) AS Coste_v0_cantdescomp,
  COALESCE(t0.pres, 0) AS Coste_v0_precio,
  COALESCE(t0.imppres, 0) AS Coste_v0_importe,
  COALESCE(t0.tipo_informacion, '') AS Coste_v0_tipo,

  COALESCE(t1.canpres, 0) AS Coste_v1_cant,
  COALESCE(t1.cant_descomp, 0) AS Coste_v1_cantdescomp,
  COALESCE(t1.pres, 0) AS Coste_v1_precio,
  COALESCE(t1.imppres, 0) AS Coste_v1_importe,
  COALESCE(t1.tipo_informacion, '') AS Coste_v1_tipo,

  COALESCE(t2.canpres, 0) AS Coste_v2_cant,
  COALESCE(t2.cant_descomp, 0) AS Coste_v2_cantdescomp,
  COALESCE(t2.pres, 0) AS Coste_v2_precio,
  COALESCE(t2.imppres, 0) AS Coste_v2_importe,
  COALESCE(t2.tipo_informacion, '') AS Coste_v2_tipo

FROM public.lineas_analisis la

-- Contrato joins - use DISTINCT ON to get first matching row
LEFT JOIN LATERAL (
  SELECT DISTINCT ON (lc.clave_compuesta)
    lc.canpres, 
    lc.cant_descomp, 
    lc.pres, 
    lc.imppres, 
    lc.tipo_informacion
  FROM public.lineas_contrato lc
  WHERE lc.clave_compuesta = la.clave_compuesta_cto
    AND lc.origen = 'Contrato'
    AND COALESCE(lc.version, 0) = 0
    AND lc.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
  ORDER BY lc.clave_compuesta, lc.indice
  LIMIT 1
) c0 ON TRUE

LEFT JOIN LATERAL (
  SELECT DISTINCT ON (lc.clave_compuesta)
    lc.canpres, 
    lc.cant_descomp, 
    lc.pres, 
    lc.imppres, 
    lc.tipo_informacion
  FROM public.lineas_contrato lc
  WHERE lc.clave_compuesta = la.clave_compuesta_cto
    AND lc.origen = 'Contrato'
    AND COALESCE(lc.version, 0) = 1
    AND lc.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
  ORDER BY lc.clave_compuesta, lc.indice
  LIMIT 1
) c1 ON TRUE

LEFT JOIN LATERAL (
  SELECT DISTINCT ON (lc.clave_compuesta)
    lc.canpres, 
    lc.cant_descomp, 
    lc.pres, 
    lc.imppres, 
    lc.tipo_informacion
  FROM public.lineas_contrato lc
  WHERE lc.clave_compuesta = la.clave_compuesta_cto
    AND lc.origen = 'Contrato'
    AND COALESCE(lc.version, 0) = 2
    AND lc.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
  ORDER BY lc.clave_compuesta, lc.indice
  LIMIT 1
) c2 ON TRUE

-- Coste joins - use DISTINCT ON to get first matching row
LEFT JOIN LATERAL (
  SELECT DISTINCT ON (lco.clave_compuesta)
    lco.canpres, 
    lco.cant_descomp, 
    lco.pres, 
    lco.imppres, 
    lco.tipo_informacion
  FROM public.lineas_coste lco
  WHERE lco.clave_compuesta = la.clave_compuesta
    AND lco.origen = 'Coste'
    AND COALESCE(lco.version, 0) = 0
    AND lco.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
  ORDER BY lco.clave_compuesta, lco.indice
  LIMIT 1
) t0 ON TRUE

LEFT JOIN LATERAL (
  SELECT DISTINCT ON (lco.clave_compuesta)
    lco.canpres, 
    lco.cant_descomp, 
    lco.pres, 
    lco.imppres, 
    lco.tipo_informacion
  FROM public.lineas_coste lco
  WHERE lco.clave_compuesta = la.clave_compuesta
    AND lco.origen = 'Coste'
    AND COALESCE(lco.version, 0) = 1
    AND lco.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
  ORDER BY lco.clave_compuesta, lco.indice
  LIMIT 1
) t1 ON TRUE

LEFT JOIN LATERAL (
  SELECT DISTINCT ON (lco.clave_compuesta)
    lco.canpres, 
    lco.cant_descomp, 
    lco.pres, 
    lco.imppres, 
    lco.tipo_informacion
  FROM public.lineas_coste lco
  WHERE lco.clave_compuesta = la.clave_compuesta
    AND lco.origen = 'Coste'
    AND COALESCE(lco.version, 0) = 2
    AND lco.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
  ORDER BY lco.clave_compuesta, lco.indice
  LIMIT 1
) t2 ON TRUE

ORDER BY la.indice;
