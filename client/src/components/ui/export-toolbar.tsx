import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table, Calendar, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportToolbarProps {
  title?: string;
  selectedCount?: number;
  totalCount?: number;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  className?: string;
  disabled?: boolean;
  showFilters?: boolean;
  onFilterToggle?: () => void;
}

export function ExportToolbar({
  title = "Export Data",
  selectedCount = 0,
  totalCount = 0,
  onExportCSV,
  onExportPDF,
  onExportJSON,
  className,
  disabled = false,
  showFilters = false,
  onFilterToggle,
}: ExportToolbarProps) {
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      switch (format) {
        case 'csv':
          await onExportCSV?.();
          break;
        case 'pdf':
          await onExportPDF?.();
          break;
        case 'json':
          await onExportJSON?.();
          break;
      }

      toast({
        title: "Export Started",
        description: `${format.toUpperCase()} export is being generated...`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Failed to export as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    }
  };

  const exportText = selectedCount > 0 
    ? `Export ${selectedCount} selected` 
    : totalCount > 0 
    ? `Export all ${totalCount}` 
    : "Export";

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-3 bg-surface border-b border-border-default",
      className
    )}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
        {totalCount > 0 && (
          <span className="text-xs text-text-tertiary">
            ({selectedCount > 0 ? `${selectedCount} of ` : ''}{totalCount} items)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Filter Toggle */}
        {showFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterToggle}
            data-testid="export-filter-toggle"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        )}

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="primary"
              size="sm"
              disabled={disabled || totalCount === 0}
              data-testid="export-dropdown-trigger"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportText}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* CSV Export */}
            <DropdownMenuItem
              onClick={() => handleExport('csv')}
              data-testid="export-csv"
            >
              <Table className="h-4 w-4 mr-3" />
              <div className="flex-1">
                <div className="font-medium">CSV Spreadsheet</div>
                <div className="text-xs text-text-tertiary">
                  Compatible with Excel
                </div>
              </div>
            </DropdownMenuItem>

            {/* PDF Export */}
            <DropdownMenuItem
              onClick={() => handleExport('pdf')}
              data-testid="export-pdf"
            >
              <FileText className="h-4 w-4 mr-3" />
              <div className="flex-1">
                <div className="font-medium">PDF Document</div>
                <div className="text-xs text-text-tertiary">
                  Print-friendly format
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* JSON Export */}
            <DropdownMenuItem
              onClick={() => handleExport('json')}
              data-testid="export-json"
            >
              <Calendar className="h-4 w-4 mr-3" />
              <div className="flex-1">
                <div className="font-medium">JSON Data</div>
                <div className="text-xs text-text-tertiary">
                  For developers
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Quick export buttons for common scenarios
export function QuickExportButtons({ 
  onExportCSV, 
  onExportPDF, 
  disabled = false,
  className 
}: {
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportCSV}
        disabled={disabled}
        data-testid="quick-export-csv"
      >
        <Table className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPDF}
        disabled={disabled}
        data-testid="quick-export-pdf"
      >
        <FileText className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}