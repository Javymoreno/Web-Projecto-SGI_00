import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AnalisisDetallado {
  id: number;
  indice: number;
  file_name: string;
  cod_obra: string;
  origen: string;
  versionada: string;
  Nivel: number;
  EDT: string;
  codigo: string;
  codigo2: string;
  ud: string;
  resumen: string;
  Resumen2: string;
  UserText: string;
  UserText1: string;
  UserNumber: number;
  Nota: string;
  nat: string;
  CodSup: string;
  CodInf: string;
  Guid_SGI: string;
  Cap_SIS: string;
  clave_compuesta: string;
  clave_compuesta_cto: string;
  inserted_at: string;
  plan_guid: string;

  Contrato_v0_cant: number;
  Contrato_v0_cantdescomp: number;
  Contrato_v0_precio: number;
  Contrato_v0_importe: number;
  Contrato_v0_tipo: string;

  Contrato_v1_cant: number;
  Contrato_v1_cantdescomp: number;
  Contrato_v1_precio: number;
  Contrato_v1_importe: number;
  Contrato_v1_tipo: string;

  Contrato_v2_cant: number;
  Contrato_v2_cantdescomp: number;
  Contrato_v2_precio: number;
  Contrato_v2_importe: number;
  Contrato_v2_tipo: string;

  Coste_v0_cant: number;
  Coste_v0_cantdescomp: number;
  Coste_v0_precio: number;
  Coste_v0_importe: number;
  Coste_v0_tipo: string;

  Coste_v1_cant: number;
  Coste_v1_cantdescomp: number;
  Coste_v1_precio: number;
  Coste_v1_importe: number;
  Coste_v1_tipo: string;

  Coste_v2_cant: number;
  Coste_v2_cantdescomp: number;
  Coste_v2_precio: number;
  Coste_v2_importe: number;
  Coste_v2_tipo: string;
}



export interface PlanificacionData extends AnalisisDetallado {
  comienzo: string | null;
  fin: string | null;
  duracion: number | null;
}

