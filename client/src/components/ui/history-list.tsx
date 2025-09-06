import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "./status-pills";
import { ExportToolbar } from "./export-toolbar";
import { 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Download,
  Calendar,
  Building,
  Eye,
  Copy
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProofHistoryItem {
  id: string;
  title: string;
  type: 'age' | 'citizenship' | 'income' | 'education';
  verifier: string;
  scope: string;
  status: 'verified' | 'pending' | 'failed' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  metadata?: {
    publicSignalsHash?: string;
    circuitVersion?: string;
    proofSize?: number;
    verificationTime?: number;
  };
}

interface HistoryListProps {
  items: ProofHistoryItem[];
  onItemClick?: (item: ProofHistoryItem) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  className?: string;
  showSearch?: boolean;
}

export function HistoryList({ 
  items, 
  onItemClick, 
  onExportCSV,
  onExportPDF,
  className,
  showSearch = true 
}: HistoryListProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  const filteredItems = React.useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.verifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.scope.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      age: '🎂',
      citizenship: '🇳🇵', 
      income: '💰',
      education: '🎓',
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Export Toolbar */}
      <ExportToolbar
        title="Proof History"
        selectedCount={selectedItems.size}
        totalCount={filteredItems.length}
        onExportCSV={onExportCSV}
        onExportPDF={onExportPDF}
        showFilters={showSearch}
      />

      {/* Search */}
      {showSearch && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search proofs by title, verifier, or scope..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border border-border-default rounded-lg bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20"
            data-testid="history-search"
          />
        </div>
      )}

      {/* History Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-text-secondary">
                {searchTerm ? 'No proofs found matching your search' : 'No proof history available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const isExpired = item.expiresAt && item.expiresAt < new Date();
            const actualStatus = isExpired ? 'expired' : item.status;

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Main Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Type Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {getTypeIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-text-primary truncate">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{item.verifier}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span className="truncate">{item.scope}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusPill status={actualStatus} size="sm" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-text-tertiary">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created {formatDistanceToNow(item.createdAt, { addSuffix: true })}</span>
                            </div>
                            {item.expiresAt && !isExpired && (
                              <span>
                                Expires {formatDistanceToNow(item.expiresAt, { addSuffix: true })}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(item.id)}
                              data-testid={`expand-${item.id}`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {actualStatus === 'expired' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-primary"
                                data-testid={`renew-${item.id}`}
                              >
                                Renew now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Meta */}
                  {isExpanded && item.metadata && (
                    <div className="px-4 pb-4 border-t border-border-default bg-surface-secondary/30">
                      <div className="pt-3 space-y-3">
                        <h4 className="text-sm font-medium text-text-primary">Proof Metadata</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {item.metadata.publicSignalsHash && (
                            <div>
                              <label className="text-text-tertiary">Public Signals Hash:</label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-surface px-2 py-1 rounded font-mono truncate">
                                  {item.metadata.publicSignalsHash.slice(0, 32)}...
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(item.metadata.publicSignalsHash!)}
                                  data-testid={`copy-hash-${item.id}`}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {item.metadata.circuitVersion && (
                            <div>
                              <label className="text-text-tertiary">Circuit Version:</label>
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  v{item.metadata.circuitVersion}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {item.metadata.proofSize && (
                            <div>
                              <label className="text-text-tertiary">Proof Size:</label>
                              <div className="mt-1 text-text-primary">
                                {(item.metadata.proofSize / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          )}

                          {item.metadata.verificationTime && (
                            <div>
                              <label className="text-text-tertiary">Verification Time:</label>
                              <div className="mt-1 text-text-primary">
                                {item.metadata.verificationTime}ms
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onItemClick?.(item)}
                            data-testid={`view-details-${item.id}`}
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`download-${item.id}`}
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}