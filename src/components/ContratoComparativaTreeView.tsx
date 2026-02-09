import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, Filter, Download } from 'lucide-react';
import { AnalisisDetallado } from '../lib/supabase';
import DataQualityWarning from './DataQualityWarning';
import { analyzeDataQuality } from '../lib/dataQuality';

interface ContratoComparativaTreeViewProps {
  data: AnalisisDetallado[];
  contratoVersion1: number;
  contratoVersion2: number;
}

interface TreeNode extends AnalisisDetallado {
  children: TreeNode[];
}

interface ColumnWidths {
  codigo: number;
  descripcion: number;
  nat: number;
  ud: number;
  contrato1Cant: number;
  contrato1Precio: number;
  contrato1Importe: number;
  contrato2Cant: number;
  contrato2Precio: number;
  contrato2Importe: number;
  difMedicion: number;
  difImporte: number;
  varianza: number;
}

function buildTree(items: AnalisisDetallado[]): TreeNode[] {
  const itemMap = new Map<string, TreeNode>();
  const itemMapByCodigo = new Map<string, TreeNode>();
  const itemMapByCodInf = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  console.log('🔍 [Contrato] BuildTree: Total items received:', items.length);

  const natCounts: Record<string, number> = {};
  items.forEach(item => {
    natCounts[item.nat] = (natCounts[item.nat] || 0) + 1;
  });
  console.log('📊 [Contrato] Items by NAT:', natCounts);

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
            console.log(`✅ [Contrato] Linked: ${item.nat} "${item.resumen}" (${item.codigo}) -> Parent: ${parent.codigo}`);
          }
        } else {
          orphanCount++;
          rootNodes.push(node);

          if (decompositionTypes.includes(item.nat)) {
            console.log(`❌ [Contrato] ORPHAN: ${item.nat} "${item.resumen}" (${item.codigo}) - CodSup: "${item.CodSup}" not found`);
          }
        }
      } else {
        rootNodes.push(node);
      }
    }
  });

  console.log(`🔗 [Contrato] BuildTree results: ${linkedCount} linked, ${orphanCount} orphans, ${rootNodes.length} roots`);

  return rootNodes;
}

function formatNumber(num: number | string | null | undefined): string {
  const value = typeof num === 'string' ? parseFloat(num) : (num ?? 0);
  if (isNaN(value)) return '0,00';

  const parts = value.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
}

function formatNumberOrBlank(num: number | string | null | undefined, showBlank: boolean): string {
  if (showBlank) return '';
  return formatNumber(num);
}

