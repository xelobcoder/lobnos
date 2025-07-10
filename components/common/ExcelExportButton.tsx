import React from 'react';
import { RiFileExcelLine } from '@remixicon/react';

interface ExcelExportButtonProps {
  data: any[];
  filename?: string;
  columns?: { key: string; label: string }[];
  excludeColumns?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'export';
  children?: React.ReactNode;
}

const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  data,
  filename = 'export',
  columns,
  excludeColumns = ['actions', 'id', 'ID'],
  className = '',
  size = 'sm',
  disabled = false,
  variant = 'export',
  children
}) => {
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    let exportData: any[];

    if (columns && columns.length > 0) {
      // Use specified columns mapping
      exportData = data.map((item, index) => {
        const row: any = { '#': index + 1 };
        columns.forEach(col => {
          row[col.label] = item[col.key] || '';
        });
        return row;
      });
    } else {
      // Auto-generate from data, excluding specified columns
      exportData = data.map((item, index) => {
        const row: any = { '#': index + 1 };
        Object.keys(item).forEach(key => {
          if (!excludeColumns.includes(key)) {
            // Convert camelCase to Title Case
            const label = key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
            row[label] = item[key] || '';
          }
        });
        return row;
      });
    }

    // Create CSV content
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split('T')[0];
      const downloadFilename = `${filename}_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', downloadFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getButtonClass = () => {
    const baseClass = 'btn d-flex align-items-center';
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    
    let variantClass = '';
    switch (variant) {
      case 'primary':
        variantClass = 'btn-primary';
        break;
      case 'secondary':
        variantClass = 'btn-outline-secondary';
        break;
      case 'success':
        variantClass = 'btn-success';
        break;
      case 'export':
      default:
        variantClass = 'btn-export';
        break;
    }

    return `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();
  };

  return (
    <button
      type="button"
      className={getButtonClass()}
      onClick={exportToExcel}
      disabled={disabled || !data || data.length === 0}
      title={`Export ${filename} to Excel/CSV`}
    >
      <RiFileExcelLine className="me-2" size={16} />
      {children || 'Export to Excel'}
    </button>
  );
};

export default ExcelExportButton;
