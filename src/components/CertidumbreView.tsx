import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { AnalisisDetallado } from '../lib/supabase';

interface CertidumbreViewProps {
  data: AnalisisDetallado[];
  analisisVersion: number;
  contratoVersion: number;
  costeVersion: number;
  coefK: number;
}

interface CertidumbreData {
  nivel: number;
  descripcion: string;
  rango: number;
  costePlanificado: number;
  costeOptimizado: number;
  costeEmpeorado: number;
}

function formatNumber(num: number | null | undefined): string {
  const value = num ?? 0;
  if (isNaN(value)) return '0,00';

  const parts = value.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
}

export default function CertidumbreView({ data, contratoVersion, costeVersion, coefK }: CertidumbreViewProps) {
  const [certidumbreData, setCertidumbreData] = useState<CertidumbreData[]>([]);
  const [totalVenta, setTotalVenta] = useState<number>(0);

  useEffect(() => {
    calcularCertidumbre();
  }, [data, costeVersion, coefK]);

  const calcularCertidumbre = () => {

    const certidumbreMap = new Map<number, number>();
    let sumaContrato = 0;
    let sumaVenta = 0;

    data.forEach(item => {
      if (item.nat !== 'Partida') return;

      // 1. Calcular Venta (Contrato) para TODOS los items
      const contratoKey = `Contrato_v${contratoVersion}` as const;
      const contratoTipo = (item as any)[`${contratoKey}_tipo`] || '';
      let contratoCant = parseFloat((item as any)[`${contratoKey}_cant`]) || 0;
      const contratoCantDescomp = parseFloat((item as any)[`${contratoKey}_cantdescomp`]);
      if (contratoTipo === 'Descompuesto') {
        contratoCant = contratoCantDescomp || 0;
      }
      const contratoPrecio = parseFloat((item as any)[`${contratoKey}_precio`]) || 0;
      let contratoImporte = parseFloat((item as any)[`${contratoKey}_importe`]) || 0;
      if (contratoTipo === 'Descompuesto') {
        contratoImporte = contratoCant * contratoPrecio;
      }

      sumaContrato += contratoImporte;
      sumaVenta += contratoImporte;

      // 2. Calcular Certidumbre (Coste con K)
      // Mapear NULL a 0
      const userNum = item.UserNumber === null ? 0 : Math.round(item.UserNumber || 0);

      if (userNum >= 0 && userNum <= 5) {
        const costeKey = `Coste_v${costeVersion}` as const;
        const costeTipo = (item as any)[`${costeKey}_tipo`] || '';
        let costeCant = parseFloat((item as any)[`${costeKey}_cant`]) || 0;
        const costeCantDescomp = parseFloat((item as any)[`${costeKey}_cantdescomp`]);
        if (costeTipo === 'Descompuesto') {
          costeCant = costeCantDescomp || 0;
        }
        const costePrecio = parseFloat((item as any)[`${costeKey}_precio`]) || 0;
        const costeImporteK = costeCant * costePrecio * coefK;

        const currentValue = certidumbreMap.get(userNum) || 0;
        certidumbreMap.set(userNum, currentValue + costeImporteK);
      }
    });

    const rangos: { [key: number]: { descripcion: string; rango: number } } = {
      0: { descripcion: 'SIN CLASIFICAR', rango: 25 },
      1: { descripcion: 'ESTIMACIÓN PERSONAL / K DE PASO', rango: 20 },
      2: { descripcion: 'BASES DE DATOS / PRECIOS SIMILARES DE OTRAS OBRAS / SIS', rango: 18 },
      3: { descripcion: 'OFERTAS RECIBIDAS EN ESTUDIOS', rango: 14 },
      4: { descripcion: 'COMPARATIVO CON UNA OFERTA', rango: 8 },
      5: { descripcion: 'COMPARATIVO CON MÁS DE UNA OFERTA', rango: 3 }
    };

    const resultado: CertidumbreData[] = [];

    for (let i = 0; i <= 5; i++) {
      const costePlanificado = certidumbreMap.get(i) || 0;
      const rangoInfo = rangos[i];
      const factor = rangoInfo.rango / 100;

      resultado.push({
        nivel: i,
        descripcion: rangoInfo.descripcion,
        rango: rangoInfo.rango,
        costePlanificado: costePlanificado,
        costeOptimizado: costePlanificado * (1 - factor),
        costeEmpeorado: costePlanificado * (1 + factor)
      });
    }

    setCertidumbreData(resultado);
    setTotalVenta(sumaVenta);
  };

  const totalCostePlanificado = certidumbreData.reduce((sum, item) => sum + item.costePlanificado, 0);
  const totalCosteOptimizado = certidumbreData.reduce((sum, item) => sum + item.costeOptimizado, 0);
  const totalCosteEmpeorado = certidumbreData.reduce((sum, item) => sum + item.costeEmpeorado, 0);

  const resultadoOptimizado = totalVenta - totalCosteOptimizado;
  const resultadoEmpeorado = totalVenta - totalCosteEmpeorado;
  const resultadoPlanificado = totalVenta - totalCostePlanificado;

  const exportToExcel = () => {
    let csvContent = '\uFEFF';

    csvContent += 'RANGO DE RESULTADO POR CERTIDUMBRE\n\n';
    csvContent += ';%Rango;Coste Planificado con Kpaso;Coste Optimizado;Coste Empeorado\n';

    certidumbreData.forEach(item => {
      csvContent += `${item.nivel}. ${item.descripcion};${item.rango}%;${formatNumber(item.costePlanificado)};${formatNumber(item.costeOptimizado)};${formatNumber(item.costeEmpeorado)}\n`;
    });

    csvContent += `\nCOSTE TOTAL;;${formatNumber(totalCostePlanificado)};${formatNumber(totalCosteOptimizado)};${formatNumber(totalCosteEmpeorado)}\n`;
    csvContent += `VENTA TOTAL;;${formatNumber(totalVenta)};${formatNumber(totalVenta)};${formatNumber(totalVenta)}\n`;
    csvContent += `RESULTADO TOTAL;;${formatNumber(resultadoPlanificado)};${formatNumber(resultadoOptimizado)};${formatNumber(resultadoEmpeorado)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `certidumbre_${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Certidumbre del Estudio de Coste
          </h2>
          <button
            onClick={exportToExcel}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
            title="Exportar a Excel"
          >
            <Download className="w-4 h-4" />
            Exportar a Excel
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <h3 className="text-md font-bold text-slate-800 mb-4 uppercase">
            RANGO DE RESULTADO POR CERTIDUMBRE
          </h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-400">
                <th className="py-3 px-4 text-left text-sm font-bold text-slate-700 bg-slate-100"></th>
                <th className="py-3 px-4 text-center text-sm font-bold text-slate-700 bg-slate-100">
                  %Rango
                </th>
                <th className="py-3 px-4 text-right text-sm font-bold text-slate-700 bg-slate-100">
                  Coste Planificado con Kpaso
                </th>
                <th className="py-3 px-4 text-right text-sm font-bold text-slate-700 bg-slate-100">
                  Coste Optimizado
                </th>
                <th className="py-3 px-4 text-right text-sm font-bold text-slate-700 bg-slate-100">
                  Coste Empeorado
                </th>
              </tr>
            </thead>
            <tbody>
              {certidumbreData.map((item) => (
                <tr key={item.nivel} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-800">
                    <span className="font-semibold">{item.nivel}.</span> {item.descripcion}
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-mono text-slate-700">
                    {item.rango}%
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-mono text-slate-800">
                    {formatNumber(item.costePlanificado)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-mono text-green-700">
                    {formatNumber(item.costeOptimizado)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-mono text-red-700">
                    {formatNumber(item.costeEmpeorado)}
                  </td>
                </tr>
              ))}

              <tr className="border-t-2 border-slate-400 bg-blue-50 font-bold">
                <td className="py-3 px-4 text-sm text-slate-900 uppercase">
                  COSTE TOTAL
                </td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right text-sm font-mono text-slate-900">
                  {formatNumber(totalCostePlanificado)}
                </td>
                <td className="py-3 px-4 text-right text-sm font-mono text-green-700">
                  {formatNumber(totalCosteOptimizado)}
                </td>
                <td className="py-3 px-4 text-right text-sm font-mono text-red-700">
                  {formatNumber(totalCosteEmpeorado)}
                </td>
              </tr>

              <tr className="bg-blue-50 font-bold">
                <td className="py-3 px-4 text-sm text-slate-900 uppercase">
                  VENTA TOTAL
                </td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right text-sm font-mono text-slate-900">
                  {formatNumber(totalVenta)}
                </td>
                <td className="py-3 px-4 text-right text-sm font-mono text-slate-900">
                  {formatNumber(totalVenta)}
                </td>
                <td className="py-3 px-4 text-right text-sm font-mono text-slate-900">
                  {formatNumber(totalVenta)}
                </td>
              </tr>

              <tr className="border-t-2 border-slate-400 bg-slate-200 font-bold">
                <td className="py-3 px-4 text-sm text-slate-900 uppercase">
                  RESULTADO TOTAL
                </td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right text-sm font-mono text-slate-900">
                  {formatNumber(resultadoPlanificado)}
                </td>
                <td className="py-3 px-4 text-right text-sm font-mono font-bold text-green-700">
                  {formatNumber(resultadoOptimizado)}
                </td>
                <td className="py-3 px-4 text-right text-sm font-mono font-bold text-red-700">
                  {formatNumber(resultadoEmpeorado)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Criterios de Certidumbre:</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><span className="font-semibold">0. Sin Clasificar:</span> Desviación ±25%</li>
              <li><span className="font-semibold">1. Estimación Personal / K de Paso:</span> Desviación ±20%</li>
              <li><span className="font-semibold">2. Bases de Datos / Precios Similares / SIS:</span> Desviación ±18%</li>
              <li><span className="font-semibold">3. Ofertas Recibidas en Estudios:</span> Desviación ±14%</li>
              <li><span className="font-semibold">4. Comparativo con Una Oferta:</span> Desviación ±8%</li>
              <li><span className="font-semibold">5. Comparativo con Más de Una Oferta:</span> Desviación ±3%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
