/*
  # Create vw_analisisdetallado view

  1. Purpose
    - Creates a view that joins lineas_analisis with lineas table
    - Brings together Contrato and Coste data for all versions (0, 1, 2)
    - Uses clave_compuesta_cto for Contrato joins
    - Uses clave_compuesta for Coste joins

  2. Columns
    - All columns from lineas_analisis
    - Contrato_v0_cant, Contrato_v0_precio, Contrato_v0_importe (from Contrato version 0)
    - Contrato_v1_cant, Contrato_v1_precio, Contrato_v1_importe (from Contrato version 1)
    - Contrato_v2_cant, Contrato_v2_precio, Contrato_v2_importe (from Contrato version 2)
    - Coste_v0_cant, Coste_v0_precio, Coste_v0_importe (from Coste version 0)
    - Coste_v1_cant, Coste_v1_precio, Coste_v1_importe (from Coste version 1)
    - Coste_v2_cant, Coste_v2_precio, Coste_v2_importe (from Coste version 2)
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
  c0.canpres   AS Contrato_v0_cant,
  c0.pres      AS Contrato_v0_precio,
  c0.imppres   AS Contrato_v0_importe,

  c1.canpres   AS Contrato_v1_cant,
  c1.pres      AS Contrato_v1_precio,
  c1.imppres   AS Contrato_v1_importe,

  c2.canpres   AS Contrato_v2_cant,
  c2.pres      AS Contrato_v2_precio,
  c2.imppres   AS Contrato_v2_importe,

  -- Coste versions (join using la.clave_compuesta)
  t0.canpres   AS Coste_v0_cant,
  t0.pres      AS Coste_v0_precio,
  t0.imppres   AS Coste_v0_importe,

  t1.canpres   AS Coste_v1_cant,
  t1.pres      AS Coste_v1_precio,
  t1.imppres   AS Coste_v1_importe,

  t2.canpres   AS Coste_v2_cant,
  t2.pres      AS Coste_v2_precio,
  t2.imppres   AS Coste_v2_importe

FROM public.lineas_analisis la

-- Contrato joins (use clave_compuesta_cto)
LEFT JOIN LATERAL (
  SELECT l.canpres, l.pres, l.imppres
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 0
  LIMIT 1
) c0 ON TRUE

LEFT JOIN LATERAL (
  SELECT l.canpres, l.pres, l.imppres
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 1
  LIMIT 1
) c1 ON TRUE

LEFT JOIN LATERAL (
  SELECT l.canpres, l.pres, l.imppres
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 2
  LIMIT 1
) c2 ON TRUE

-- Coste joins (use clave_compuesta)
LEFT JOIN LATERAL (
  SELECT l.canpres, l.pres, l.imppres
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 0
  LIMIT 1
) t0 ON TRUE

LEFT JOIN LATERAL (
  SELECT l.canpres, l.pres, l.imppres
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 1
  LIMIT 1
) t1 ON TRUE

LEFT JOIN LATERAL (
  SELECT l.canpres, l.pres, l.imppres
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 2
  LIMIT 1
) t2 ON TRUE

ORDER BY la.indice;
