import { AnalisisDetallado } from './supabase';
import { DataQualityIssue } from '../components/DataQualityWarning';

interface VersionStats {
  version: number;
  totalRows: number;
  partidasCount: number;
  capitulosCount: number;
  rowsWithData: number;
  rowsWithZeroImporte: number;
  avgImportePerRow: number;
}

export function analyzeDataQuality(
  data: AnalisisDetallado[],
  contratoVersions: number[],
  costeVersions: number[],
  context: 'contrato' | 'coste' | 'both' = 'both'
): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  if (data.length === 0) {
    issues.push({
      severity: 'error',
      title: 'No hay datos disponibles',
      message: 'No se han cargado datos para esta obra. Verifica la conexión y la disponibilidad de datos en la base de datos.'
    });
    return issues;
  }

  if (context === 'contrato' || context === 'both') {
    const contratoStats = analyzeContratoVersions(data, contratoVersions);
    issues.push(...detectContratoIssues(contratoStats));
  }

  if (context === 'coste' || context === 'both') {
    const costeStats = analyzeCosteVersions(data, costeVersions);
    issues.push(...detectCosteIssues(costeStats));
  }

  return issues;
}

function analyzeContratoVersions(data: AnalisisDetallado[], versions: number[]): VersionStats[] {
  return versions.map(version => {
    const versionKey = `Contrato_v${version}` as const;
    const partidasData = data.filter(d => d.nat === 'Partida');

    const rowsWithData = partidasData.filter(d => {
      const importe = (d as any)[`${versionKey}_importe`] || 0;
      return importe > 0;
    }).length;

    const rowsWithZeroImporte = partidasData.filter(d => {
      const importe = (d as any)[`${versionKey}_importe`] || 0;
      return importe === 0;
    }).length;

    const totalImporte = partidasData.reduce((sum, d) => {
      return sum + ((d as any)[`${versionKey}_importe`] || 0);
    }, 0);

    return {
      version,
      totalRows: data.length,
      partidasCount: partidasData.length,
      capitulosCount: data.filter(d => d.nat === 'Capítulo').length,
      rowsWithData,
      rowsWithZeroImporte,
      avgImportePerRow: rowsWithData > 0 ? totalImporte / rowsWithData : 0
    };
  });
}

function analyzeCosteVersions(data: AnalisisDetallado[], versions: number[]): VersionStats[] {
  return versions.map(version => {
    const versionKey = `Coste_v${version}` as const;
    const partidasData = data.filter(d => d.nat === 'Partida');

    const rowsWithData = partidasData.filter(d => {
      const importe = (d as any)[`${versionKey}_importe`] || 0;
      return importe > 0;
    }).length;

    const rowsWithZeroImporte = partidasData.filter(d => {
      const importe = (d as any)[`${versionKey}_importe`] || 0;
      return importe === 0;
    }).length;

    const totalImporte = partidasData.reduce((sum, d) => {
      return sum + ((d as any)[`${versionKey}_importe`] || 0);
    }, 0);

    return {
      version,
      totalRows: data.length,
      partidasCount: partidasData.length,
      capitulosCount: data.filter(d => d.nat === 'Capítulo').length,
      rowsWithData,
      rowsWithZeroImporte,
      avgImportePerRow: rowsWithData > 0 ? totalImporte / rowsWithData : 0
    };
  });
}

function detectContratoIssues(stats: VersionStats[]): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  if (stats.length < 2) {
    return issues;
  }

  const baseVersion = stats[0];

  for (let i = 1; i < stats.length; i++) {
    const currentVersion = stats[i];

    const dataReductionPercent = baseVersion.rowsWithData > 0
      ? ((baseVersion.rowsWithData - currentVersion.rowsWithData) / baseVersion.rowsWithData) * 100
      : 0;

    if (dataReductionPercent > 50) {
      const details = [
        `Versión ${baseVersion.version}: ${baseVersion.rowsWithData} partidas con datos`,
        `Versión ${currentVersion.version}: ${currentVersion.rowsWithData} partidas con datos`,
        `Reducción: ${dataReductionPercent.toFixed(1)}%`,
        `Partidas sin importe en v${currentVersion.version}: ${currentVersion.rowsWithZeroImporte}`
      ];

      issues.push({
        severity: dataReductionPercent > 80 ? 'error' : 'warning',
        title: `Datos incompletos en Contrato versión ${currentVersion.version}`,
        message: `La versión ${currentVersion.version} tiene significativamente menos datos que la versión ${baseVersion.version}. Esto puede indicar una carga parcial o datos incompletos.`,
        details
      });
    }

    if (currentVersion.rowsWithZeroImporte > currentVersion.partidasCount * 0.8) {
      issues.push({
        severity: 'warning',
        title: `Muchas partidas sin importe en Contrato v${currentVersion.version}`,
        message: `El ${((currentVersion.rowsWithZeroImporte / currentVersion.partidasCount) * 100).toFixed(0)}% de las partidas tienen importe 0 o nulo.`,
        details: [
          `Total partidas: ${currentVersion.partidasCount}`,
          `Partidas sin importe: ${currentVersion.rowsWithZeroImporte}`,
          `Partidas con datos: ${currentVersion.rowsWithData}`
        ]
      });
    }
  }

  return issues;
}

function detectCosteIssues(stats: VersionStats[]): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  if (stats.length < 2) {
    return issues;
  }

  const baseVersion = stats[0];

  for (let i = 1; i < stats.length; i++) {
    const currentVersion = stats[i];

    const dataReductionPercent = baseVersion.rowsWithData > 0
      ? ((baseVersion.rowsWithData - currentVersion.rowsWithData) / baseVersion.rowsWithData) * 100
      : 0;

    if (dataReductionPercent > 50) {
      const details = [
        `Versión ${baseVersion.version}: ${baseVersion.rowsWithData} partidas con datos`,
        `Versión ${currentVersion.version}: ${currentVersion.rowsWithData} partidas con datos`,
        `Reducción: ${dataReductionPercent.toFixed(1)}%`,
        `Partidas sin importe en v${currentVersion.version}: ${currentVersion.rowsWithZeroImporte}`
      ];

      issues.push({
        severity: dataReductionPercent > 80 ? 'error' : 'warning',
        title: `Datos incompletos en Coste versión ${currentVersion.version}`,
        message: `La versión ${currentVersion.version} tiene significativamente menos datos que la versión ${baseVersion.version}. Esto puede indicar una carga parcial o datos incompletos.`,
        details
      });
    }

    if (currentVersion.rowsWithZeroImporte > currentVersion.partidasCount * 0.8) {
      issues.push({
        severity: 'warning',
        title: `Muchas partidas sin importe en Coste v${currentVersion.version}`,
        message: `El ${((currentVersion.rowsWithZeroImporte / currentVersion.partidasCount) * 100).toFixed(0)}% de las partidas tienen importe 0 o nulo.`,
        details: [
          `Total partidas: ${currentVersion.partidasCount}`,
          `Partidas sin importe: ${currentVersion.rowsWithZeroImporte}`,
          `Partidas con datos: ${currentVersion.rowsWithData}`
        ]
      });
    }
  }

  return issues;
}
