import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronRight, ChevronDown, Download } from 'lucide-react';
import { fetchAnalisisDetallado, fetchPlanificacionData, AnalisisDetallado } from '../lib/supabase';

interface AnalisisPlanificacionProps {
  codObra: string;
  analisisVersion: number;
  contratoVersion: number;
  costeVersion: number;
  coefK: number;
}

interface TreeNode extends AnalisisDetallado {
  children: TreeNode[];
  comienzo?: string | null;
  fin?: string | null;
  duracion?: number | null;
}

type DataSource = 'contrato' | 'coste';
type ValueType = 'cantidad' | 'importe';

interface MonthColumn {
  year: number;
  month: number;
  label: string;
  monthNumber: number;
  dateLabel: string;
}

// Fixed column keys for Strict Order
const FIXED_COLUMN_KEYS = [
  'codigo', 'nat', 'descripcion', 'ud', 'usertext',
  'medVenta', 'fechaInicio', 'fechaFin',
  'duracDias', 'duracMes', 'rtoDias'
] as const;

type FixedColumnKey = typeof FIXED_COLUMN_KEYS[number];

type ColumnWidths = Record<FixedColumnKey, number> & { month: number };

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

function getWorkingDaysInMonth(year: number, month: number, startDate?: Date, endDate?: Date, isLastMonth: boolean = false): number {
  const firstDay = startDate && startDate.getFullYear() === year && startDate.getMonth() === month
    ? startDate.getDate()
    : 1;

  const isEndDateInMonth = endDate && endDate.getFullYear() === year && endDate.getMonth() === month;

  if (startDate && endDate && startDate.toDateString() === endDate.toDateString() &&
    startDate.getFullYear() === year && startDate.getMonth() === month) {
    const dayOfWeek = startDate.getDay();
    return (dayOfWeek !== 0 && dayOfWeek !== 6) ? 1 : 0;
  }

  const lastDay = isEndDateInMonth && isLastMonth
    ? endDate.getDate() - 1
    : isEndDateInMonth
      ? endDate.getDate()
      : new Date(year, month + 1, 0).getDate();

  let workingDays = 0;
  for (let day = firstDay; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
}

function getTotalWorkingDays(startDate: Date, endDate: Date): number {
  if (startDate.toDateString() === endDate.toDateString()) {
    const dayOfWeek = startDate.getDay();
    return (dayOfWeek !== 0 && dayOfWeek !== 6) ? 1 : 0;
  }

  let totalDays = 0;
  const current = new Date(startDate);

  while (current < endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      totalDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return totalDays;
}

function getAllDatesFromTree(nodes: TreeNode[], planMap: Map<string, { comienzo: Date; fin: Date }>): Date[] {
  const dates: Date[] = [];

  function traverse(node: TreeNode) {
    const planData = planMap.get(node.plan_guid);
    if (planData) {
      dates.push(planData.comienzo, planData.fin);
    }
    node.children.forEach(child => traverse(child));
  }

  nodes.forEach(node => traverse(node));
  return dates;
}

function generateMonthColumns(data: TreeNode[], planMap: Map<string, { comienzo: Date; fin: Date }>): MonthColumn[] {
  const dates = getAllDatesFromTree(data, planMap);

  if (dates.length === 0) return [];

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  const columns: MonthColumn[] = [];
  const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  let monthCounter = 1;
  while (current <= end) {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const day = 1;
    const month = current.getMonth() + 1;
    const year = current.getFullYear().toString().slice(-2);

    columns.push({
      year: current.getFullYear(),
      month: current.getMonth(),
      label: `${monthNames[current.getMonth()]} ${current.getFullYear()}`,
      monthNumber: monthCounter,
      dateLabel: `${day}/${month}/${year}`
    });
    current.setMonth(current.getMonth() + 1);
    monthCounter++;
  }

  return columns;
}

function calculateMonthlyValue(
  totalValue: number,
  startDate: Date,
  endDate: Date,
  targetYear: number,
  targetMonth: number
): number {
  const monthStart = new Date(targetYear, targetMonth, 1);
  const monthEnd = new Date(targetYear, targetMonth + 1, 0);

  if (endDate < monthStart || startDate > monthEnd) {
    return 0;
  }

  const overlapStart = startDate > monthStart ? startDate : monthStart;
  const overlapEnd = endDate < monthEnd ? endDate : monthEnd;

  const isLastMonth = endDate.getFullYear() === targetYear && endDate.getMonth() === targetMonth;
  const workingDaysInMonth = getWorkingDaysInMonth(targetYear, targetMonth, overlapStart, overlapEnd, isLastMonth);
  const totalWorkingDays = getTotalWorkingDays(startDate, endDate);

  if (totalWorkingDays === 0) return 0;

  return (totalValue / totalWorkingDays) * workingDaysInMonth;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

function calculateDurationDays(start: Date | null | undefined, end: Date | null | undefined): number {
  if (start && end) {
    const diffTime = end.getTime() - start.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return days;
  }
  return 0;
}

function calculateDurationMonths(days: number): number {
  return days / 30;
}

function getOverlapDays(startDate: Date, endDate: Date, monthStart: Date, monthEnd: Date): number {
  if (endDate < monthStart || startDate > monthEnd) {
    return 0;
  }

  const overlapStart = startDate > monthStart ? startDate : monthStart;
  const overlapEnd = endDate < monthEnd ? endDate : monthEnd;

  const diffTime = overlapEnd.getTime() - overlapStart.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return days > 0 ? days : 0;
}

function ResizableHeader({
  children,
  columnKey,
  columnWidths,
  onResize,
  className = '',
  style = {},
  ...props
}: {
  children: React.ReactNode;
  columnKey: keyof ColumnWidths;
  columnWidths: ColumnWidths;
  onResize: (key: any, width: number) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = (columnWidths as any)[columnKey];
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX.current;
      const newWidth = Math.max(40, startWidth.current + diff);
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
      style={{ ...style }}
      {...props}
    >
      {children}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 group z-50"
        onMouseDown={handleMouseDown}
      >
        <div className="w-1 h-full group-hover:bg-blue-500 transition-colors" />
      </div>
    </th>
  );
}

interface TreeNodeRowProps {
  node: TreeNode;
  level: number;
  contratoVersion: number;
  costeVersion: number;
  coefK: number;
  expandLevel: number;
  dataSource: DataSource;
  sourceVersion: number;
  valueType: ValueType;
  monthColumns: MonthColumn[];
  planData: Map<string, { comienzo: Date; fin: Date }>;
  columnWidths: ColumnWidths;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
  leftPositions: Record<FixedColumnKey, number>;
}

function TreeNodeRow({
  node,
  level,
  contratoVersion,
  costeVersion,
  coefK,
  expandLevel,
  dataSource,
  sourceVersion,
  valueType,
  monthColumns,
  planData,
  columnWidths,
  expandedNodes,
  onToggleNode,
  leftPositions
}: TreeNodeRowProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.Guid_SGI);

  const getBgColor = () => {
    if (node.nat === 'Capítulo') {
      if (node.Nivel === 1) return 'bg-emerald-200';
      if (node.Nivel === 2) return 'bg-emerald-150';
      if (node.Nivel === 3) return 'bg-emerald-100';
      if (node.Nivel === 4) return 'bg-emerald-50';
      return 'bg-emerald-50';
    }
    return '';
  };

  const getTextColor = () => {
    if (node.nat === 'Capítulo') return 'font-bold';
    if (['Material', 'Mano de obra', 'Maquinaria', 'Otros'].includes(node.nat)) return 'text-slate-500';
    return '';
  };

  const indentWidth = level * 20;

  const versionKey = `${dataSource === 'contrato' ? 'Contrato' : 'Coste'}_v${sourceVersion}`;

  let baseValue = 0;
  if (valueType === 'cantidad') {
    baseValue = parseFloat((node as any)[`${versionKey}_cant`]) || 0;
  } else {
    baseValue = parseFloat((node as any)[`${versionKey}_importe`]) || 0;

    if (dataSource === 'coste') {
      baseValue = baseValue * coefK;
    }
  }

  const dates = planData.get(node.plan_guid);

  const durationDays = dates ? calculateDurationDays(dates.comienzo, dates.fin) : 0;
  const durationMonths = calculateDurationMonths(durationDays);
  const rtoDias = durationDays > 0 ? baseValue / durationDays : 0;

  const monthlyValues = monthColumns.map(col => {
    if (!dates) return 0;
    return calculateMonthlyValue(baseValue, dates.comienzo, dates.fin, col.year, col.month);
  });

  return (
    <>
      <tr className={`border-b border-slate-200 hover:bg-slate-50 ${getBgColor()}`}>
        {/* CODIGO */}
        <td className={`py-1 px-2 text-xs border-r border-slate-200 ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.codigo}px`, width: `${columnWidths.codigo}px`, paddingLeft: `${indentWidth + 8}px` }}>
          <div className="flex items-center">
            {hasChildren ? (
              <button onClick={() => onToggleNode(node.Guid_SGI)} className="mr-1 hover:bg-slate-300 rounded p-0.5">
                {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-600" /> : <ChevronRight className="w-3 h-3 text-slate-600" />}
              </button>
            ) : (
              <div className="w-4 mr-1" />
            )}
            <span className={`font-medium font-mono text-[10px] ${getTextColor() || 'text-slate-700'}`}>{node.codigo}</span>
          </div>
        </td>

        {/* NAT */}
        <td className={`py-1 px-2 text-[10px] text-center border-r border-slate-200 ${getTextColor() || 'text-slate-600'} ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.nat}px`, width: `${columnWidths.nat}px` }}>{node.nat}</td>

        {/* DESCRIPCION */}
        <td className={`py-1 px-2 text-xs border-r border-slate-200 ${getTextColor() || 'text-slate-900'} ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.descripcion}px`, width: `${columnWidths.descripcion}px` }}>{node.resumen}</td>

        {/* UD */}
        <td className={`py-1 px-2 text-[10px] text-center border-r border-slate-200 text-slate-600 ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.ud}px`, width: `${columnWidths.ud}px` }}>{node.ud}</td>

        {/* USERTEXT */}
        <td className={`py-1 px-2 text-[10px] border-r border-slate-200 text-slate-600 ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.usertext}px`, width: `${columnWidths.usertext}px` }}>{node.UserText}</td>

        {/* IMPORTE / CANTIDAD */}
        <td className={`py-1 px-2 text-xs text-right font-mono border-r border-slate-200 ${getBgColor() || 'bg-white'} bg-yellow-50 sticky z-40`} style={{ left: `${leftPositions.medVenta}px`, width: `${columnWidths.medVenta}px` }}>{formatNumber(baseValue)}</td>

        {/* FECHA INICIO */}
        <td className={`py-1 px-2 text-[10px] text-center border-r border-slate-200 ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.fechaInicio}px`, width: `${columnWidths.fechaInicio}px` }}>{formatDate(dates?.comienzo)}</td>

        {/* FECHA FIN */}
        <td className={`py-1 px-2 text-[10px] text-center border-r border-slate-200 ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.fechaFin}px`, width: `${columnWidths.fechaFin}px` }}>{formatDate(dates?.fin)}</td>

        {/* DURAC DIAS */}
        <td className={`py-1 px-2 text-[10px] text-center border-r border-slate-200 ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.duracDias}px`, width: `${columnWidths.duracDias}px` }}>{durationDays > 0 ? durationDays : ''}</td>

        {/* DURAC MES */}
        <td className={`py-1 px-2 text-[10px] text-center border-r border-slate-200 ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.duracMes}px`, width: `${columnWidths.duracMes}px` }}>{durationMonths > 0 ? formatNumber(durationMonths) : ''}</td>

        {/* RTO DIAS */}
        <td className={`py-1 px-2 text-xs text-right font-mono border-r-2 border-slate-400 ${getBgColor() || 'bg-white'} sticky z-40`} style={{ left: `${leftPositions.rtoDias}px`, width: `${columnWidths.rtoDias}px` }}>{rtoDias > 0 ? formatNumber(rtoDias) : ''}</td>

        {/* MONTHS */}
        {monthlyValues.map((value, idx) => (
          <td key={idx} className={`py-1 px-2 text-xs text-right font-mono border-r border-blue-200 ${getBgColor() || 'bg-blue-50'}`} style={{ width: `${columnWidths.month}px` }}>
            {value > 0 ? formatNumber(value) : ''}
          </td>
        ))}
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
              expandLevel={expandLevel}
              dataSource={dataSource}
              sourceVersion={sourceVersion}
              valueType={valueType}
              monthColumns={monthColumns}
              planData={planData}
              columnWidths={columnWidths}
              expandedNodes={expandedNodes}
              onToggleNode={onToggleNode}
              leftPositions={leftPositions}
            />
          ))}
        </>
      )}
    </>
  );
}


