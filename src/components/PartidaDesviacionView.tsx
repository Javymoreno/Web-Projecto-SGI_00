import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { AnalisisDetallado } from '../lib/supabase';

interface PartidaDesviacionViewProps {
  data: AnalisisDetallado[];
  analisisVersion: number;
  contratoVersion: number;
  costeVersion: number;
  coefK: number;
}

interface ColumnWidths {
  codigo: number;
  descripcion: number;
  nat: number;
  ud: number;
  contratoCant: number;
  contratoPrecio: number;
  contratoImporte: number;
  costeCant: number;
  costePrecio: number;
  costePrecioK: number;
  costeImporteK: number;
  difMedicion: number;
  difImporte: number;
  varianza: number;
}

function formatNumber(num: number | string | null | undefined): string {
  const value = typeof num === 'string' ? parseFloat(num) : (num ?? 0);
  if (isNaN(value)) return '0,00';

  const parts = value.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
}

function PartidaRow({
  item,
  contratoVersion,
  costeVersion,
  coefK,
  columnWidths
}: {
  item: AnalisisDetallado;
  contratoVersion: number;
  costeVersion: number;
  coefK: number;
  columnWidths: ColumnWidths;
}) {
  const contratoKey = `Contrato_v${contratoVersion}` as const;
  const costeKey = `Coste_v${costeVersion}` as const;

  const contratoTipo = (item as any)[`${contratoKey}_tipo`] || '';
  const costeTipo = (item as any)[`${costeKey}_tipo`] || '';

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

  let costeCant = parseFloat((item as any)[`${costeKey}_cant`]) || 0;
  const costeCantDescomp = parseFloat((item as any)[`${costeKey}_cantdescomp`]);
  if (costeTipo === 'Descompuesto') {
    costeCant = costeCantDescomp || 0;
  }
  const costePrecio = parseFloat((item as any)[`${costeKey}_precio`]) || 0;
  let costeImporte = parseFloat((item as any)[`${costeKey}_importe`]) || 0;
  if (costeTipo === 'Descompuesto') {
    costeImporte = costeCant * costePrecio;
  }

  const costePrecioK = costePrecio * coefK;
  const costeImporteK = costeCant * costePrecioK;

  const difMedicion = costeCant - contratoCant;
  const difImporte = contratoImporte - costeImporteK;
  const varianza = contratoImporte !== 0 ? ((difImporte / contratoImporte) * 100) : 0;

  const getDiferenciaColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-100">
      <td className="sticky left-0 bg-white py-2 px-3 text-sm" style={{ width: `${columnWidths.codigo}px` }}>
        <div className="flex items-center">
          <span className="text-xs text-slate-500 mr-2">N{item.Nivel}</span>
          <span className="font-medium font-mono text-slate-700">{item.codigo}</span>
          {item.codigo2 && <span className="text-xs text-slate-400 ml-2">({item.codigo2})</span>}
        </div>
      </td>
      <td className="py-2 px-3 text-xs text-center text-slate-600" style={{ width: `${columnWidths.nat}px` }}>
        {item.nat}
      </td>
      <td className="py-2 px-3 text-sm text-slate-900" style={{ width: `${columnWidths.descripcion}px` }}>
        {item.resumen}
      </td>
      <td className="py-2 px-3 text-xs text-center text-slate-600" style={{ width: `${columnWidths.ud}px` }}>
        {item.ud}
      </td>

      <td className="py-2 px-3 text-sm text-right font-mono bg-blue-50" style={{ width: `${columnWidths.contratoCant}px` }}>
        {formatNumber(contratoCant)}
      </td>
      <td className="py-2 px-3 text-sm text-right font-mono bg-blue-50" style={{ width: `${columnWidths.contratoPrecio}px` }}>
        {formatNumber(contratoPrecio)}
      </td>
      <td className="py-2 px-3 text-sm text-right font-mono font-semibold bg-blue-50" style={{ width: `${columnWidths.contratoImporte}px` }}>
        {formatNumber(contratoImporte)}
      </td>

      <td className="py-2 px-3 text-sm text-right font-mono bg-amber-50" style={{ width: `${columnWidths.costeCant}px` }}>
        {formatNumber(costeCant)}
      </td>
      <td className="py-2 px-3 text-sm text-right font-mono bg-amber-50" style={{ width: `${columnWidths.costePrecio}px` }}>
        {formatNumber(costePrecio)}
      </td>
      <td className="py-2 px-3 text-sm text-right font-mono bg-amber-50" style={{ width: `${columnWidths.costePrecioK}px` }}>
        {formatNumber(costePrecioK)}
      </td>
      <td className="py-2 px-3 text-sm text-right font-mono font-semibold bg-amber-50" style={{ width: `${columnWidths.costeImporteK}px` }}>
        {formatNumber(costeImporteK)}
      </td>

      <td className={`py-2 px-3 text-sm text-right font-mono ${getDiferenciaColor(difMedicion)}`} style={{ width: `${columnWidths.difMedicion}px` }}>
        {formatNumber(difMedicion)}
      </td>
      <td className={`py-2 px-3 text-sm text-right font-mono font-semibold ${getDiferenciaColor(difImporte)}`} style={{ width: `${columnWidths.difImporte}px` }}>
        {formatNumber(difImporte)}
      </td>
      <td className={`py-2 px-3 text-sm text-right font-mono ${getDiferenciaColor(varianza)}`} style={{ width: `${columnWidths.varianza}px` }}>
        {formatNumber(varianza)}%
      </td>
    </tr>
  );
}

