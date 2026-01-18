import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { AnalisisDetallado } from '../lib/supabase';

interface TreeViewProps {
  data: AnalisisDetallado[];
  selectedItem?: AnalisisDetallado;
  onSelectItem: (item: AnalisisDetallado) => void;
}

interface TreeNode extends AnalisisDetallado {
  children: TreeNode[];
}

function buildTree(items: AnalisisDetallado[]): TreeNode[] {
  const itemMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  items.forEach(item => {
    itemMap.set(item.Guid_SGI, { ...item, children: [] });
  });

  items.forEach(item => {
    const node = itemMap.get(item.Guid_SGI);
    if (node) {
      if (item.CodSup && itemMap.has(item.CodSup)) {
        const parent = itemMap.get(item.CodSup);
        parent?.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
}

function TreeNodeComponent({
  node,
  level,
  selectedItem,
  onSelectItem
}: {
  node: TreeNode;
  level: number;
  selectedItem?: AnalisisDetallado;
  onSelectItem: (item: AnalisisDetallado) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedItem?.Guid_SGI === node.Guid_SGI;

  const indentWidth = level * 20;

  return (
    <div>
      <div
        className={`flex items-center py-2 px-3 cursor-pointer hover:bg-slate-100 border-b border-slate-200 ${
          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
        }`}
        style={{ paddingLeft: `${indentWidth + 12}px` }}
        onClick={() => onSelectItem(node)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mr-2 hover:bg-slate-200 rounded p-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6 mr-2" />}

          <span className="text-xs text-slate-500 mr-3 font-mono">
            Nivel {node.Nivel}
          </span>

          <span className="text-sm font-medium text-slate-700 mr-3 font-mono">
            {node.codigo}
          </span>

          <span className="text-sm text-slate-900 truncate flex-1">
            {node.resumen}
          </span>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.Guid_SGI}
              node={child}
              level={level + 1}
              selectedItem={selectedItem}
              onSelectItem={onSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ data, selectedItem, onSelectItem }: TreeViewProps) {
  const tree = buildTree(data);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Estructura de Capítulos
        </h2>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        {tree.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay datos disponibles
          </div>
        ) : (
          tree.map((node) => (
            <TreeNodeComponent
              key={node.Guid_SGI}
              node={node}
              level={0}
              selectedItem={selectedItem}
              onSelectItem={onSelectItem}
            />
          ))
        )}
      </div>
    </div>
  );
}
