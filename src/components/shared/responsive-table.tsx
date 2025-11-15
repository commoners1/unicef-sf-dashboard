import { useState, useEffect, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye, Copy, Trash2, Edit } from 'lucide-react';

interface ResponsiveTableProps {
  children: ReactNode; // Desktop table component
  data: any[];
  getRowKey: (item: any, index: number) => string;
  renderMobileCard: (item: any, index: number) => {
    id: string | ReactNode;
    primaryFields: Array<{ label: string; value: ReactNode }>;
    secondaryFields?: Array<{ label: string; value: ReactNode }>;
    actions?: {
      view?: () => void;
      copy?: () => void;
      delete?: () => void;
      edit?: () => void;
    };
  };
  emptyMessage?: string;
  loading?: boolean;
}

export function ResponsiveTable({
  children,
  data,
  getRowKey,
  renderMobileCard,
  emptyMessage = 'No data available',
  loading = false,
}: ResponsiveTableProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isMobile) {
    // Mobile/Tablet Card View
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Loading...</span>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>
      );
    }

    return (
      <div className="space-y-2 p-3">
        {data.map((item, index) => {
          const rowKey = getRowKey(item, index);
          const isExpanded = expandedRows.has(rowKey);
          const cardData = renderMobileCard(item, index);

          const toggleExpand = () => {
            const newExpanded = new Set(expandedRows);
            if (isExpanded) {
              newExpanded.delete(rowKey);
            } else {
              newExpanded.add(rowKey);
            }
            setExpandedRows(newExpanded);
          };

          return (
            <Card key={rowKey} className="border shadow-sm">
              <CardContent className="p-3">
                {/* Header Row: ID + Action Icons */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {cardData.id}
                    </div>
                  </div>
                  {cardData.actions && (
                    <div className="flex items-center gap-1 ml-2">
                      {cardData.actions.view && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={cardData.actions.view}
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {cardData.actions.copy && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={cardData.actions.copy}
                          aria-label="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                      {cardData.actions.delete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={cardData.actions.delete}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {cardData.actions.edit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={cardData.actions.edit}
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Details - Always Visible */}
                <div className="space-y-2 mb-2">
                  {cardData.primaryFields.map((field, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2">
                      <span className="text-xs text-muted-foreground font-medium min-w-[80px]">
                        {field.label}:
                      </span>
                      <div className="text-xs text-foreground flex-1 text-right">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secondary Details - Expandable */}
                {cardData.secondaryFields && cardData.secondaryFields.length > 0 && (
                  <>
                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t mt-2">
                        {cardData.secondaryFields.map((field, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2">
                            <span className="text-xs text-muted-foreground font-medium min-w-[80px]">
                              {field.label}:
                            </span>
                            <div className="text-xs text-foreground flex-1 text-right">
                              {field.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* View More Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleExpand}
                      className="w-full mt-2 h-8 text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          View Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          View More
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop Table View
  return <>{children}</>;
}

