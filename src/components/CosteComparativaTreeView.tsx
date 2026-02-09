import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, Filter, Download } from 'lucide-react';
import { AnalisisDetallado } from '../lib/supabase';
import DataQualityWarning from './DataQualityWarning';
import { analyzeDataQuality } from '../lib/dataQuality';

interface CosteComparativaTreeViewProps {
  data: AnalisisDetallado[];
  costeVersion1: number;
  costeVersion2: number;
  coefK: number;
}

interface TreeNode extends AnalisisDetallado {
  children: TreeNode[];
}

interface ColumnWidths {
  codigo: number;
  descripcion: number;
  nat: number;
  ud: number;
  coste1Cant: number;
  coste1Precio: number;
  coste1PrecioK: number;
  coste1ImporteK: number;
  coste2Cant: number;
  coste2Precio: number;
  coste2PrecioK: number;
  coste2ImporteK: number;
  difMedicion: number;
  difImporte: number;
  varianza: number;
}

function buildTree(items: AnalisisDetallado[]): TreeNode[] {
  const itemMap = new Map<string, TreeNode>();
  const itemMapByCodigo = new Map<string, TreeNode>();
  const itemMapByCodInf = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  console.log('🔍 [Coste] BuildTree: Total items received:', items.length);

  const natCounts: Record<string, number> = {};
  items.forEach(item => {
    natCounts[item.nat] = (natCounts[item.nat] || 0) + 1;
  });
  console.log('📊 [Coste] Items by NAT:', natCounts);

  items.forEach(item => {
    const node = { ...item, children: [] };
    itemMap.set(item.Guid_SGI, node);
    if (item.codigo) {
      itemMapByCodigo.set(item.codigo, node);
    }
    if (item.CodInf) {
      itemMapByCodInf.set(item.CodInf, node);
    }
  });

  let linkedCount = 0;
  let orphanCount = 0;
  const decompositionTypes = ['Material', 'Mano de obra', 'Maquinaria', 'Otros'];

  items.forEach(item => {
    const node = itemMap.get(item.Guid_SGI);
    if (node) {
      if (item.CodSup) {
        let parent = itemMap.get(item.CodSup);
        if (!parent) {
          parent = itemMapByCodigo.get(item.CodSup);
        }
        if (!parent) {
          parent = itemMapByCodInf.get(item.CodSup);
        }
        if (parent) {
          parent.children.push(node);
          linkedCount++;

          if (decompositionTypes.includes(item.nat)) {
            console.log(`✅ [Coste] Linked: ${item.nat} "${item.resumen}" (${item.codigo}) -> Parent: ${parent.codigo}`);
          }
        } else {
          orphanCount++;
          rootNodes.push(node);

          if (decompositionTypes.includes(item.nat)) {
            console.log(`❌ [Coste] ORPHAN: ${item.nat} "${item.resumen}" (${item.codigo}) - CodSup: "${item.CodSup}" not found`);
          }
        }
      } else {
        rootNodes.push(node);
      }
    }
  });

  console.log(`🔗 [Coste] BuildTree results: ${linkedCount} linked, ${orphanCount} orphans, ${rootNodes.length} roots`);

  return rootNodes;
}

function formatNumber(num: number | string | null | undefined): string {
  const value = typeof num === 'string' ? parseFloat(num) : (num ?? 0);
  if (isNaN(value)) return '0,00';

  const parts = value.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
}

