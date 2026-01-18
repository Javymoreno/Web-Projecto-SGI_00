/*
  # Fix precio retrieval in vw_analisisdetallado
  
  1. Problem
    - Using MAX(l.pres) was picking incorrect prices
    - Multiple records exist per clave_compuesta with different tipo_informacion
    - Need to filter by correct tipo_informacion before aggregating
    
  2. Solution
    - For Partidas: Use tipo_informacion = 'Partida' to get correct canpres and pres
    - For Descompuestos: Use tipo_informacion = 'Descompuesto' to get correct values
    - Keep SUM(imppres) for total importe across all child elements
    
  3. Changes
    - Add WHERE clause to filter by tipo_informacion IN ('Partida', 'Descompuesto')
    - This ensures we only use the correct price records, not 'Resumen Partida' or other types
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
  la.inserted_at,
  
  -- Contrato versions (join using clave_compuesta_cto)
  c0.canpres         AS Contrato_v0_cant,
  c0.cant_descomp    AS Contrato_v0_cantdescomp,
  c0.pres            AS Contrato_v0_precio,
  c0.imppres_sum     AS Contrato_v0_importe,
  c0.tipo_informacion AS Contrato_v0_tipo,

  c1.canpres         AS Contrato_v1_cant,
  c1.cant_descomp    AS Contrato_v1_cantdescomp,
  c1.pres            AS Contrato_v1_precio,
  c1.imppres_sum     AS Contrato_v1_importe,
  c1.tipo_informacion AS Contrato_v1_tipo,

  c2.canpres         AS Contrato_v2_cant,
  c2.cant_descomp    AS Contrato_v2_cantdescomp,
  c2.pres            AS Contrato_v2_precio,
  c2.imppres_sum     AS Contrato_v2_importe,
  c2.tipo_informacion AS Contrato_v2_tipo,

  -- Coste versions (join using la.clave_compuesta)
  t0.canpres         AS Coste_v0_cant,
  t0.cant_descomp    AS Coste_v0_cantdescomp,
  t0.pres            AS Coste_v0_precio,
  t0.imppres_sum     AS Coste_v0_importe,
  t0.tipo_informacion AS Coste_v0_tipo,

  t1.canpres         AS Coste_v1_cant,
  t1.cant_descomp    AS Coste_v1_cantdescomp,
  t1.pres            AS Coste_v1_precio,
  t1.imppres_sum     AS Coste_v1_importe,
  t1.tipo_informacion AS Coste_v1_tipo,

  t2.canpres         AS Coste_v2_cant,
  t2.cant_descomp    AS Coste_v2_cantdescomp,
  t2.pres            AS Coste_v2_precio,
  t2.imppres_sum     AS Coste_v2_importe,
  t2.tipo_informacion AS Coste_v2_tipo

FROM public.lineas_analisis la

-- Contrato joins (use clave_compuesta_cto)
LEFT JOIN LATERAL (
  SELECT 
    MAX(l.canpres) as canpres, 
    MAX(l.cant_descomp) as cant_descomp, 
    MAX(l.pres) as pres, 
    SUM(l.imppres) as imppres_sum, 
    MAX(l.tipo_informacion) as tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 0
    AND l.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) c0 ON TRUE

LEFT JOIN LATERAL (
  SELECT 
    MAX(l.canpres) as canpres, 
    MAX(l.cant_descomp) as cant_descomp, 
    MAX(l.pres) as pres, 
    SUM(l.imppres) as imppres_sum, 
    MAX(l.tipo_informacion) as tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 1
    AND l.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) c1 ON TRUE

LEFT JOIN LATERAL (
  SELECT 
    MAX(l.canpres) as canpres, 
    MAX(l.cant_descomp) as cant_descomp, 
    MAX(l.pres) as pres, 
    SUM(l.imppres) as imppres_sum, 
    MAX(l.tipo_informacion) as tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 2
    AND l.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) c2 ON TRUE

-- Coste joins (use clave_compuesta)
LEFT JOIN LATERAL (
  SELECT 
    MAX(l.canpres) as canpres, 
    MAX(l.cant_descomp) as cant_descomp, 
    MAX(l.pres) as pres, 
    SUM(l.imppres) as imppres_sum, 
    MAX(l.tipo_informacion) as tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 0
    AND l.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) t0 ON TRUE

LEFT JOIN LATERAL (
  SELECT 
    MAX(l.canpres) as canpres, 
    MAX(l.cant_descomp) as cant_descomp, 
    MAX(l.pres) as pres, 
    SUM(l.imppres) as imppres_sum, 
    MAX(l.tipo_informacion) as tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 1
    AND l.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) t1 ON TRUE

LEFT JOIN LATERAL (
  SELECT 
    MAX(l.canpres) as canpres, 
    MAX(l.cant_descomp) as cant_descomp, 
    MAX(l.pres) as pres, 
    SUM(l.imppres) as imppres_sum, 
    MAX(l.tipo_informacion) as tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 2
    AND l.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) t2 ON TRUE

ORDER BY la.indice;
