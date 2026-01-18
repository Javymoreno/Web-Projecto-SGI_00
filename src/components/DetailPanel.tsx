import { AnalisisDetallado } from '../lib/supabase';

interface DetailPanelProps {
  item: AnalisisDetallado | null;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function DetailPanel({ item }: DetailPanelProps) {
  if (!item) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <p className="text-center text-slate-500">
          Selecciona un elemento de la estructura para ver sus detalles
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Detalles del Elemento
        </h2>
      </div>

      <div className="p-6 space-y-6 overflow-auto max-h-[calc(100vh-200px)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Información General
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">Código</label>
              <p className="text-sm font-mono font-medium text-slate-900">{item.codigo}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Código 2</label>
              <p className="text-sm font-mono font-medium text-slate-900">{item.codigo2 || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Nivel</label>
              <p className="text-sm font-medium text-slate-900">{item.Nivel}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500">Resumen</label>
              <p className="text-sm text-slate-900">{item.resumen}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Unidad</label>
              <p className="text-sm text-slate-900">{item.ud || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Naturaleza</label>
              <p className="text-sm text-slate-900">{item.nat || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">EDT</label>
              <p className="text-sm font-mono text-slate-900">{item.EDT || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Cap SIS</label>
              <p className="text-sm text-slate-900">{item.Cap_SIS || '-'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Contrato - Versión 0
          </h3>
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs text-slate-500">Cantidad</label>
              <p className="text-sm font-medium text-slate-900">
                {formatNumber(item.Contrato_v0_cant)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Precio</label>
              <p className="text-sm font-medium text-slate-900">
                {formatCurrency(item.Contrato_v0_precio)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Importe</label>
              <p className="text-sm font-semibold text-blue-700">
                {formatCurrency(item.Contrato_v0_importe)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Contrato - Versión 1
          </h3>
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs text-slate-500">Cantidad</label>
              <p className="text-sm font-medium text-slate-900">
                {formatNumber(item.Contrato_v1_cant)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Precio</label>
              <p className="text-sm font-medium text-slate-900">
                {formatCurrency(item.Contrato_v1_precio)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Importe</label>
              <p className="text-sm font-semibold text-blue-700">
                {formatCurrency(item.Contrato_v1_importe)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Contrato - Versión 2
          </h3>
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs text-slate-500">Cantidad</label>
              <p className="text-sm font-medium text-slate-900">
                {formatNumber(item.Contrato_v2_cant)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Precio</label>
              <p className="text-sm font-medium text-slate-900">
                {formatCurrency(item.Contrato_v2_precio)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Importe</label>
              <p className="text-sm font-semibold text-blue-700">
                {formatCurrency(item.Contrato_v2_importe)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Coste - Versión 0
          </h3>
          <div className="grid grid-cols-3 gap-4 bg-amber-50 p-4 rounded-lg">
            <div>
              <label className="text-xs text-slate-500">Cantidad</label>
              <p className="text-sm font-medium text-slate-900">
                {formatNumber(item.Coste_v0_cant)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Precio</label>
              <p className="text-sm font-medium text-slate-900">
                {formatCurrency(item.Coste_v0_precio)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Importe</label>
              <p className="text-sm font-semibold text-amber-700">
                {formatCurrency(item.Coste_v0_importe)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Coste - Versión 1
          </h3>
          <div className="grid grid-cols-3 gap-4 bg-amber-50 p-4 rounded-lg">
            <div>
              <label className="text-xs text-slate-500">Cantidad</label>
              <p className="text-sm font-medium text-slate-900">
                {formatNumber(item.Coste_v1_cant)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Precio</label>
              <p className="text-sm font-medium text-slate-900">
                {formatCurrency(item.Coste_v1_precio)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Importe</label>
              <p className="text-sm font-semibold text-amber-700">
                {formatCurrency(item.Coste_v1_importe)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Coste - Versión 2
          </h3>
          <div className="grid grid-cols-3 gap-4 bg-amber-50 p-4 rounded-lg">
            <div>
              <label className="text-xs text-slate-500">Cantidad</label>
              <p className="text-sm font-medium text-slate-900">
                {formatNumber(item.Coste_v2_cant)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Precio</label>
              <p className="text-sm font-medium text-slate-900">
                {formatCurrency(item.Coste_v2_precio)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Importe</label>
              <p className="text-sm font-semibold text-amber-700">
                {formatCurrency(item.Coste_v2_importe)}
              </p>
            </div>
          </div>
        </div>

        {item.Nota && (
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Notas</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.Nota}</p>
          </div>
        )}
      </div>
    </div>
  );
}