export default function AnalisisPlanificacion({
  codObra,
  analisisVersion,
  contratoVersion,
  costeVersion,
  coefK
}: AnalisisPlanificacionProps) {
  const [data, setData] = useState<TreeNode[]>([]);
  const [planData, setPlanData] = useState<Map<string, { comienzo: Date; fin: Date }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandLevel, setExpandLevel] = useState<number>(1);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [dataSource, setDataSource] = useState<DataSource>('contrato');
  const [sourceVersion, setSourceVersion] = useState<number>(0);
  const [valueType, setValueType] = useState<ValueType>('importe');
  const [monthColumns, setMonthColumns] = useState<MonthColumn[]>([]);

  // Initial standard widths - will be adjusted on load
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    codigo: 120,
    nat: 50,
    descripcion: 250,
    ud: 40,
    usertext: 100,
    medVenta: 90,
    fechaInicio: 70,
    fechaFin: 70,
    duracDias: 50,
    duracMes: 50,
    rtoDias: 90,
    month: 90
  });

  const handleResize = (key: FixedColumnKey | 'month', width: number) => {
    setColumnWidths(prev => ({ ...prev, [key]: width }));
  };

  useEffect(() => {
    // Force 50/50 split on mount
    const updateLayout = () => {
      const halfScreen = window.innerWidth / 2;

      // Calculate total width of fixed columns excluding descripcion
      let fixedWithoutDesc = 0;
      FIXED_COLUMN_KEYS.forEach(key => {
        if (key !== 'descripcion') {
          fixedWithoutDesc += columnWidths[key];
        }
      });

      // Descripcion fills the rest of the half screen
      // Minimum 150px to prevent breaking
      const newDescWidth = Math.max(150, halfScreen - fixedWithoutDesc);

      // Apply change only if significant
      if (Math.abs(columnWidths.descripcion - newDescWidth) > 5) {
        setColumnWidths(prev => ({ ...prev, descripcion: newDescWidth }));
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [
    // Re-run if any OTHER column size changes, to keep the 50/50 split
    columnWidths.codigo, columnWidths.nat, columnWidths.ud, columnWidths.usertext,
    columnWidths.medVenta, columnWidths.fechaInicio, columnWidths.fechaFin,
    columnWidths.duracDias, columnWidths.duracMes, columnWidths.rtoDias
  ]);

  useEffect(() => {
    loadData();
  }, [codObra, analisisVersion, coefK]);

  useEffect(() => {
    const newExpanded = new Set<string>();
    function expandToLevel(nodes: TreeNode[], currentLevel: number) {
      nodes.forEach(node => {
        if (node.children.length > 0 && currentLevel < expandLevel) {
          newExpanded.add(node.Guid_SGI);
          expandToLevel(node.children, currentLevel + 1);
        }
      });
    }
    expandToLevel(data, 0);
    setExpandedNodes(newExpanded);
  }, [expandLevel, data]);

  const handleToggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  async function loadData() {
    try {
      setLoading(true);
      const [analisisData, planifData] = await Promise.all([
        fetchAnalisisDetallado(codObra, analisisVersion, coefK),
        fetchPlanificacionData(codObra)
      ]);

      const filteredAnalisisData = analisisData.filter(item =>
        !['Material', 'Mano de obra', 'Maquinaria', 'Otros'].includes(item.nat)
      );

      const tree = buildTree(filteredAnalisisData);
      setData(tree);

      const planMap = new Map<string, { comienzo: Date; fin: Date }>();
      planifData.forEach(item => {
        if (item.comienzo && item.fin && item.plan_guid) {
          planMap.set(item.plan_guid, {
            comienzo: new Date(item.comienzo),
            fin: new Date(item.fin)
          });
        }
      });
      setPlanData(planMap);

      const months = generateMonthColumns(tree, planMap);
      setMonthColumns(months);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  const getValueColumnHeader = () => {
    const source = dataSource === 'contrato' ? 'CONTRATO' : 'COSTE';
    const value = valueType === 'cantidad' ? 'CANT' : 'IMP';
    return `${value}.${source}`;
  };

  const calculateTotals = () => {
    const versionKey = `${dataSource === 'contrato' ? 'Contrato' : 'Coste'}_v${sourceVersion}`;
    let totalBaseValue = 0;
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    const monthTotals = new Map<string, number>();

    const processNode = (node: TreeNode) => {
      if (node.nat === 'Partida') {
        let nodeValue = 0;
        if (valueType === 'cantidad') {
          nodeValue = parseFloat((node as any)[`${versionKey}_cant`]) || 0;
        } else {
          nodeValue = parseFloat((node as any)[`${versionKey}_importe`]) || 0;
          if (dataSource === 'coste') {
            nodeValue = nodeValue * coefK;
          }
        }
        totalBaseValue += nodeValue;

        const planInfo = planData.get(node.plan_guid);
        if (planInfo) {
          if (!minDate || planInfo.comienzo < minDate) {
            minDate = planInfo.comienzo;
          }
          if (!maxDate || planInfo.fin > maxDate) {
            maxDate = planInfo.fin;
          }

          let nodeBaseValue = 0;
          if (valueType === 'cantidad') {
            nodeBaseValue = parseFloat((node as any)[`${versionKey}_cant`]) || 0;
          } else {
            nodeBaseValue = parseFloat((node as any)[`${versionKey}_importe`]) || 0;
            if (dataSource === 'coste') {
              nodeBaseValue = nodeBaseValue * coefK;
            }
          }

          const duracDias = calculateDurationDays(planInfo.comienzo, planInfo.fin);

          monthColumns.forEach(col => {
            const monthKey = `${col.year}-${String(col.month + 1).padStart(2, '0')}`;
            const monthStart = new Date(col.year, col.month, 1);
            const monthEnd = new Date(col.year, col.month + 1, 0);
            const overlapDays = getOverlapDays(planInfo.comienzo, planInfo.fin, monthStart, monthEnd);

            if (overlapDays > 0 && duracDias > 0) {
              const monthValue = (nodeBaseValue / duracDias) * overlapDays;
              monthTotals.set(monthKey, (monthTotals.get(monthKey) || 0) + monthValue);
            }
          });
        }
      }

      node.children.forEach(child => processNode(child));
    };

    data.forEach(node => processNode(node));

    return {
      totalBaseValue,
      minDate,
      maxDate,
      monthTotals
    };
  };

  const totals = useMemo(() => calculateTotals(), [data, planData, dataSource, sourceVersion, valueType, coefK, monthColumns]);

  const exportToExcel = () => {
    // ... exact export logic ...
    // Keeping it brief for this artifact update
    let csvContent = '\uFEFF';
    csvContent += 'Código;Nat.;Descripción;UD;UserText;' + getValueColumnHeader() + ';';
    csvContent += 'Fecha Inicio;Fecha Fin;Durac.dias;Durac.mes;Rto/dias;';
    monthColumns.forEach(col => {
      csvContent += `mes ${col.monthNumber} (${col.dateLabel});`;
    });
    csvContent += '\n';

    const escapeCsv = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const addRowToCSV = (node: TreeNode, level: number = 0) => {
      const versionKey = `${dataSource === 'contrato' ? 'Contrato' : 'Coste'}_v${sourceVersion}`;
      let baseValue = 0;
      if (valueType === 'cantidad') {
        baseValue = parseFloat((node as any)[`${versionKey}_cant`]) || 0;
      } else {
        baseValue = parseFloat((node as any)[`${versionKey}_importe`]) || 0;
      }
      const planInfo = planData.get(node.plan_guid);
      const fechaInicio = planInfo?.comienzo ? formatDate(planInfo.comienzo) : '';
      const fechaFin = planInfo?.fin ? formatDate(planInfo.fin) : '';
      const duracDias = planInfo ? calculateDurationDays(planInfo.comienzo, planInfo.fin) : 0;
      const duracMes = duracDias > 0 ? (duracDias / 30).toFixed(2) : '';
      const rtoDias = duracDias > 0 ? (baseValue / duracDias).toFixed(2) : '';

      csvContent += `${escapeCsv(node.codigo)};${escapeCsv(node.nat)};${escapeCsv(node.resumen)};${escapeCsv(node.ud)};${escapeCsv(node.UserText)};`;
      csvContent += `${formatNumber(baseValue)};`;
      csvContent += `${fechaInicio};${fechaFin};${duracDias};${duracMes};${rtoDias};`;

      monthColumns.forEach(col => {
        const monthKey = `${col.year}-${String(col.month).padStart(2, '0')}`;
        let monthValue = 0;
        const nodeMonthValue = (node as any)[monthKey];
        if (nodeMonthValue !== undefined && nodeMonthValue !== null) {
          monthValue = parseFloat(nodeMonthValue) || 0;
        } else if (planInfo) {
          const monthStart = new Date(col.year, col.month - 1, 1);
          const monthEnd = new Date(col.year, col.month, 0);
          const overlapDays = getOverlapDays(planInfo.comienzo, planInfo.fin, monthStart, monthEnd);
          if (overlapDays > 0 && duracDias > 0) {
            monthValue = (baseValue / duracDias) * overlapDays;
          }
        }
        csvContent += `${formatNumber(monthValue)};`;
      });
      csvContent += '\n';
      node.children.forEach(child => addRowToCSV(child, level + 1));
    };

    data.forEach(node => addRowToCSV(node));
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `analisis_planificacion_${timestamp}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Pre-calculate Left Positions for one-pass read
  // We use FIXED_COLUMN_KEYS to guarantee order
  const leftPositions = {} as Record<FixedColumnKey, number>;
  let currentLeft = 0;
  FIXED_COLUMN_KEYS.forEach(key => {
    leftPositions[key] = currentLeft;
    currentLeft += columnWidths[key];
  });

  const fixedColumnsTotalWidth = currentLeft;
  const totalTableWidth = fixedColumnsTotalWidth + (monthColumns.length * columnWidths.month);

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
              Análisis Planificación
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm text-slate-600 mr-2">Fuente:</label>
              <select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value as DataSource)}
                className="px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="contrato">Contrato</option>
                <option value="coste">Coste</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600 mr-2">Versión:</label>
              <select
                value={sourceVersion}
                onChange={(e) => setSourceVersion(Number(e.target.value))}
                className="px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value={0}>V0</option>
                <option value={1}>V1</option>
                <option value={2}>V2</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600 mr-2">Valor:</label>
              <select
                value={valueType}
                onChange={(e) => setValueType(e.target.value as ValueType)}
                className="px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="cantidad">Cantidad</option>
                <option value="importe">{dataSource === 'coste' ? 'ImporteK' : 'Importe'}</option>
              </select>
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
      </div>

      <div className="overflow-x-auto overflow-y-auto h-[calc(100vh-280px)]">
        <table className="border-collapse" style={{ width: `${totalTableWidth}px`, tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-50">
            <tr className="border-b-2 border-slate-300 bg-slate-100">
              <ResizableHeader columnKey="codigo" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-left text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky left-0 z-50" style={{ left: `${leftPositions.codigo}px`, width: columnWidths.codigo }}>Código</ResizableHeader>
              <ResizableHeader columnKey="nat" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-center text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.nat}px`, width: columnWidths.nat }}>Nat.</ResizableHeader>
              <ResizableHeader columnKey="descripcion" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-left text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.descripcion}px`, width: columnWidths.descripcion }}>Descripción</ResizableHeader>
              <ResizableHeader columnKey="ud" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-center text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.ud}px`, width: columnWidths.ud }}>UD</ResizableHeader>
              <ResizableHeader columnKey="usertext" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-left text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.usertext}px`, width: columnWidths.usertext }}>UserText</ResizableHeader>
              <ResizableHeader columnKey="medVenta" columnWidths={columnWidths} onResize={handleResize} className="bg-yellow-100 py-2 px-2 text-center text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.medVenta}px`, width: columnWidths.medVenta }}>{getValueColumnHeader()}</ResizableHeader>
              <ResizableHeader columnKey="fechaInicio" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-center text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.fechaInicio}px`, width: columnWidths.fechaInicio }}>Fecha Inicio</ResizableHeader>
              <ResizableHeader columnKey="fechaFin" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-center text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.fechaFin}px`, width: columnWidths.fechaFin }}>Fecha Fin</ResizableHeader>
              <ResizableHeader columnKey="duracDias" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-center text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.duracDias}px`, width: columnWidths.duracDias }}>Durac.dias</ResizableHeader>
              <ResizableHeader columnKey="duracMes" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-center text-[10px] font-semibold text-slate-700 uppercase border-r border-slate-200 sticky z-50" style={{ left: `${leftPositions.duracMes}px`, width: columnWidths.duracMes }}>Durac.mes</ResizableHeader>
              <ResizableHeader columnKey="rtoDias" columnWidths={columnWidths} onResize={handleResize} className="bg-slate-100 py-2 px-2 text-center text-[10px] font-semibold text-slate-700 uppercase border-r-2 border-slate-400 sticky z-50" style={{ left: `${leftPositions.rtoDias}px`, width: columnWidths.rtoDias }}>Rto/dias</ResizableHeader>

              {monthColumns.map((col, idx) => (
                <th key={idx} className="py-2 px-2 text-center text-[10px] font-semibold bg-blue-100 border-r border-blue-200 relative z-0" style={{ width: `${columnWidths.month}px` }}>
                  <div className="flex flex-col">
                    <span className="text-blue-900 font-bold text-[10px]">mes {col.monthNumber}</span>
                    <span className="text-blue-700 text-[9px]">{col.dateLabel}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={11 + monthColumns.length} className="p-8 text-center text-slate-500">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              data.map((node) => (
                <TreeNodeRow
                  key={node.Guid_SGI}
                  node={node}
                  level={0}
                  contratoVersion={contratoVersion}
                  costeVersion={costeVersion}
                  coefK={coefK}
                  expandLevel={expandLevel}
                  dataSource={dataSource}
                  sourceVersion={sourceVersion}
                  valueType={valueType}
                  monthColumns={monthColumns}
                  planData={planData}
                  columnWidths={columnWidths}
                  expandedNodes={expandedNodes}
                  onToggleNode={handleToggleNode}
                  leftPositions={leftPositions}
                />
              ))
            )}
          </tbody>
          <tfoot className="sticky bottom-0 z-50 border-t-2 border-slate-400">
            <tr className="bg-slate-200 font-bold">
              <td className="py-2 px-2 text-left text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.codigo}px`, width: columnWidths.codigo }}>TOTALES</td>
              <td className="py-2 px-2 text-center text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.nat}px`, width: columnWidths.nat }}></td>
              <td className="py-2 px-2 text-left text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.descripcion}px`, width: columnWidths.descripcion }}></td>
              <td className="py-2 px-2 text-center text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.ud}px`, width: columnWidths.ud }}></td>
              <td className="py-2 px-2 text-left text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.usertext}px`, width: columnWidths.usertext }}></td>
              <td className="bg-yellow-200 py-2 px-2 text-right text-[10px] text-slate-900 border-r border-slate-300 sticky z-50" style={{ left: `${leftPositions.medVenta}px`, width: columnWidths.medVenta }}>
                {formatNumber(totals.totalBaseValue)}
              </td>
              <td className="py-2 px-2 text-center text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.fechaInicio}px`, width: columnWidths.fechaInicio }}>
                {totals.minDate ? formatDate(totals.minDate) : ''}
              </td>
              <td className="py-2 px-2 text-center text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.fechaFin}px`, width: columnWidths.fechaFin }}>
                {totals.maxDate ? formatDate(totals.maxDate) : ''}
              </td>
              <td className="py-2 px-2 text-center text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.duracDias}px`, width: columnWidths.duracDias }}></td>
              <td className="py-2 px-2 text-center text-[10px] text-slate-900 border-r border-slate-300 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.duracMes}px`, width: columnWidths.duracMes }}></td>
              <td className="py-2 px-2 text-center text-[10px] text-slate-900 border-r-2 border-slate-400 sticky z-50 bg-slate-200" style={{ left: `${leftPositions.rtoDias}px`, width: columnWidths.rtoDias }}></td>

              {monthColumns.map((col, idx) => (
                <td key={idx} className="py-2 px-2 text-right text-[10px] text-slate-900 border-r border-slate-300 font-mono bg-blue-100" style={{ width: columnWidths.month }}>
                  {formatNumber(totals.monthTotals.get(`${col.year}-${String(col.month + 1).padStart(2, '0')}`))}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