function ResizableHeader({
  children,
  columnKey,
  columnWidths,
  onResize,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  columnKey: keyof ColumnWidths;
  columnWidths: ColumnWidths;
  onResize: (key: keyof ColumnWidths, width: number) => void;
  className?: string;
  rowSpan?: number;
  colSpan?: number;
}) {
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = columnWidths[columnKey];
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX.current;
      const newWidth = Math.max(60, startWidth.current + diff);
      onResize(columnKey, newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, columnKey, onResize]);

  return (
    <th
      className={`relative ${className}`}
      style={{ width: `${columnWidths[columnKey]}px` }}
      {...props}
    >
      {children}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 group"
        onMouseDown={handleMouseDown}
      >
        <div className="w-1 h-full group-hover:bg-blue-500 transition-colors" />
      </div>
    </th>
  );
}

type CriterioOrden = 'importe' | 'medicion';

export default function PartidaDesviacionView({ data, analisisVersion, contratoVersion, costeVersion, coefK }: PartidaDesviacionViewProps) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    codigo: 250,
    nat: 80,
    descripcion: 450,
    ud: 80,
    contratoCant: 130,
    contratoPrecio: 130,
    contratoImporte: 150,
    costeCant: 130,
    costePrecio: 130,
    costePrecioK: 130,
    costeImporteK: 150,
    difMedicion: 130,
    difImporte: 150,
    varianza: 130
  });

  const [criterioOrden, setCriterioOrden] = useState<CriterioOrden>('importe');

  const handleResize = (key: keyof ColumnWidths, width: number) => {
    setColumnWidths(prev => ({ ...prev, [key]: width }));
  };

  const contratoKey = `Contrato_v${contratoVersion}` as const;
  const costeKey = `Coste_v${costeVersion}` as const;

  const partidas = data.filter(item => item.nat === 'Partida');

  const partidasConCalculo = partidas.map(item => {
    const contratoTipo = (item as any)[`${contratoKey}_tipo`] || '';
    const costeTipo = (item as any)[`${costeKey}_tipo`] || '';

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

    let costeCant = parseFloat((item as any)[`${costeKey}_cant`]) || 0;
    const costeCantDescomp = parseFloat((item as any)[`${costeKey}_cantdescomp`]);
    if (costeTipo === 'Descompuesto') {
      costeCant = costeCantDescomp || 0;
    }
    const costePrecio = parseFloat((item as any)[`${costeKey}_precio`]) || 0;
    let costeImporte = parseFloat((item as any)[`${costeKey}_importe`]) || 0;
    if (costeTipo === 'Descompuesto') {
      costeImporte = costeCant * costePrecio;
    }

    const costePrecioK = costePrecio * coefK;
    const costeImporteK = costeCant * costePrecioK;

    const difMedicion = costeCant - contratoCant;
    const difImporte = contratoImporte - costeImporteK;

    return {
      item,
      difMedicion,
      difImporte,
      contratoImporte,
      costeImporteK
    };
  });

  const sortedByDif = [...partidasConCalculo].sort((a, b) => {
    if (criterioOrden === 'importe') {
      return a.difImporte - b.difImporte;
    } else {
      return a.difMedicion - b.difMedicion;
    }
  });

  const negativas = sortedByDif.filter(p =>
    criterioOrden === 'importe' ? p.difImporte < 0 : p.difMedicion < 0
  ).slice(0, 10);

  const positivas = sortedByDif.filter(p =>
    criterioOrden === 'importe' ? p.difImporte > 0 : p.difMedicion > 0
  ).slice(-10).reverse();

  const totalesNegativos = negativas.reduce((acc, p) => ({
    contrato: acc.contrato + p.contratoImporte,
    costeK: acc.costeK + p.costeImporteK,
    difImporte: acc.difImporte + p.difImporte,
    difMedicion: acc.difMedicion + p.difMedicion
  }), { contrato: 0, costeK: 0, difImporte: 0, difMedicion: 0 });

  const totalesPositivos = positivas.reduce((acc, p) => ({
    contrato: acc.contrato + p.contratoImporte,
    costeK: acc.costeK + p.costeImporteK,
    difImporte: acc.difImporte + p.difImporte,
    difMedicion: acc.difMedicion + p.difMedicion
  }), { contrato: 0, costeK: 0, difImporte: 0, difMedicion: 0 });

  const varianzaNegativos = totalesNegativos.contrato !== 0
    ? ((totalesNegativos.difImporte / totalesNegativos.contrato) * 100)
    : 0;

  const varianzaPositivos = totalesPositivos.contrato !== 0
    ? ((totalesPositivos.difImporte / totalesPositivos.contrato) * 100)
    : 0;

  const exportToExcel = () => {
    let csvContent = '\uFEFF';

    csvContent += 'Nivel;Código;Código 2;Nat.;Descripción;UD;';
    csvContent += `Contrato Cantidad;Contrato Precio;Contrato Importe;`;
    csvContent += `Coste Cantidad;Coste Precio;Coste Precio.K;Coste Importe.K;`;
    csvContent += `Dif.Medición;Dif.Importe;Varianza %\n`;

    const addRowToCSV = (p: typeof partidasConCalculo[0]) => {
      const item = p.item;
      const escapeCsv = (val: string | number | null | undefined) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const contratoTipo = (item as any)[`${contratoKey}_tipo`] || '';
      const costeTipo = (item as any)[`${costeKey}_tipo`] || '';

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

      let costeCant = parseFloat((item as any)[`${costeKey}_cant`]) || 0;
      const costeCantDescomp = parseFloat((item as any)[`${costeKey}_cantdescomp`]);
      if (costeTipo === 'Descompuesto') {
        costeCant = costeCantDescomp || 0;
      }
      const costePrecio = parseFloat((item as any)[`${costeKey}_precio`]) || 0;
      let costeImporte = parseFloat((item as any)[`${costeKey}_importe`]) || 0;
      if (costeTipo === 'Descompuesto') {
        costeImporte = costeCant * costePrecio;
      }

      const costePrecioK = costePrecio * coefK;
      const costeImporteK = costeCant * costePrecioK;
      const difMedicion = costeCant - contratoCant;
      const difImporte = contratoImporte - costeImporteK;
      const varianza = contratoImporte !== 0 ? ((difImporte / contratoImporte) * 100) : 0;

      csvContent += `${item.Nivel};${escapeCsv(item.codigo)};${escapeCsv(item.codigo2)};${escapeCsv(item.nat)};${escapeCsv(item.resumen)};${escapeCsv(item.ud)};`;
      csvContent += `${formatNumber(contratoCant)};${formatNumber(contratoPrecio)};${formatNumber(contratoImporte)};`;
      csvContent += `${formatNumber(costeCant)};${formatNumber(costePrecio)};${formatNumber(costePrecioK)};${formatNumber(costeImporteK)};`;
      csvContent += `${formatNumber(difMedicion)};${formatNumber(difImporte)};${formatNumber(varianza)}\n`;
    };

    csvContent += '\nDESVIACIÓN NEGATIVA\n';
    negativas.forEach(p => addRowToCSV(p));
    csvContent += `;;;;TOTALES;;;${formatNumber(totalesNegativos.contrato)};`;
    csvContent += `;;;${formatNumber(totalesNegativos.costeK)};`;
    csvContent += `${formatNumber(totalesNegativos.difMedicion)};${formatNumber(totalesNegativos.difImporte)};${formatNumber(varianzaNegativos)}\n`;

    csvContent += '\nDESVIACIÓN POSITIVA\n';
    positivas.forEach(p => addRowToCSV(p));
    csvContent += `;;;;TOTALES;;;${formatNumber(totalesPositivos.contrato)};`;
    csvContent += `;;;${formatNumber(totalesPositivos.costeK)};`;
    csvContent += `${formatNumber(totalesPositivos.difMedicion)};${formatNumber(totalesPositivos.difImporte)};${formatNumber(varianzaPositivos)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `partidas_desviacion_${timestamp}.csv`;

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
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Partidas con mayor Desviación
            </h2>
            <div>
              <label className="text-sm text-slate-600 mr-2">Ordenar por:</label>
              <select
                value={criterioOrden}
                onChange={(e) => setCriterioOrden(e.target.value as CriterioOrden)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="importe">Dif. Importe</option>
                <option value="medicion">Dif. Medición</option>
              </select>
            </div>
          </div>
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

      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
        <table className="border-collapse w-full">
          <thead className="sticky top-0 bg-slate-100 z-10">
            <tr className="border-b-2 border-slate-300">
              <ResizableHeader
                columnKey="codigo"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="sticky left-0 bg-slate-100 py-3 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                rowSpan={2}
              >
                Código
              </ResizableHeader>
              <ResizableHeader
                columnKey="nat"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-3 px-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider"
                rowSpan={2}
              >
                Nat.
              </ResizableHeader>
              <ResizableHeader
                columnKey="descripcion"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-3 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                rowSpan={2}
              >
                Descripción
              </ResizableHeader>
              <ResizableHeader
                columnKey="ud"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-3 px-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider"
                rowSpan={2}
              >
                UD
              </ResizableHeader>

              <th className="py-2 px-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider bg-blue-100 border-l border-slate-300" colSpan={3}>
                Contrato (v{contratoVersion})
              </th>

              <th className="py-2 px-3 text-center text-xs font-semibold text-amber-700 uppercase tracking-wider bg-amber-100 border-l border-slate-300" colSpan={4}>
                Coste (v{costeVersion})
              </th>

              <ResizableHeader
                columnKey="difMedicion"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-3 px-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-l border-slate-300"
                rowSpan={2}
              >
                Dif.Medición
              </ResizableHeader>
              <ResizableHeader
                columnKey="difImporte"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-3 px-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider"
                rowSpan={2}
              >
                Dif.Importe
              </ResizableHeader>
              <ResizableHeader
                columnKey="varianza"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-3 px-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider"
                rowSpan={2}
              >
                Varianza %
              </ResizableHeader>
            </tr>
            <tr className="border-b border-slate-300">
              <ResizableHeader
                columnKey="contratoCant"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-blue-50 border-l border-slate-300"
              >
                Cantidad
              </ResizableHeader>
              <ResizableHeader
                columnKey="contratoPrecio"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-blue-50"
              >
                Precio
              </ResizableHeader>
              <ResizableHeader
                columnKey="contratoImporte"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-blue-50"
              >
                Importe
              </ResizableHeader>

              <ResizableHeader
                columnKey="costeCant"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-amber-50 border-l border-slate-300"
              >
                Cantidad
              </ResizableHeader>
              <ResizableHeader
                columnKey="costePrecio"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-amber-50"
              >
                Precio
              </ResizableHeader>
              <ResizableHeader
                columnKey="costePrecioK"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-amber-50"
              >
                Precio.K
              </ResizableHeader>
              <ResizableHeader
                columnKey="costeImporteK"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-amber-50"
              >
                Importe.K
              </ResizableHeader>
            </tr>
          </thead>
          <tbody>
            {negativas.length === 0 && positivas.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-8 text-center text-slate-500">
                  No hay partidas disponibles
                </td>
              </tr>
            ) : (
              <>
                {negativas.length > 0 && (
                  <>
                    <tr className="bg-red-100 border-t-2 border-red-400">
                      <td colSpan={14} className="py-3 px-3 text-sm font-bold text-red-800">
                        DESVIACIÓN NEGATIVA (10 Partidas con mayor desviación negativa por {criterioOrden === 'importe' ? 'Importe' : 'Medición'})
                      </td>
                    </tr>
                    {negativas.map((p) => (
                      <PartidaRow
                        key={p.item.Guid_SGI}
                        item={p.item}
                        contratoVersion={contratoVersion}
                        costeVersion={costeVersion}
                        coefK={coefK}
                        columnWidths={columnWidths}
                      />
                    ))}
                    <tr className="bg-red-50 border-t-2 border-red-300 font-bold">
                      <td colSpan={4} className="sticky left-0 bg-red-50 py-3 px-3 text-sm text-slate-900">
                        TOTAL DESVIACIÓN NEGATIVA
                      </td>
                      <td colSpan={2} className="py-3 px-3"></td>
                      <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-blue-100" style={{ width: `${columnWidths.contratoImporte}px` }}>
                        {formatNumber(totalesNegativos.contrato)}
                      </td>
                      <td colSpan={3} className="py-3 px-3"></td>
                      <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-amber-100" style={{ width: `${columnWidths.costeImporteK}px` }}>
                        {formatNumber(totalesNegativos.costeK)}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-mono font-bold text-red-600" style={{ width: `${columnWidths.difMedicion}px` }}>
                        {formatNumber(totalesNegativos.difMedicion)}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-mono font-bold text-red-600" style={{ width: `${columnWidths.difImporte}px` }}>
                        {formatNumber(totalesNegativos.difImporte)}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-mono text-red-600" style={{ width: `${columnWidths.varianza}px` }}>
                        {formatNumber(varianzaNegativos)}%
                      </td>
                    </tr>
                  </>
                )}

                {positivas.length > 0 && (
                  <>
                    <tr className="bg-green-100 border-t-2 border-green-400">
                      <td colSpan={14} className="py-3 px-3 text-sm font-bold text-green-800">
                        DESVIACIÓN POSITIVA (10 Partidas con mayor desviación positiva por {criterioOrden === 'importe' ? 'Importe' : 'Medición'})
                      </td>
                    </tr>
                    {positivas.map((p) => (
                      <PartidaRow
                        key={p.item.Guid_SGI}
                        item={p.item}
                        contratoVersion={contratoVersion}
                        costeVersion={costeVersion}
                        coefK={coefK}
                        columnWidths={columnWidths}
                      />
                    ))}
                    <tr className="bg-green-50 border-t-2 border-green-300 font-bold">
                      <td colSpan={4} className="sticky left-0 bg-green-50 py-3 px-3 text-sm text-slate-900">
                        TOTAL DESVIACIÓN POSITIVA
                      </td>
                      <td colSpan={2} className="py-3 px-3"></td>
                      <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-blue-100" style={{ width: `${columnWidths.contratoImporte}px` }}>
                        {formatNumber(totalesPositivos.contrato)}
                      </td>
                      <td colSpan={3} className="py-3 px-3"></td>
                      <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-amber-100" style={{ width: `${columnWidths.costeImporteK}px` }}>
                        {formatNumber(totalesPositivos.costeK)}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-mono font-bold text-green-600" style={{ width: `${columnWidths.difMedicion}px` }}>
                        {formatNumber(totalesPositivos.difMedicion)}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-mono font-bold text-green-600" style={{ width: `${columnWidths.difImporte}px` }}>
                        {formatNumber(totalesPositivos.difImporte)}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-mono text-green-600" style={{ width: `${columnWidths.varianza}px` }}>
                        {formatNumber(varianzaPositivos)}%
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
