/*
  # Fix vw_analisisdetallado to use correct tables
  
  1. Problem
    - View was referencing non-existent 'lineas' table
    - Should use 'lineas_contrato' and 'lineas_coste' instead
    
  2. Solution
    - Replace joins to use lineas_contrato for Contrato data
    - Replace joins to use lineas_coste for Coste data
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

  -- Coste versions
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

-- Contrato joins
LEFT JOIN LATERAL (
  SELECT 
    MAX(lc.canpres) as canpres, 
    MAX(lc.cant_descomp) as cant_descomp, 
    MAX(lc.pres) as pres, 
    SUM(lc.imppres) as imppres_sum, 
    MAX(lc.tipo_informacion) as tipo_informacion
  FROM public.lineas_contrato lc
  WHERE lc.clave_compuesta = la.clave_compuesta_cto
    AND lc.origen = 'Contrato'
    AND COALESCE(lc.version, 0) = 0
    AND lc.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) c0 ON TRUE

LEFT JOIN LATERAL (
  SELECT 
    MAX(lc.canpres) as canpres, 
    MAX(lc.cant_descomp) as cant_descomp, 
    MAX(lc.pres) as pres, 
    SUM(lc.imppres) as imppres_sum, 
    MAX(lc.tipo_informacion) as tipo_informacion
  FROM public.lineas_contrato lc
  WHERE lc.clave_compuesta = la.clave_compuesta_cto
    AND lc.origen = 'Contrato'
    AND COALESCE(lc.version, 0) = 1
    AND lc.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) c1 ON TRUE

LEFT JOIN LATERAL (
  SELECT 
    MAX(lc.canpres) as canpres, 
    MAX(lc.cant_descomp) as cant_descomp, 
    MAX(lc.pres) as pres, 
    SUM(lc.imppres) as imppres_sum, 
    MAX(lc.tipo_informacion) as tipo_informacion
  FROM public.lineas_contrato lc
  WHERE lc.clave_compuesta = la.clave_compuesta_cto
    AND lc.origen = 'Contrato'
    AND COALESCE(lc.version, 0) = 2
    AND lc.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) c2 ON TRUE

-- Coste joins
LEFT JOIN LATERAL (
  SELECT 
    MAX(lco.canpres) as canpres, 
    MAX(lco.cant_descomp) as cant_descomp, 
    MAX(lco.pres) as pres, 
    SUM(lco.imppres) as imppres_sum, 
    MAX(lco.tipo_informacion) as tipo_informacion
  FROM public.lineas_coste lco
  WHERE lco.clave_compuesta = la.clave_compuesta
    AND lco.origen = 'Coste'
    AND COALESCE(lco.version, 0) = 0
    AND lco.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) t0 ON TRUE

LEFT JOIN LATERAL (
  SELECT 
    MAX(lco.canpres) as canpres, 
    MAX(lco.cant_descomp) as cant_descomp, 
    MAX(lco.pres) as pres, 
    SUM(lco.imppres) as imppres_sum, 
    MAX(lco.tipo_informacion) as tipo_informacion
  FROM public.lineas_coste lco
  WHERE lco.clave_compuesta = la.clave_compuesta
    AND lco.origen = 'Coste'
    AND COALESCE(lco.version, 0) = 1
    AND lco.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) t1 ON TRUE

LEFT JOIN LATERAL (
  SELECT 
    MAX(lco.canpres) as canpres, 
    MAX(lco.cant_descomp) as cant_descomp, 
    MAX(lco.pres) as pres, 
    SUM(lco.imppres) as imppres_sum, 
    MAX(lco.tipo_informacion) as tipo_informacion
  FROM public.lineas_coste lco
  WHERE lco.clave_compuesta = la.clave_compuesta
    AND lco.origen = 'Coste'
    AND COALESCE(lco.version, 0) = 2
    AND lco.tipo_informacion IN ('Partida', 'Descompuesto', 'Capítulo')
) t2 ON TRUE

ORDER BY la.indice;
