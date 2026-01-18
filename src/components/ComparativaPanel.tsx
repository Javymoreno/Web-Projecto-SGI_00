import { AnalisisDetallado } from '../lib/supabase';

interface ComparativaPanelProps {
  data: AnalisisDetallado[];
  version: number;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
}

function calculateVariance(contrato: number, coste: number): number {
  if (!contrato || contrato === 0) return 0;
  return ((coste - contrato) / contrato) * 100;
}

export default function ComparativaPanel({ data, version }: ComparativaPanelProps) {
  const getContratoImporte = (item: AnalisisDetallado): number => {
    switch (version) {
      case 0: return item.Contrato_v0_importe || 0;
      case 1: return item.Contrato_v1_importe || 0;
      case 2: return item.Contrato_v2_importe || 0;
      default: return 0;
    }
  };

  const getCosteImporte = (item: AnalisisDetallado): number => {
    switch (version) {
      case 0: return item.Coste_v0_importe || 0;
      case 1: return item.Coste_v1_importe || 0;
      case 2: return item.Coste_v2_importe || 0;
      default: return 0;
    }
  };

  const totalContrato = data.reduce((sum, item) => sum + getContratoImporte(item), 0);
  const totalCoste = data.reduce((sum, item) => sum + getCosteImporte(item), 0);
  const totalVarianza = totalContrato ? ((totalCoste - totalContrato) / totalContrato) * 100 : 0;

  const nivel1Items = data.filter(item => item.Nivel === 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Comparativa Contrato vs Coste - Versión {version}
        </h2>
      </div>

      <div className="p-6">
        <div className="mb-6 bg-slate-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Totales Generales</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-500">Total Contrato</label>
              <p className="text-lg font-semibold text-blue-700">
                {formatCurrency(totalContrato)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Total Coste</label>
              <p className="text-lg font-semibold text-amber-700">
                {formatCurrency(totalCoste)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Diferencia</label>
              <p className={`text-lg font-semibold ${
                totalCoste - totalContrato > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(totalCoste - totalContrato)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Varianza</label>
              <p className={`text-lg font-semibold ${
                totalVarianza > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {totalVarianza.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-350px)]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 border-b border-slate-200">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 border-b border-slate-200">
                  Descripción
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 border-b border-slate-200">
                  Contrato
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 border-b border-slate-200">
                  Coste
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 border-b border-slate-200">
                  Diferencia
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 border-b border-slate-200">
                  Varianza %
                </th>
              </tr>
            </thead>
            <tbody>
              {nivel1Items.map((item) => {
                const contrato = getContratoImporte(item);
                const coste = getCosteImporte(item);
                const diferencia = coste - contrato;
                const varianza = calculateVariance(contrato, coste);

                return (
                  <tr key={item.Guid_SGI} className="hover:bg-slate-50 border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {item.codigo}
                      {item.codigo2 && <span className="text-xs text-slate-400 ml-2">({item.codigo2})</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {item.resumen}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-blue-700">
                      {formatCurrency(contrato)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-amber-700">
                      {formatCurrency(coste)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      diferencia > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(diferencia)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      varianza > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {varianza.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