export async function fetchAnalisisDetallado(
  codObra?: string,
  analisisVersion?: number,
  coefK: number = 1.0,
  costeRefVersion: number = 0
): Promise<AnalisisDetallado[]> {
  let analysisQuery = supabase
    .from('lineas_analisis')
    .select('*')
    .order('indice', { ascending: true });

  if (codObra) {
    analysisQuery = analysisQuery.eq('cod_obra', codObra);
  }

  if (analisisVersion !== undefined) {
    analysisQuery = analysisQuery.eq('version', analisisVersion);
  }

  let allAnalysisData: any[] = [];
  let from = 0;
  const limit = 1000;

  while (true) {
    const { data: chunk, error: analysisError } = await analysisQuery.range(from, from + limit - 1);

    if (analysisError) {
      throw new Error(`Error al obtener datos de análisis: ${analysisError.message}`);
    }

    if (!chunk || chunk.length === 0) {
      break;
    }

    allAnalysisData = [...allAnalysisData, ...chunk];

    if (chunk.length < limit) {
      break;
    }

    from += limit;
  }

  const analysisData = allAnalysisData;

  if (!analysisData || analysisData.length === 0) {
    return [];
  }

  const obraCode = analysisData[0]?.cod_obra;

  async function fetchAllRows(table: string, tiposPermitidos: string[]) {
    let allData: any[] = [];
    let from = 0;
    const pageLimit = 1000;

    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('sgi_guid, clave_compuesta, version, canpres, pres, imppres, tipo_informacion')
        .eq('cod_obra', obraCode)
        .in('tipo_informacion', tiposPermitidos)
        .range(from, from + pageLimit - 1);

      if (error) {
        console.error(`Error al obtener datos de ${table}:`, error);
        break;
      }

      if (!data || data.length === 0) {
        break;
      }

      allData = [...allData, ...data];

      if (data.length < pageLimit) {
        break;
      }

      from += pageLimit;
    }

    return allData;
  }


  const [contratoDataRows, costeDataRows] = await Promise.all([
    fetchAllRows('lineas_contrato', ['Partida', 'Capítulo', 'Material', 'Mano de obra', 'Maquinaria', 'Otros', 'Descompuesto']),
    fetchAllRows('lineas_coste', ['Partida', 'Descompuesto', 'Capítulo', 'Material', 'Mano de obra', 'Maquinaria', 'Otros'])
  ]);

  // Para versión 0: indexar por clave_compuesta de lineas_contrato
  // Luego se buscará usando clave_compuesta de lineas_analisis
  // NOTA: En la BD, lineas_contrato v0 usa códigos de análisis, no de contrato
  const contratoMapV0 = new Map<string, { canpres: number; pres: number; imppres: number }>();

  // Para versiones 1+: indexar por clave_compuesta de lineas_contrato
  // Luego se buscará usando clave_compuesta de lineas_analisis
  const contratoMapV1Plus = new Map<string, Map<number, { canpres: number; pres: number; imppres: number }>>();

  contratoDataRows.forEach(row => {
    const version = row.version || 0;
    const canpres = parseFloat(row.canpres) || 0;
    const pres = parseFloat(row.pres) || 0;
    const imppres = parseFloat(row.imppres) || 0;

    if (version === 0) {
      // VERSIÓN 0: Indexar por clave_compuesta de lineas_contrato
      // El join será: lineas_analisis.clave_compuesta = lineas_contrato.clave_compuesta
      const key = row.clave_compuesta;
      if (!contratoMapV0.has(key)) {
        contratoMapV0.set(key, { canpres: 0, pres: 0, imppres: 0 });
      }
      const current = contratoMapV0.get(key)!;
      current.canpres = Math.max(current.canpres, canpres);
      current.pres = Math.max(current.pres, pres);
      current.imppres += imppres;
    } else {
      // VERSIONES 1+: Indexar por clave_compuesta de lineas_contrato
      // El join será: lineas_analisis.clave_compuesta = lineas_contrato.clave_compuesta
      const key = row.clave_compuesta;
      if (!contratoMapV1Plus.has(key)) {
        contratoMapV1Plus.set(key, new Map());
      }
      const versionMap = contratoMapV1Plus.get(key)!;
      if (!versionMap.has(version)) {
        versionMap.set(version, { canpres: 0, pres: 0, imppres: 0 });
      }
      const current = versionMap.get(version)!;
      current.canpres = Math.max(current.canpres, canpres);
      current.pres = Math.max(current.pres, pres);
      current.imppres += imppres;
    }
  });

  const costeMap = new Map<string, Map<number, { canpres: number; pres: number; imppres: number }>>();
  costeDataRows.forEach(row => {
    const key = row.sgi_guid;
    const version = row.version || 0;

    if (!costeMap.has(key)) {
      costeMap.set(key, new Map());
    }

    const versionMap = costeMap.get(key)!;
    if (!versionMap.has(version)) {
      versionMap.set(version, { canpres: 0, pres: 0, imppres: 0 });
    }

    const current = versionMap.get(version)!;
    const canpres = parseFloat(row.canpres) || 0;
    const pres = parseFloat(row.pres) || 0;
    const imppres = parseFloat(row.imppres) || 0;

    current.canpres = Math.max(current.canpres, canpres);
    current.pres = Math.max(current.pres, pres);
    current.imppres += imppres;
  });

  const preliminaryData = analysisData.map((row) => {
    // VERSIÓN 0 CONTRATO: Buscar usando clave_compuesta de lineas_analisis
    // En la BD, lineas_contrato v0 usa el formato de clave_compuesta (código análisis)
    // Join: lineas_analisis.clave_compuesta = lineas_contrato.clave_compuesta
    const c0 = contratoMapV0.get(row.clave_compuesta) || { canpres: 0, pres: 0, imppres: 0 };

    // VERSIONES 1+ CONTRATO: Buscar usando clave_compuesta de lineas_analisis
    // Join: lineas_analisis.clave_compuesta = lineas_contrato.clave_compuesta
    const contratoV1Plus = contratoMapV1Plus.get(row.clave_compuesta);
    const c1 = contratoV1Plus?.get(1) || { canpres: 0, pres: 0, imppres: 0 };
    const c2 = contratoV1Plus?.get(2) || { canpres: 0, pres: 0, imppres: 0 };

    // COSTE: Todas las versiones usan Guid_SGI para vincular con sgi_guid
    // Join: lineas_analisis.Guid_SGI = lineas_coste.sgi_guid
    const costeVersions = costeMap.get(row.Guid_SGI);

    const t0 = costeVersions?.get(0) || { canpres: 0, pres: 0, imppres: 0 };
    const t1 = costeVersions?.get(1) || { canpres: 0, pres: 0, imppres: 0 };
    const t2 = costeVersions?.get(2) || { canpres: 0, pres: 0, imppres: 0 };

    return {
      id: row.id,
      indice: row.indice,
      file_name: row.file_name,
      cod_obra: row.cod_obra,
      origen: row.origen,
      versionada: String(row.version || ''),
      Nivel: parseFloat(row.Nivel) || 0,
      EDT: row.EDT || '',
      codigo: row.codigo || '',
      codigo2: row.codigo2 || '',
      ud: row.ud || '',
      resumen: row.resumen || '',
      Resumen2: row.Resumen2 || '',
      UserText: row.UserText || '',
      UserText1: row.UserText1 || '',
      UserNumber: parseFloat(row.UserNumber) || 0,
      Nota: row.Nota || '',
      nat: row.nat || '',
      CodSup: row.CodSup || '',
      CodInf: row.CodInf || '',
      Guid_SGI: row.Guid_SGI || '',
      Cap_SIS: row.Cap_SIS || '',
      clave_compuesta: row.clave_compuesta || '',
      clave_compuesta_cto: row.clave_compuesta_cto || '',
      inserted_at: row.inserted_at,
      plan_guid: row.plan_guid || '',

      Contrato_v0_cant: c0.canpres,
      Contrato_v0_cantdescomp: 0,
      Contrato_v0_precio: c0.pres,
      Contrato_v0_importe: c0.imppres,
      Contrato_v0_tipo: '',

      Contrato_v1_cant: c1.canpres,
      Contrato_v1_cantdescomp: 0,
      Contrato_v1_precio: c1.pres,
      Contrato_v1_importe: c1.imppres,
      Contrato_v1_tipo: '',

      Contrato_v2_cant: c2.canpres,
      Contrato_v2_cantdescomp: 0,
      Contrato_v2_precio: c2.pres,
      Contrato_v2_importe: c2.imppres,
      Contrato_v2_tipo: '',

      Coste_v0_cant: t0.canpres,
      Coste_v0_cantdescomp: 0,
      Coste_v0_precio: t0.pres,
      Coste_v0_importe: t0.imppres,
      Coste_v0_tipo: '',

      Coste_v1_cant: t1.canpres,
      Coste_v1_cantdescomp: 0,
      Coste_v1_precio: t1.pres,
      Coste_v1_importe: t1.imppres,
      Coste_v1_tipo: '',

      Coste_v2_cant: t2.canpres,
      Coste_v2_cantdescomp: 0,
      Coste_v2_precio: t2.pres,
      Coste_v2_importe: t2.imppres,
      Coste_v2_tipo: '',
    };
  });

  // Ajustar importes y precios de descompuestos
  const adjustDecompositionPrices = (data: AnalisisDetallado[], coeficienteK: number, refVersion: number) => {
    data.forEach(partida => {
      if (partida.nat === 'Partida') {
        // Encontrar hijos por codigo o Guid_SGI del padre
        const hijos = data.filter(row => row.CodSup === partida.codigo || row.CodSup === partida.Guid_SGI);

        if (hijos.length > 0) {
          const versions = [
            { prefix: 'Contrato_v0', precioContrato: partida.Contrato_v0_precio },
            { prefix: 'Contrato_v1', precioContrato: partida.Contrato_v1_precio },
            { prefix: 'Contrato_v2', precioContrato: partida.Contrato_v2_precio },
          ];

          // Todas las versiones de contrato se reparten usando los pesos de la versión de COSTE SELECCIONADA
          const costRefKey = `Coste_v${refVersion}_importe`;

          versions.forEach(({ prefix, precioContrato }) => {
            if (precioContrato > 0) {
              const sumaImportesCosteHijosK = hijos.reduce((sum, hijo) => {
                const importeCoste = (hijo as any)[costRefKey] || 0;
                return sum + (importeCoste * coeficienteK);
              }, 0);

              if (sumaImportesCosteHijosK > 0) {
                hijos.forEach(hijo => {
                  const importeCosteHijo = (hijo as any)[costRefKey] || 0;
                  const importeCosteHijoK = importeCosteHijo * coeficienteK;

                  // La cantidad se toma de la misma versión de coste de referencia
                  const cantidadCosteHijo = (hijo as any)[`Coste_v${refVersion}_cant`] || 0;

                  if (importeCosteHijoK > 0) {
                    const proporcion = importeCosteHijoK / sumaImportesCosteHijosK;
                    const importeContratoHijo = proporcion * precioContrato;

                    (hijo as any)[`${prefix}_importe`] = importeContratoHijo;
                    (hijo as any)[`${prefix}_cant`] = cantidadCosteHijo;

                    if (cantidadCosteHijo > 0) {
                      (hijo as any)[`${prefix}_precio`] = importeContratoHijo / cantidadCosteHijo;
                    }
                  }
                });
              }
            }
          });
        }
      }
    });

    return data;
  };

  return adjustDecompositionPrices(preliminaryData, coefK, costeRefVersion);
}