function TreeNodeRow({
  node,
  level,
  contratoVersion1,
  contratoVersion2,
  columnWidths,
  expandLevel
}: {
  node: TreeNode;
  level: number;
  contratoVersion1: number;
  contratoVersion2: number;
  columnWidths: ColumnWidths;
  expandLevel: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level < expandLevel);
  const hasChildren = node.children.length > 0;

  useEffect(() => {
    setIsExpanded(level < expandLevel);
  }, [expandLevel, level]);

  const contrato1Key = `Contrato_v${contratoVersion1}` as const;
  const contrato2Key = `Contrato_v${contratoVersion2}` as const;

  const contrato1Tipo = (node as any)[`${contrato1Key}_tipo`] || '';
  const contrato2Tipo = (node as any)[`${contrato2Key}_tipo`] || '';

  const isContrato1Descomposicion = node.origen === 'Contrato' && contrato1Tipo === 'Descomposición';
  const isContrato2Descomposicion = node.origen === 'Contrato' && contrato2Tipo === 'Descomposición';

  let contrato1Cant = parseFloat((node as any)[`${contrato1Key}_cant`]) || 0;
  const contrato1CantDescomp = parseFloat((node as any)[`${contrato1Key}_cantdescomp`]);
  if (contrato1Tipo === 'Descompuesto') {
    contrato1Cant = contrato1CantDescomp || 0;
  }
  const contrato1Precio = parseFloat((node as any)[`${contrato1Key}_precio`]) || 0;
  let contrato1Importe = parseFloat((node as any)[`${contrato1Key}_importe`]) || 0;
  if (contrato1Tipo === 'Descompuesto') {
    contrato1Importe = contrato1Cant * contrato1Precio;
  }

  let contrato2Cant = parseFloat((node as any)[`${contrato2Key}_cant`]) || 0;
  const contrato2CantDescomp = parseFloat((node as any)[`${contrato2Key}_cantdescomp`]);
  if (contrato2Tipo === 'Descompuesto') {
    contrato2Cant = contrato2CantDescomp || 0;
  }
  const contrato2Precio = parseFloat((node as any)[`${contrato2Key}_precio`]) || 0;
  let contrato2Importe = parseFloat((node as any)[`${contrato2Key}_importe`]) || 0;
  if (contrato2Tipo === 'Descompuesto') {
    contrato2Importe = contrato2Cant * contrato2Precio;
  }

  const difMedicion = contrato2Cant - contrato1Cant;
  const difImporte = contrato1Importe - contrato2Importe;
  const varianza = contrato1Importe !== 0 ? ((difImporte / contrato1Importe) * 100) : 0;

  const shouldShowBlank1 = isContrato1Descomposicion;
  const shouldShowBlank2 = isContrato2Descomposicion;

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
    if (contrato1Tipo === 'Descompuesto' || contrato2Tipo === 'Descompuesto') {
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

        <td className="py-2 px-3 text-sm text-right font-mono bg-sky-50" style={{ width: `${columnWidths.contrato1Cant}px` }}>
          {formatNumberOrBlank(contrato1Cant, shouldShowBlank1 && isNaN(contrato1CantDescomp))}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono bg-sky-50" style={{ width: `${columnWidths.contrato1Precio}px` }}>
          {formatNumberOrBlank(contrato1Precio, shouldShowBlank1)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono font-semibold bg-sky-50" style={{ width: `${columnWidths.contrato1Importe}px` }}>
          {formatNumberOrBlank(contrato1Importe, shouldShowBlank1)}
        </td>

        <td className="py-2 px-3 text-sm text-right font-mono bg-purple-50" style={{ width: `${columnWidths.contrato2Cant}px` }}>
          {formatNumberOrBlank(contrato2Cant, shouldShowBlank2 && isNaN(contrato2CantDescomp))}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono bg-purple-50" style={{ width: `${columnWidths.contrato2Precio}px` }}>
          {formatNumberOrBlank(contrato2Precio, shouldShowBlank2)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono font-semibold bg-purple-50" style={{ width: `${columnWidths.contrato2Importe}px` }}>
          {formatNumberOrBlank(contrato2Importe, shouldShowBlank2)}
        </td>

        <td className={`py-2 px-3 text-sm text-right font-mono ${shouldShowBlank1 || shouldShowBlank2 ? '' : getDiferenciaColor(difMedicion)}`} style={{ width: `${columnWidths.difMedicion}px` }}>
          {shouldShowBlank1 || shouldShowBlank2 ? '' : formatNumber(difMedicion)}
        </td>
        <td className={`py-2 px-3 text-sm text-right font-mono font-semibold ${shouldShowBlank1 || shouldShowBlank2 ? '' : getDiferenciaColor(difImporte)}`} style={{ width: `${columnWidths.difImporte}px` }}>
          {shouldShowBlank1 || shouldShowBlank2 ? '' : formatNumber(difImporte)}
        </td>
        <td className={`py-2 px-3 text-sm text-right font-mono ${shouldShowBlank1 || shouldShowBlank2 ? '' : getDiferenciaColor(varianza)}`} style={{ width: `${columnWidths.varianza}px` }}>
          {shouldShowBlank1 || shouldShowBlank2 ? '' : `${formatNumber(varianza)}%`}
        </td>
      </tr>

      {isExpanded && hasChildren && (
        <>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.Guid_SGI}
              node={child}
              level={level + 1}
              contratoVersion1={contratoVersion1}
              contratoVersion2={contratoVersion2}
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

type SortColumn = 'contrato1Importe' | 'contrato2Importe' | 'difMedicion' | 'difImporte' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function ContratoComparativaTreeView({ data, contratoVersion1, contratoVersion2 }: ContratoComparativaTreeViewProps) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    codigo: 250,
    nat: 80,
    descripcion: 450,
    ud: 80,
    contrato1Cant: 130,
    contrato1Precio: 130,
    contrato1Importe: 150,
    contrato2Cant: 130,
    contrato2Precio: 130,
    contrato2Importe: 150,
    difMedicion: 130,
    difImporte: 150,
    varianza: 130
  });

  const [expandLevel, setExpandLevel] = useState<number>(1);
  const [natFilter, setNatFilter] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showNatFilter, setShowNatFilter] = useState(false);

  const dataQualityIssues = analyzeDataQuality(data, [contratoVersion1, contratoVersion2], [], 'contrato');

  const handleResize = (key: keyof ColumnWidths, width: number) => {
    setColumnWidths(prev => ({ ...prev, [key]: width }));
  };

  const uniqueNatValues = Array.from(new Set(data.map(item => item.nat).filter(Boolean)));

  const filteredData = natFilter.length === 0 ? data : data.filter(item => natFilter.includes(item.nat));

  const sortedData = [...filteredData];
  if (sortColumn && sortDirection) {
    sortedData.sort((a, b) => {
      const contrato1Key = `Contrato_v${contratoVersion1}` as const;
      const contrato2Key = `Contrato_v${contratoVersion2}` as const;

      let aValue = 0;
      let bValue = 0;

      if (sortColumn === 'contrato1Importe') {
        aValue = parseFloat((a as any)[`${contrato1Key}_importe`]) || 0;
        bValue = parseFloat((b as any)[`${contrato1Key}_importe`]) || 0;
      } else if (sortColumn === 'contrato2Importe') {
        aValue = parseFloat((a as any)[`${contrato2Key}_importe`]) || 0;
        bValue = parseFloat((b as any)[`${contrato2Key}_importe`]) || 0;
      } else if (sortColumn === 'difMedicion') {
        const aContrato1Cant = parseFloat((a as any)[`${contrato1Key}_cant`]) || 0;
        const bContrato1Cant = parseFloat((b as any)[`${contrato1Key}_cant`]) || 0;
        const aContrato2Cant = parseFloat((a as any)[`${contrato2Key}_cant`]) || 0;
        const bContrato2Cant = parseFloat((b as any)[`${contrato2Key}_cant`]) || 0;
        aValue = aContrato2Cant - aContrato1Cant;
        bValue = bContrato2Cant - bContrato1Cant;
      } else if (sortColumn === 'difImporte') {
        const aContrato1Importe = parseFloat((a as any)[`${contrato1Key}_importe`]) || 0;
        const bContrato1Importe = parseFloat((b as any)[`${contrato1Key}_importe`]) || 0;
        const aContrato2Importe = parseFloat((a as any)[`${contrato2Key}_importe`]) || 0;
        const bContrato2Importe = parseFloat((b as any)[`${contrato2Key}_importe`]) || 0;
        aValue = aContrato1Importe - aContrato2Importe;
        bValue = bContrato1Importe - bContrato2Importe;
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
    const contrato1Key = `Contrato_v${contratoVersion1}` as const;
    const contrato2Key = `Contrato_v${contratoVersion2}` as const;

    if (item.nat !== 'Partida') {
      return acc;
    }

    const contrato1Importe = parseFloat((item as any)[`${contrato1Key}_importe`]) || 0;
    const contrato2Importe = parseFloat((item as any)[`${contrato2Key}_importe`]) || 0;

    return {
      contrato1: acc.contrato1 + contrato1Importe,
      contrato2: acc.contrato2 + contrato2Importe
    };
  }, { contrato1: 0, contrato2: 0 });

  const diferenciaTotales = totales.contrato1 - totales.contrato2;
  const varianzaTotales = totales.contrato1 !== 0 ? ((diferenciaTotales / totales.contrato1) * 100) : 0;

  const exportToExcel = () => {
    const contrato1Key = `Contrato_v${contratoVersion1}` as const;
    const contrato2Key = `Contrato_v${contratoVersion2}` as const;

    let csvContent = '\uFEFF';

    csvContent += 'Nivel;Código;Código 2;Nat.;Descripción;UD;';
    csvContent += `Contrato v${contratoVersion1} Cantidad;Contrato v${contratoVersion1} Precio;Contrato v${contratoVersion1} Importe;`;
    csvContent += `Contrato v${contratoVersion2} Cantidad;Contrato v${contratoVersion2} Precio;Contrato v${contratoVersion2} Importe;`;
    csvContent += `Dif.Medición;Dif.Importe;Varianza %\n`;

    const addRowToCSV = (item: AnalisisDetallado) => {
      const contrato1Tipo = (item as any)[`${contrato1Key}_tipo`] || '';
      const contrato2Tipo = (item as any)[`${contrato2Key}_tipo`] || '';

      let contrato1Cant = parseFloat((item as any)[`${contrato1Key}_cant`]) || 0;
      const contrato1CantDescomp = parseFloat((item as any)[`${contrato1Key}_cantdescomp`]);
      if (contrato1Tipo === 'Descompuesto') {
        contrato1Cant = contrato1CantDescomp || 0;
      }
      const contrato1Precio = parseFloat((item as any)[`${contrato1Key}_precio`]) || 0;
      let contrato1Importe = parseFloat((item as any)[`${contrato1Key}_importe`]) || 0;
      if (contrato1Tipo === 'Descompuesto') {
        contrato1Importe = contrato1Cant * contrato1Precio;
      }

      let contrato2Cant = parseFloat((item as any)[`${contrato2Key}_cant`]) || 0;
      const contrato2CantDescomp = parseFloat((item as any)[`${contrato2Key}_cantdescomp`]);
      if (contrato2Tipo === 'Descompuesto') {
        contrato2Cant = contrato2CantDescomp || 0;
      }
      const contrato2Precio = parseFloat((item as any)[`${contrato2Key}_precio`]) || 0;
      let contrato2Importe = parseFloat((item as any)[`${contrato2Key}_importe`]) || 0;
      if (contrato2Tipo === 'Descompuesto') {
        contrato2Importe = contrato2Cant * contrato2Precio;
      }

      const difMedicion = contrato2Cant - contrato1Cant;
      const difImporte = contrato1Importe - contrato2Importe;
      const varianza = contrato1Importe !== 0 ? ((difImporte / contrato1Importe) * 100) : 0;

      const escapeCsv = (val: string | number | null | undefined) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      csvContent += `${item.Nivel};${escapeCsv(item.codigo)};${escapeCsv(item.codigo2)};${escapeCsv(item.nat)};${escapeCsv(item.resumen)};${escapeCsv(item.ud)};`;
      csvContent += `${formatNumber(contrato1Cant)};${formatNumber(contrato1Precio)};${formatNumber(contrato1Importe)};`;
      csvContent += `${formatNumber(contrato2Cant)};${formatNumber(contrato2Precio)};${formatNumber(contrato2Importe)};`;
      csvContent += `${formatNumber(difMedicion)};${formatNumber(difImporte)};${formatNumber(varianza)}\n`;
    };

    filteredData.forEach(item => addRowToCSV(item));

    csvContent += `;;;;TOTALES;;;${formatNumber(totales.contrato1)};`;
    csvContent += `;;${formatNumber(totales.contrato2)};`;
    csvContent += `;${formatNumber(diferenciaTotales)};${formatNumber(varianzaTotales)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `comparativa_contrato_${timestamp}.csv`;

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
              Comparativa Contrato vs Contrato
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

              <th className="py-2 px-3 text-center text-xs font-semibold text-sky-700 uppercase tracking-wider bg-sky-100 border-l border-slate-300" colSpan={3}>
                Contrato v{contratoVersion1}
              </th>

              <th className="py-2 px-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider bg-purple-100 border-l border-slate-300" colSpan={3}>
                Contrato v{contratoVersion2}
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
                columnKey="contrato1Cant"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-sky-50 border-l border-slate-300"
              >
                Cantidad
              </ResizableHeader>
              <ResizableHeader
                columnKey="contrato1Precio"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-sky-50"
              >
                Precio
              </ResizableHeader>
              <ResizableHeader
                columnKey="contrato1Importe"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-sky-50"
              >
                <button
                  onClick={() => handleSort('contrato1Importe')}
                  className="flex items-center justify-center gap-1 w-full hover:bg-sky-100 rounded px-1"
                  title="Ordenar por Importe"
                >
                  <span>Importe</span>
                  {getSortIcon('contrato1Importe')}
                </button>
              </ResizableHeader>

              <ResizableHeader
                columnKey="contrato2Cant"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-purple-50 border-l border-slate-300"
              >
                Cantidad
              </ResizableHeader>
              <ResizableHeader
                columnKey="contrato2Precio"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-purple-50"
              >
                Precio
              </ResizableHeader>
              <ResizableHeader
                columnKey="contrato2Importe"
                columnWidths={columnWidths}
                onResize={handleResize}
                className="py-2 px-3 text-center text-xs font-medium text-slate-600 bg-purple-50"
              >
                <button
                  onClick={() => handleSort('contrato2Importe')}
                  className="flex items-center justify-center gap-1 w-full hover:bg-purple-100 rounded px-1"
                  title="Ordenar por Importe"
                >
                  <span>Importe</span>
                  {getSortIcon('contrato2Importe')}
                </button>
              </ResizableHeader>
            </tr>
          </thead>
          <tbody>
            {tree.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-8 text-center text-slate-500">
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
                    contratoVersion1={contratoVersion1}
                    contratoVersion2={contratoVersion2}
                    columnWidths={columnWidths}
                    expandLevel={expandLevel}
                  />
                ))}
                <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold">
                  <td colSpan={4} className="sticky left-0 bg-slate-100 py-3 px-3 text-sm text-slate-900">
                    TOTALES
                  </td>
                  <td colSpan={2} className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-sky-100" style={{ width: `${columnWidths.contrato1Importe}px` }}>
                    {formatNumber(totales.contrato1)}
                  </td>
                  <td colSpan={2} className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-purple-100" style={{ width: `${columnWidths.contrato2Importe}px` }}>
                    {formatNumber(totales.contrato2)}
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