function TreeNodeRow({
  node,
  level,
  costeVersion1,
  costeVersion2,
  coefK,
  columnWidths,
  expandLevel
}: {
  node: TreeNode;
  level: number;
  costeVersion1: number;
  costeVersion2: number;
  coefK: number;
  columnWidths: ColumnWidths;
  expandLevel: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level < expandLevel);
  const hasChildren = node.children.length > 0;

  useEffect(() => {
    setIsExpanded(level < expandLevel);
  }, [expandLevel, level]);

  const coste1Key = `Coste_v${costeVersion1}` as const;
  const coste2Key = `Coste_v${costeVersion2}` as const;

  const coste1Tipo = (node as any)[`${coste1Key}_tipo`] || '';
  const coste2Tipo = (node as any)[`${coste2Key}_tipo`] || '';

  let coste1Cant = parseFloat((node as any)[`${coste1Key}_cant`]) || 0;
  const coste1CantDescomp = parseFloat((node as any)[`${coste1Key}_cantdescomp`]);
  if (coste1Tipo === 'Descompuesto') {
    coste1Cant = coste1CantDescomp || 0;
  }
  const coste1Precio = parseFloat((node as any)[`${coste1Key}_precio`]) || 0;
  let coste1Importe = parseFloat((node as any)[`${coste1Key}_importe`]) || 0;
  if (coste1Tipo === 'Descompuesto') {
    coste1Importe = coste1Cant * coste1Precio;
  }

  let coste2Cant = parseFloat((node as any)[`${coste2Key}_cant`]) || 0;
  const coste2CantDescomp = parseFloat((node as any)[`${coste2Key}_cantdescomp`]);
  if (coste2Tipo === 'Descompuesto') {
    coste2Cant = coste2CantDescomp || 0;
  }
  const coste2Precio = parseFloat((node as any)[`${coste2Key}_precio`]) || 0;
  let coste2Importe = parseFloat((node as any)[`${coste2Key}_importe`]) || 0;
  if (coste2Tipo === 'Descompuesto') {
    coste2Importe = coste2Cant * coste2Precio;
  }

  const coste1PrecioK = coste1Precio * coefK;
  const coste1ImporteK = coste1Cant * coste1PrecioK;

  const coste2PrecioK = coste2Precio * coefK;
  const coste2ImporteK = coste2Cant * coste2PrecioK;

  const difMedicion = coste2Cant - coste1Cant;
  const difImporte = coste1ImporteK - coste2ImporteK;
  const varianza = coste1ImporteK !== 0 ? ((difImporte / coste1ImporteK) * 100) : 0;

  const getDiferenciaColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const getBgColor = () => {
    if (node.nat === 'Capítulo') {
      if (node.Nivel === 1) return 'bg-emerald-200';
      if (node.Nivel === 2) return 'bg-emerald-150';
      if (node.Nivel === 3) return 'bg-emerald-100';
      if (node.Nivel === 4) return 'bg-emerald-50';
      return 'bg-emerald-50';
    }
    if (coste1Tipo === 'Descompuesto' || coste2Tipo === 'Descompuesto') {
      return 'bg-slate-50';
    }
    return '';
  };

  const getTextColor = () => {
    if (node.nat === 'Capítulo') return 'font-bold';
    if (['Material', 'Mano de obra', 'Maquinaria', 'Otros'].includes(node.nat)) return 'text-slate-500';
    return '';
  };

  const indentWidth = level * 20;

  return (
    <>
      <tr className={`border-b border-slate-200 hover:bg-slate-100 ${getBgColor()}`}>
        <td className={`sticky left-0 py-2 px-3 text-sm ${getBgColor() || 'bg-white'}`} style={{ paddingLeft: `${indentWidth + 12}px`, width: `${columnWidths.codigo}px` }}>
          <div className="flex items-center">
            {hasChildren ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-2 hover:bg-slate-300 rounded p-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" />
            )}
            <span className="text-xs text-slate-500 mr-2">N{node.Nivel}</span>
            <span className={`font-medium font-mono ${getTextColor() || 'text-slate-700'}`}>{node.codigo}</span>
            {node.codigo2 && <span className="text-xs text-slate-400 ml-2">({node.codigo2})</span>}
          </div>
        </td>
        <td className={`py-2 px-3 text-xs text-center ${getTextColor() || 'text-slate-600'}`} style={{ width: `${columnWidths.nat}px` }}>
          {node.nat}
        </td>
        <td className={`py-2 px-3 text-sm ${getTextColor() || 'text-slate-900'}`} style={{ width: `${columnWidths.descripcion}px` }}>
          {node.resumen}
        </td>
        <td className="py-2 px-3 text-xs text-center text-slate-600" style={{ width: `${columnWidths.ud}px` }}>
          {node.ud}
        </td>

        <td className="py-2 px-3 text-sm text-right font-mono bg-orange-50" style={{ width: `${columnWidths.coste1Cant}px` }}>
          {formatNumber(coste1Cant)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono bg-orange-50" style={{ width: `${columnWidths.coste1Precio}px` }}>
          {formatNumber(coste1Precio)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono bg-orange-50" style={{ width: `${columnWidths.coste1PrecioK}px` }}>
          {formatNumber(coste1PrecioK)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono font-semibold bg-orange-50" style={{ width: `${columnWidths.coste1ImporteK}px` }}>
          {formatNumber(coste1ImporteK)}
        </td>

        <td className="py-2 px-3 text-sm text-right font-mono bg-teal-50" style={{ width: `${columnWidths.coste2Cant}px` }}>
          {formatNumber(coste2Cant)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono bg-teal-50" style={{ width: `${columnWidths.coste2Precio}px` }}>
          {formatNumber(coste2Precio)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono bg-teal-50" style={{ width: `${columnWidths.coste2PrecioK}px` }}>
          {formatNumber(coste2PrecioK)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono font-semibold bg-teal-50" style={{ width: `${columnWidths.coste2ImporteK}px` }}>
          {formatNumber(coste2ImporteK)}
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

      {isExpanded && hasChildren && (
        <>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.Guid_SGI}
              node={child}
              level={level + 1}
              costeVersion1={costeVersion1}
              costeVersion2={costeVersion2}
              coefK={coefK}
              columnWidths={columnWidths}
              expandLevel={expandLevel}
            />
          ))}
        </>
      )}
    </>
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

type SortColumn = 'coste1ImporteK' | 'coste2ImporteK' | 'difMedicion' | 'difImporte' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function CosteComparativaTreeView({ data, costeVersion1, costeVersion2, coefK }: CosteComparativaTreeViewProps) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    codigo: 250,
    nat: 80,
    descripcion: 450,
    ud: 80,
    coste1Cant: 130,
    coste1Precio: 130,
    coste1PrecioK: 130,
    coste1ImporteK: 150,
    coste2Cant: 130,
    coste2Precio: 130,
    coste2PrecioK: 130,
    coste2ImporteK: 150,
    difMedicion: 130,
    difImporte: 150,
    varianza: 130
  });

  const [expandLevel, setExpandLevel] = useState<number>(1);
  const [natFilter, setNatFilter] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showNatFilter, setShowNatFilter] = useState(false);

  const dataQualityIssues = analyzeDataQuality(data, [], [costeVersion1, costeVersion2], 'coste');

  const handleResize = (key: keyof ColumnWidths, width: number) => {
    setColumnWidths(prev => ({ ...prev, [key]: width }));
  };

  const uniqueNatValues = Array.from(new Set(data.map(item => item.nat).filter(Boolean)));

  const filteredData = natFilter.length === 0 ? data : data.filter(item => natFilter.includes(item.nat));

  const sortedData = [...filteredData];
  if (sortColumn && sortDirection) {
    sortedData.sort((a, b) => {
      const coste1Key = `Coste_v${costeVersion1}` as const;
      const coste2Key = `Coste_v${costeVersion2}` as const;

      let aValue = 0;
      let bValue = 0;

      if (sortColumn === 'coste1ImporteK') {
        const aCoste1Cant = parseFloat((a as any)[`${coste1Key}_cant`]) || 0;
        const bCoste1Cant = parseFloat((b as any)[`${coste1Key}_cant`]) || 0;
        const aCoste1Precio = parseFloat((a as any)[`${coste1Key}_precio`]) || 0;
        const bCoste1Precio = parseFloat((b as any)[`${coste1Key}_precio`]) || 0;
        aValue = aCoste1Cant * aCoste1Precio * coefK;
        bValue = bCoste1Cant * bCoste1Precio * coefK;
      } else if (sortColumn === 'coste2ImporteK') {
        const aCoste2Cant = parseFloat((a as any)[`${coste2Key}_cant`]) || 0;
        const bCoste2Cant = parseFloat((b as any)[`${coste2Key}_cant`]) || 0;
        const aCoste2Precio = parseFloat((a as any)[`${coste2Key}_precio`]) || 0;
        const bCoste2Precio = parseFloat((b as any)[`${coste2Key}_precio`]) || 0;
        aValue = aCoste2Cant * aCoste2Precio * coefK;
        bValue = bCoste2Cant * bCoste2Precio * coefK;
      } else if (sortColumn === 'difMedicion') {
        const aCoste1Cant = parseFloat((a as any)[`${coste1Key}_cant`]) || 0;
        const bCoste1Cant = parseFloat((b as any)[`${coste1Key}_cant`]) || 0;
        const aCoste2Cant = parseFloat((a as any)[`${coste2Key}_cant`]) || 0;
        const bCoste2Cant = parseFloat((b as any)[`${coste2Key}_cant`]) || 0;
        aValue = aCoste2Cant - aCoste1Cant;
        bValue = bCoste2Cant - bCoste1Cant;
      } else if (sortColumn === 'difImporte') {
        const aCoste1Cant = parseFloat((a as any)[`${coste1Key}_cant`]) || 0;
        const bCoste1Cant = parseFloat((b as any)[`${coste1Key}_cant`]) || 0;
        const aCoste1Precio = parseFloat((a as any)[`${coste1Key}_precio`]) || 0;
        const bCoste1Precio = parseFloat((b as any)[`${coste1Key}_precio`]) || 0;
        const aCoste2Cant = parseFloat((a as any)[`${coste2Key}_cant`]) || 0;
        const bCoste2Cant = parseFloat((b as any)[`${coste2Key}_cant`]) || 0;
        const aCoste2Precio = parseFloat((a as any)[`${coste2Key}_precio`]) || 0;
        const bCoste2Precio = parseFloat((b as any)[`${coste2Key}_precio`]) || 0;
        aValue = (aCoste1Cant * aCoste1Precio * coefK) - (aCoste2Cant * aCoste2Precio * coefK);
        bValue = (bCoste1Cant * bCoste1Precio * coefK) - (bCoste2Cant * bCoste2Precio * coefK);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  const tree = buildTree(sortedData);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleReset = () => {
    setSortColumn(null);
    setSortDirection(null);
    setNatFilter([]);
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3 text-blue-600" />;
    }
    return <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  const totales = data.reduce((acc, item) => {
    const coste1Key = `Coste_v${costeVersion1}` as const;
    const coste2Key = `Coste_v${costeVersion2}` as const;

    if (item.nat !== 'Partida') {
      return acc;
    }

    const coste1Cant = parseFloat((item as any)[`${coste1Key}_cant`]) || 0;
    const coste1Precio = parseFloat((item as any)[`${coste1Key}_precio`]) || 0;
    const coste1ImporteK = coste1Cant * coste1Precio * coefK;

    const coste2Cant = parseFloat((item as any)[`${coste2Key}_cant`]) || 0;
    const coste2Precio = parseFloat((item as any)[`${coste2Key}_precio`]) || 0;
    const coste2ImporteK = coste2Cant * coste2Precio * coefK;

    return {
      coste1K: acc.coste1K + coste1ImporteK,
      coste2K: acc.coste2K + coste2ImporteK
    };
  }, { coste1K: 0, coste2K: 0 });

  const diferenciaTotales = totales.coste1K - totales.coste2K;
  const varianzaTotales = totales.coste1K !== 0 ? ((diferenciaTotales / totales.coste1K) * 100) : 0;

  const exportToExcel = () => {
    const coste1Key = `Coste_v${costeVersion1}` as const;
    const coste2Key = `Coste_v${costeVersion2}` as const;

    let csvContent = '\uFEFF';

    csvContent += 'Nivel;Código;Código 2;Nat.;Descripción;UD;';
    csvContent += `Coste v${costeVersion1} Cantidad;Coste v${costeVersion1} Precio;Coste v${costeVersion1} Precio.K;Coste v${costeVersion1} Importe.K;`;
    csvContent += `Coste v${costeVersion2} Cantidad;Coste v${costeVersion2} Precio;Coste v${costeVersion2} Precio.K;Coste v${costeVersion2} Importe.K;`;
    csvContent += `Dif.Medición;Dif.Importe;Varianza %\n`;

    const addRowToCSV = (item: AnalisisDetallado) => {
      const coste1Tipo = (item as any)[`${coste1Key}_tipo`] || '';
      const coste2Tipo = (item as any)[`${coste2Key}_tipo`] || '';

      let coste1Cant = parseFloat((item as any)[`${coste1Key}_cant`]) || 0;
      const coste1CantDescomp = parseFloat((item as any)[`${coste1Key}_cantdescomp`]);
      if (coste1Tipo === 'Descompuesto') {
        coste1Cant = coste1CantDescomp || 0;
      }
      const coste1Precio = parseFloat((item as any)[`${coste1Key}_precio`]) || 0;
      let coste1Importe = parseFloat((item as any)[`${coste1Key}_importe`]) || 0;
      if (coste1Tipo === 'Descompuesto') {
        coste1Importe = coste1Cant * coste1Precio;
      }

      let coste2Cant = parseFloat((item as any)[`${coste2Key}_cant`]) || 0;
      const coste2CantDescomp = parseFloat((item as any)[`${coste2Key}_cantdescomp`]);
      if (coste2Tipo === 'Descompuesto') {
        coste2Cant = coste2CantDescomp || 0;
      }
      const coste2Precio = parseFloat((item as any)[`${coste2Key}_precio`]) || 0;
      let coste2Importe = parseFloat((item as any)[`${coste2Key}_importe`]) || 0;
      if (coste2Tipo === 'Descompuesto') {
        coste2Importe = coste2Cant * coste2Precio;
      }

      const coste1PrecioK = coste1Precio * coefK;
      const coste1ImporteK = coste1Cant * coste1PrecioK;

      const coste2PrecioK = coste2Precio * coefK;
      const coste2ImporteK = coste2Cant * coste2PrecioK;

      const difMedicion = coste2Cant - coste1Cant;
      const difImporte = coste1ImporteK - coste2ImporteK;
      const varianza = coste1ImporteK !== 0 ? ((difImporte / coste1ImporteK) * 100) : 0;

      const escapeCsv = (val: string | number | null | undefined) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      csvContent += `${item.Nivel};${escapeCsv(item.codigo)};${escapeCsv(item.codigo2)};${escapeCsv(item.nat)};${escapeCsv(item.resumen)};${escapeCsv(item.ud)};`;
      csvContent += `${formatNumber(coste1Cant)};${formatNumber(coste1Precio)};${formatNumber(coste1PrecioK)};${formatNumber(coste1ImporteK)};`;
      csvContent += `${formatNumber(coste2Cant)};${formatNumber(coste2Precio)};${formatNumber(coste2PrecioK)};${formatNumber(coste2ImporteK)};`;
      csvContent += `${formatNumber(difMedicion)};${formatNumber(difImporte)};${formatNumber(varianza)}\n`;
    };

    filteredData.forEach(item => addRowToCSV(item));

    csvContent += `;;;;TOTALES;;;;${formatNumber(totales.coste1K)};`;
    csvContent += `;;;${formatNumber(totales.coste2K)};`;
    csvContent += `;${formatNumber(diferenciaTotales)};${formatNumber(varianzaTotales)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `comparativa_coste_${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {dataQualityIssues.length > 0 && (
        <div className="p-4">
          <DataQualityWarning issues={dataQualityIssues} />
        </div>
      )}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setExpandLevel(prev => Math.min(prev + 1, 4))}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                title="Expandir un nivel"
              >
                +
              </button>
              <button
                onClick={() => setExpandLevel(prev => Math.max(prev - 1, 0))}
                className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors text-sm font-medium"
                title="Contraer un nivel"
              >
                −
              </button>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Comparativa Coste vs Coste
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              title="Exportar a Excel"
            >
              <Download className="w-4 h-4" />
              Exportar a Excel
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              title="Restablecer orden original"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer
            </button>
          </div>
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
                className="py-3 px-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider relative"
                rowSpan={2}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Nat.</span>
                  <button
                    onClick={() => setShowNatFilter(!showNatFilter)}
                    className="hover:bg-slate-200 rounded p-1"
                    title="Filtrar por Nat."
                  >
                    <Filter className="w-3 h-3" />
                  </button>
                </div>
                {showNatFilter && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-300 rounded shadow-lg z-20 min-w-[180px] p-2">
                    <div className="mb-2 pb-2 border-b border-slate-200">
                      <button
                        onClick={() => setNatFilter([])}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Limpiar selección
                      </button>
                    </div>
                    {uniqueNatValues.map(nat => (
                      <label
                        key={nat}
                        className="flex items-center px-2 py-1.5 text-xs hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={natFilter.includes(nat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNatFilter([...natFilter, nat]);
                            } else {
                              setNatFilter(natFilter.filter(f => f !== nat));
                            }
                          }}
                          className="mr-2"
                        />
                        {nat}
                      </label>
                    ))}
                  </div>
                )}
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

              <th className="py-2 px-3 text-center text-xs font-semibold text-orange-700 uppercase tracking-wider bg-orange-100 border-l border-slate-300" colSpan={4}>
                Coste v{costeVersion1}
              </th>

              <th className="py-2 px-3 text-center text-xs font-semibold text-teal-700 uppercase tracking-wider bg-teal-100 border-l border-slate-300" colSpan={4}>
                Coste v{costeVersion2}
              </th>

              <ResizableHeader
                columnKey="difMedicion"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-3 px-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-l border-slate-300"
                rowSpan={2}
              >
                <button
                  onClick={() => handleSort('difMedicion')}
                  className="flex items-center justify-center gap-1 w-full hover:bg-slate-200 rounded px-1"
                  title="Ordenar por Dif. Medición"
                >
                  <span>Dif.Medición</span>
                  {getSortIcon('difMedicion')}
                </button>
              </ResizableHeader>
              <ResizableHeader
                columnKey="difImporte"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-3 px-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider"
                rowSpan={2}
              >
                <button
                  onClick={() => handleSort('difImporte')}
                  className="flex items-center justify-center gap-1 w-full hover:bg-slate-200 rounded px-1"
                  title="Ordenar por Dif. Importe"
                >
                  <span>Dif.Importe</span>
                  {getSortIcon('difImporte')}
                </button>
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
                columnKey="coste1Cant"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-orange-50 border-l border-slate-300"
              >
                Cantidad
              </ResizableHeader>
              <ResizableHeader
                columnKey="coste1Precio"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-orange-50"
              >
                Precio
              </ResizableHeader>
              <ResizableHeader
                columnKey="coste1PrecioK"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-orange-50"
              >
                Precio.K
              </ResizableHeader>
              <ResizableHeader
                columnKey="coste1ImporteK"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-orange-50"
              >
                <button
                  onClick={() => handleSort('coste1ImporteK')}
                  className="flex items-center justify-center gap-1 w-full hover:bg-orange-100 rounded px-1"
                  title="Ordenar por Importe.K"
                >
                  <span>Importe.K</span>
                  {getSortIcon('coste1ImporteK')}
                </button>
              </ResizableHeader>

              <ResizableHeader
                columnKey="coste2Cant"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-teal-50 border-l border-slate-300"
              >
                Cantidad
              </ResizableHeader>
              <ResizableHeader
                columnKey="coste2Precio"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-teal-50"
              >
                Precio
              </ResizableHeader>
              <ResizableHeader
                columnKey="coste2PrecioK"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-teal-50"
              >
                Precio.K
              </ResizableHeader>
              <ResizableHeader
                columnKey="coste2ImporteK"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-teal-50"
              >
                <button
                  onClick={() => handleSort('coste2ImporteK')}
                  className="flex items-center justify-center gap-1 w-full hover:bg-teal-100 rounded px-1"
                  title="Ordenar por Importe.K"
                >
                  <span>Importe.K</span>
                  {getSortIcon('coste2ImporteK')}
                </button>
              </ResizableHeader>
            </tr>
          </thead>
          <tbody>
            {tree.length === 0 ? (
              <tr>
                <td colSpan={15} className="p-8 text-center text-slate-500">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              <>
                {tree.map((node) => (
                  <TreeNodeRow
                    key={node.Guid_SGI}
                    node={node}
                    level={0}
                    costeVersion1={costeVersion1}
                    costeVersion2={costeVersion2}
                    coefK={coefK}
                    columnWidths={columnWidths}
                    expandLevel={expandLevel}
                  />
                ))}
                <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold">
                  <td colSpan={4} className="sticky left-0 bg-slate-100 py-3 px-3 text-sm text-slate-900">
                    TOTALES
                  </td>
                  <td colSpan={3} className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-orange-100" style={{ width: `${columnWidths.coste1ImporteK}px` }}>
                    {formatNumber(totales.coste1K)}
                  </td>
                  <td colSpan={3} className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-teal-100" style={{ width: `${columnWidths.coste2ImporteK}px` }}>
                    {formatNumber(totales.coste2K)}
                  </td>
                  <td className="py-3 px-3"></td>
                  <td className={`py-3 px-3 text-sm text-right font-mono font-bold ${diferenciaTotales > 0 ? 'text-green-600' : diferenciaTotales < 0 ? 'text-red-600' : 'text-slate-600'}`} style={{ width: `${columnWidths.difImporte}px` }}>
                    {formatNumber(diferenciaTotales)}
                  </td>
                  <td className={`py-3 px-3 text-sm text-right font-mono ${varianzaTotales > 0 ? 'text-green-600' : varianzaTotales < 0 ? 'text-red-600' : 'text-slate-600'}`} style={{ width: `${columnWidths.varianza}px` }}>
                    {formatNumber(varianzaTotales)}%
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