export async function fetchCapitulosPorCodSup(codSup?: string): Promise<AnalisisDetallado[]> {
  const allData = await fetchAnalisisDetallado();

  if (codSup) {
    return allData.filter(d => d.CodSup === codSup);
  } else {
    return allData.filter(d => !d.CodSup || d.CodSup === '');
  }
}

export async function fetchObras(): Promise<Array<{ cod_obra: string; version: number }>> {
  const { data, error } = await supabase
    .from('base_datos_sgi')
    .select('cod_obra, version')
    .order('cod_obra', { ascending: true })
    .order('version', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener obras: ${error.message}`);
  }

  const obraVersionMap = new Map<string, Set<number>>();

  data?.forEach(row => {
    if (!obraVersionMap.has(row.cod_obra)) {
      obraVersionMap.set(row.cod_obra, new Set());
    }
    obraVersionMap.get(row.cod_obra)!.add(row.version);
  });

  const result: Array<{ cod_obra: string; version: number }> = [];
  obraVersionMap.forEach((versions, cod_obra) => {
    versions.forEach(version => {
      result.push({ cod_obra, version });
    });
  });

  return result;
}

export async function fetchCoefK(codObra: string, version: number): Promise<number> {
  const { data, error } = await supabase
    .from('base_datos_sgi')
    .select('coef_k')
    .eq('cod_obra', codObra)
    .eq('version', version)
    .eq('origen', 'COSTE')
    .maybeSingle();

  if (error) {
    console.error('Error al obtener coef_k:', error);
    return 1.0;
  }

  return data?.coef_k || 1.0;
}

export async function saveCoefK(codObra: string, version: number, coefK: number): Promise<void> {
  const { error, count } = await supabase
    .from('base_datos_sgi')
    .update({ coef_k: coefK }, { count: 'exact' })
    .eq('cod_obra', codObra)
    .eq('version', version)
    .eq('origen', 'COSTE');

  if (error) {
    throw new Error(`Error al guardar coef_k: ${error.message}`);
  }

  if (count === 0) {
    throw new Error(`No se encontró registro (Obra: ${codObra}, V: ${version}). Verifique que el Origen sea 'COSTE'.`);
  }
}

export async function fetchPlanificacionData(codObra: string): Promise<PlanificacionData[]> {
  const [analisisData, planifQuery] = await Promise.all([
    fetchAnalisisDetallado(codObra),
    supabase
      .from('lineas_planin')
      .select('plan_guid, comienzo, fin, duracion')
      .eq('cod_obra', codObra)
  ]);

  if (planifQuery.error) {
    console.error('Error al obtener datos de planificación:', planifQuery.error);
  }

  const planifMap = new Map<string, { comienzo: string; fin: string; duracion: number }>();
  if (planifQuery.data) {
    planifQuery.data.forEach(item => {
      if (item.plan_guid && item.comienzo && item.fin) {
        planifMap.set(item.plan_guid, {
          comienzo: item.comienzo,
          fin: item.fin,
          duracion: item.duracion || 0
        });
      }
    });
  }

  return analisisData.map(row => {
    const planData = planifMap.get(row.plan_guid);
    return {
      ...row,
      comienzo: planData?.comienzo || null,
      fin: planData?.fin || null,
      duracion: planData?.duracion || null
    };
  });
}
