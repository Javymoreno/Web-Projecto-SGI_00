import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, Filter, Download } from 'lucide-react';
import { AnalisisDetallado } from '../lib/supabase';

interface IntegratedTreeViewProps {
  data: AnalisisDetallado[];
  analisisVersion: number;
  contratoVersion: number;
  costeVersion: number;
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

function buildTree(items: AnalisisDetallado[]): TreeNode[] {
  const itemMap = new Map<string, TreeNode>();
  const itemMapByCodigo = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  items.forEach(item => {
    const node = { ...item, children: [] };
    itemMap.set(item.Guid_SGI, node);
    if (item.codigo) {
      itemMapByCodigo.set(item.codigo, node);
    }
  });

  items.forEach(item => {
    const node = itemMap.get(item.Guid_SGI);
    if (node) {
      if (item.CodSup) {
        let parent = itemMap.get(item.CodSup);
        if (!parent) {
          parent = itemMapByCodigo.get(item.CodSup);
        }
        if (parent) {
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    }
  });

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
  contratoVersion,
  costeVersion,
  coefK,
  columnWidths,
  expandLevel,
  parentNode
}: {
  node: TreeNode;
  level: number;
  contratoVersion: number;
  costeVersion: number;
  coefK: number;
  columnWidths: ColumnWidths;
  expandLevel: number;
  parentNode?: TreeNode;
}) {
  const [isExpanded, setIsExpanded] = useState(level < expandLevel);
  const hasChildren = node.children.length > 0;

  useEffect(() => {
    setIsExpanded(level < expandLevel);
  }, [expandLevel, level]);

  const contratoKey = `Contrato_v${contratoVersion}` as const;
  const costeKey = `Coste_v${costeVersion}` as const;

  const contratoTipo = (node as any)[`${contratoKey}_tipo`] || '';
  const costeTipo = (node as any)[`${costeKey}_tipo`] || '';

  const isContratoDescomposicion = node.origen === 'Contrato' && contratoTipo === 'Descomposición';

  const isDescompuesto = ['Material', 'Mano de obra', 'Maquinaria', 'Otros'].includes(node.nat);
  const isPartidaParent = parentNode && parentNode.nat === 'Partida';

  let contratoCant = parseFloat((node as any)[`${contratoKey}_cant`]) || 0;
  const contratoCantDescomp = parseFloat((node as any)[`${contratoKey}_cantdescomp`]);
  if (contratoTipo === 'Descompuesto') {
    contratoCant = contratoCantDescomp || 0;
  }

  let costeCant = parseFloat((node as any)[`${costeKey}_cant`]) || 0;
  const costeCantDescomp = parseFloat((node as any)[`${costeKey}_cantdescomp`]);
  if (costeTipo === 'Descompuesto') {
    costeCant = costeCantDescomp || 0;
  }
  const costePrecio = parseFloat((node as any)[`${costeKey}_precio`]) || 0;
  let costeImporte = parseFloat((node as any)[`${costeKey}_importe`]) || 0;
  if (costeTipo === 'Descompuesto') {
    costeImporte = costeCant * costePrecio;
  }

  const contratoPrecio = parseFloat((node as any)[`${contratoKey}_precio`]) || 0;
  let contratoImporte = parseFloat((node as any)[`${contratoKey}_importe`]) || 0;

  if (contratoTipo === 'Descompuesto') {
    contratoImporte = contratoCant * contratoPrecio;
  }

  const costePrecioK = costePrecio * coefK;
  const costeImporteK = costeCant * costePrecioK;

  const difMedicion = costeCant - contratoCant;
  const difImporte = contratoImporte - costeImporteK;
  const varianza = contratoImporte !== 0 ? ((difImporte / contratoImporte) * 100) : 0;

  const shouldShowBlankForDescomposicion = isContratoDescomposicion;

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
    if (contratoTipo === 'Descompuesto' || costeTipo === 'Descompuesto') {
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

        <td className="py-2 px-3 text-sm text-right font-mono bg-blue-50" style={{ width: `${columnWidths.contratoCant}px` }}>
          {formatNumberOrBlank(contratoCant, shouldShowBlankForDescomposicion && isNaN(contratoCantDescomp))}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono bg-blue-50" style={{ width: `${columnWidths.contratoPrecio}px` }}>
          {formatNumberOrBlank(contratoPrecio, shouldShowBlankForDescomposicion)}
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono font-semibold bg-blue-50" style={{ width: `${columnWidths.contratoImporte}px` }}>
          {formatNumberOrBlank(contratoImporte, shouldShowBlankForDescomposicion)}
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

        <td className={`py-2 px-3 text-sm text-right font-mono ${shouldShowBlankForDescomposicion ? '' : getDiferenciaColor(difMedicion)}`} style={{ width: `${columnWidths.difMedicion}px` }}>
          {shouldShowBlankForDescomposicion ? '' : formatNumber(difMedicion)}
        </td>
        <td className={`py-2 px-3 text-sm text-right font-mono font-semibold ${shouldShowBlankForDescomposicion ? '' : getDiferenciaColor(difImporte)}`} style={{ width: `${columnWidths.difImporte}px` }}>
          {shouldShowBlankForDescomposicion ? '' : formatNumber(difImporte)}
        </td>
        <td className={`py-2 px-3 text-sm text-right font-mono ${shouldShowBlankForDescomposicion ? '' : getDiferenciaColor(varianza)}`} style={{ width: `${columnWidths.varianza}px` }}>
          {shouldShowBlankForDescomposicion ? '' : `${formatNumber(varianza)}%`}
        </td>
      </tr>

      {isExpanded && hasChildren && (
        <>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.Guid_SGI}
              node={child}
              level={level + 1}
              contratoVersion={contratoVersion}
              costeVersion={costeVersion}
              coefK={coefK}
              columnWidths={columnWidths}
              expandLevel={expandLevel}
              parentNode={node}
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

type SortColumn = 'contratoImporte' | 'costeImporteK' | 'difMedicion' | 'difImporte' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function IntegratedTreeView({ data, analisisVersion, contratoVersion, costeVersion, coefK }: IntegratedTreeViewProps) {
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

  const [expandLevel, setExpandLevel] = useState<number>(1);
  const [natFilter, setNatFilter] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showNatFilter, setShowNatFilter] = useState(false);

  const handleResize = (key: keyof ColumnWidths, width: number) => {
    setColumnWidths(prev => ({ ...prev, [key]: width }));
  };

  const uniqueNatValues = Array.from(new Set(data.map(item => item.nat).filter(Boolean)));

  const filteredData = natFilter.length === 0 ? data : data.filter(item => natFilter.includes(item.nat));

  const sortedData = [...filteredData];
  if (sortColumn && sortDirection) {
    sortedData.sort((a, b) => {
      const contratoKey = `Contrato_v${contratoVersion}` as const;
      const costeKey = `Coste_v${costeVersion}` as const;

      let aValue = 0;
      let bValue = 0;

      if (sortColumn === 'contratoImporte') {
        aValue = parseFloat((a as any)[`${contratoKey}_importe`]) || 0;
        bValue = parseFloat((b as any)[`${contratoKey}_importe`]) || 0;
      } else if (sortColumn === 'costeImporteK') {
        const aCosteCant = parseFloat((a as any)[`${costeKey}_cant`]) || 0;
        const bCosteCant = parseFloat((b as any)[`${costeKey}_cant`]) || 0;
        const aCostePrecio = parseFloat((a as any)[`${costeKey}_precio`]) || 0;
        const bCostePrecio = parseFloat((b as any)[`${costeKey}_precio`]) || 0;
        aValue = aCosteCant * aCostePrecio * coefK;
        bValue = bCosteCant * bCostePrecio * coefK;
      } else if (sortColumn === 'difMedicion') {
        const aContratoCant = parseFloat((a as any)[`${contratoKey}_cant`]) || 0;
        const bContratoCant = parseFloat((b as any)[`${contratoKey}_cant`]) || 0;
        const aCosteCant = parseFloat((a as any)[`${costeKey}_cant`]) || 0;
        const bCosteCant = parseFloat((b as any)[`${costeKey}_cant`]) || 0;
        aValue = aCosteCant - aContratoCant;
        bValue = bCosteCant - bContratoCant;
      } else if (sortColumn === 'difImporte') {
        const aContratoImporte = parseFloat((a as any)[`${contratoKey}_importe`]) || 0;
        const bContratoImporte = parseFloat((b as any)[`${contratoKey}_importe`]) || 0;
        const aCosteCant = parseFloat((a as any)[`${costeKey}_cant`]) || 0;
        const bCosteCant = parseFloat((b as any)[`${costeKey}_cant`]) || 0;
        const aCostePrecio = parseFloat((a as any)[`${costeKey}_precio`]) || 0;
        const bCostePrecio = parseFloat((b as any)[`${costeKey}_precio`]) || 0;
        aValue = aContratoImporte - (aCosteCant * aCostePrecio * coefK);
        bValue = bContratoImporte - (bCosteCant * bCostePrecio * coefK);
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
    const contratoKey = `Contrato_v${contratoVersion}` as const;
    const costeKey = `Coste_v${costeVersion}` as const;

    if (item.nat !== 'Partida') {
      return acc;
    }

    const contratoTipo = (item as any)[`${contratoKey}_tipo`] || '';
    const costeTipo = (item as any)[`${costeKey}_tipo`] || '';

    let contratoCant = parseFloat((item as any)[`${contratoKey}_cant`]) || 0;
    const contratoCantDescomp = parseFloat((item as any)[`${contratoKey}_cantdescomp`]);
    if (contratoTipo === 'Descompuesto') {
      contratoCant = contratoCantDescomp || 0;
    }

    let contratoPrecio = parseFloat((item as any)[`${contratoKey}_precio`]) || 0;
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

    const costeImporteK = costeCant * costePrecio * coefK;

    return {
      contrato: acc.contrato + contratoImporte,
      costeK: acc.costeK + costeImporteK
    };
  }, { contrato: 0, costeK: 0 });

  const diferenciaTotales = totales.contrato - totales.costeK;
  const varianzaTotales = totales.contrato !== 0 ? ((diferenciaTotales / totales.contrato) * 100) : 0;

  const exportToExcel = () => {
    const contratoKey = `Contrato_v${contratoVersion}` as const;
    const costeKey = `Coste_v${costeVersion}` as const;

    let csvContent = '\uFEFF';

    csvContent += 'Nivel;Código;Código 2;Nat.;Descripción;UD;';
    csvContent += `Contrato Cantidad;Contrato Precio;Contrato Importe;`;
    csvContent += `Coste Cantidad;Coste Precio;Coste Precio.K;Coste Importe.K;`;
    csvContent += `Dif.Medición;Dif.Importe;Varianza %\n`;

    const addRowToCSV = (item: AnalisisDetallado) => {
      const contratoTipo = (item as any)[`${contratoKey}_tipo`] || '';
      const costeTipo = (item as any)[`${costeKey}_tipo`] || '';
      const isContratoDescomposicion = item.origen === 'Contrato' && contratoTipo === 'Descomposición';

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

      const escapeCsv = (val: string | number | null | undefined) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      csvContent += `${item.Nivel};${escapeCsv(item.codigo)};${escapeCsv(item.codigo2)};${escapeCsv(item.nat)};${escapeCsv(item.resumen)};${escapeCsv(item.ud)};`;

      if (isContratoDescomposicion && isNaN(contratoCantDescomp)) {
        csvContent += `;`;
      } else {
        csvContent += `${formatNumber(contratoCant)};`;
      }

      if (isContratoDescomposicion) {
        csvContent += `;;`;
      } else {
        csvContent += `${formatNumber(contratoPrecio)};${formatNumber(contratoImporte)};`;
      }

      csvContent += `${formatNumber(costeCant)};${formatNumber(costePrecio)};${formatNumber(costePrecioK)};${formatNumber(costeImporteK)};`;

      if (isContratoDescomposicion) {
        csvContent += `;;`;
      } else {
        csvContent += `${formatNumber(difMedicion)};${formatNumber(difImporte)};`;
      }

      if (isContratoDescomposicion) {
        csvContent += `\n`;
      } else {
        csvContent += `${formatNumber(varianza)}\n`;
      }
    };

    filteredData.forEach(item => addRowToCSV(item));

    const totalesExport = filteredData.reduce((acc, item) => {
      if (item.nat !== 'Partida') {
        return acc;
      }

      const contratoTipo = (item as any)[`${contratoKey}_tipo`] || '';
      const costeTipo = (item as any)[`${costeKey}_tipo`] || '';

      let contratoCant = parseFloat((item as any)[`${contratoKey}_cant`]) || 0;
      const contratoCantDescomp = parseFloat((item as any)[`${contratoKey}_cantdescomp`]);
      if (contratoTipo === 'Descompuesto') {
        contratoCant = contratoCantDescomp || 0;
      }

      let contratoPrecio = parseFloat((item as any)[`${contratoKey}_precio`]) || 0;
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
      const costeImporteK = costeCant * costePrecio * coefK;

      return {
        contrato: acc.contrato + contratoImporte,
        costeK: acc.costeK + costeImporteK
      };
    }, { contrato: 0, costeK: 0 });

    const diferenciaExport = totalesExport.contrato - totalesExport.costeK;
    const varianzaExport = totalesExport.contrato !== 0 ? ((diferenciaExport / totalesExport.contrato) * 100) : 0;

    csvContent += `;;;;TOTALES;;;${formatNumber(totalesExport.contrato)};`;
    csvContent += `;;;${formatNumber(totalesExport.costeK)};`;
    csvContent += `;${formatNumber(diferenciaExport)};${formatNumber(varianzaExport)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `analisis_detallado_${timestamp}.csv`;

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
              Análisis Detallado SGI
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
                <button
                  onClick={() => handleSort('contratoImporte')}
                  className="flex items-center justify-center gap-1 w-full hover:bg-blue-100 rounded px-1"
                  title="Ordenar por Importe"
                >
                  <span>Importe</span>
                  {getSortIcon('contratoImporte')}
                </button>
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
                <button
                  onClick={() => handleSort('costeImporteK')}
                  className="flex items-center justify-center gap-1 w-full hover:bg-amber-100 rounded px-1"
                  title="Ordenar por Importe.K"
                >
                  <span>Importe.K</span>
                  {getSortIcon('costeImporteK')}
                </button>
              </ResizableHeader>
            </tr>
          </thead>
          <tbody>
            {tree.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-8 text-center text-slate-500">
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
                    contratoVersion={contratoVersion}
                    costeVersion={costeVersion}
                    coefK={coefK}
                    columnWidths={columnWidths}
                    expandLevel={expandLevel}
                  />
                ))}
                <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold">
                  <td colSpan={4} className="sticky left-0 bg-slate-100 py-3 px-3 text-sm text-slate-900">
                    TOTALES
                  </td>
                  <td colSpan={2} className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-blue-100" style={{ width: `${columnWidths.contratoImporte}px` }}>
                    {formatNumber(totales.contrato)}
                  </td>
                  <td colSpan={3} className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-sm text-right font-mono font-bold bg-amber-100" style={{ width: `${columnWidths.costeImporteK}px` }}>
                    {formatNumber(totales.costeK)}
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
