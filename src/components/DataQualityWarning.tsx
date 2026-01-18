import { AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

export interface DataQualityIssue {
  severity: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  details?: string[];
}

interface DataQualityWarningProps {
  issues: DataQualityIssue[];
  onDismiss?: () => void;
}

export default function DataQualityWarning({ issues, onDismiss }: DataQualityWarningProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (issues.length === 0 || isDismissed) {
    return null;
  }

  const highestSeverity = issues.some(i => i.severity === 'error')
    ? 'error'
    : issues.some(i => i.severity === 'warning')
    ? 'warning'
    : 'info';

  const getBgColor = () => {
    switch (highestSeverity) {
      case 'error': return 'bg-red-50 border-red-300';
      case 'warning': return 'bg-yellow-50 border-yellow-300';
      case 'info': return 'bg-blue-50 border-blue-300';
    }
  };

  const getIconColor = () => {
    switch (highestSeverity) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
    }
  };

  const getTextColor = () => {
    switch (highestSeverity) {
      case 'error': return 'text-red-900';
      case 'warning': return 'text-yellow-900';
      case 'info': return 'text-blue-900';
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getBgColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`mt-0.5 ${getIconColor()}`}>
            {highestSeverity === 'info' ? (
              <Info className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold mb-1 ${getTextColor()}`}>
              {issues.length === 1 ? issues[0].title : `${issues.length} problemas detectados con los datos`}
            </h3>
            {issues.length === 1 ? (
              <div>
                <p className={`text-sm ${getTextColor()}`}>{issues[0].message}</p>
                {issues[0].details && issues[0].details.length > 0 && (
                  <ul className={`mt-2 text-sm space-y-1 ${getTextColor()}`}>
                    {issues[0].details.map((detail, idx) => (
                      <li key={idx} className="ml-4 list-disc">{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`text-sm font-medium underline hover:no-underline ${getTextColor()}`}
                >
                  {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    {issues.map((issue, idx) => (
                      <div key={idx} className="border-l-2 border-current pl-3">
                        <h4 className="font-semibold text-sm">{issue.title}</h4>
                        <p className="text-sm mt-1">{issue.message}</p>
                        {issue.details && issue.details.length > 0 && (
                          <ul className="mt-2 text-sm space-y-1">
                            {issue.details.map((detail, detailIdx) => (
                              <li key={detailIdx} className="ml-4 list-disc">{detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className={`ml-2 hover:bg-black/10 rounded p-1 transition-colors ${getIconColor()}`}
          title="Cerrar advertencia"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
