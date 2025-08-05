import { useState, useCallback } from "react";
import { Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "components/pagination";
import {GenericBadge} from "components/generic-badge"
export function GenericTable({
  title,
  columns = [],
  data = [],
  isLoading = false,
  totalEntries = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onSort,
  sortConfig = {},
  actions = {},
  customRowRenderer,
  emptyMessage = "Aucune donnée trouvée.",
  loadingMessage = "Chargement...",
  className = "",
}) {
  const [localSortConfig, setLocalSortConfig] = useState(sortConfig);

  const handleSort = useCallback((columnKey) => {
    const direction = localSortConfig.key === columnKey && localSortConfig.direction === "asc" ? "desc" : "asc";
    
    const newSortConfig = { key: columnKey, direction };
    setLocalSortConfig(newSortConfig);
    
    if (onSort) {
      onSort(newSortConfig);
    }
  }, [localSortConfig, onSort]);

  const getSortIcon = (columnKey) => {
    if (localSortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return localSortConfig.direction === "asc" ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const renderCellContent = (column, item, rowIndex) => {
    const value = column.key ? item[column.key] : null;

    if (column.render) {
      return column.render(value, item, rowIndex);
    }

    if (column.type === "badge") {
      return (
        <GenericBadge
          value={value}
          statusConfig={column.statusConfig}
          defaultStatus={column.defaultStatus}
        />
      );
    }

    if (column.type === "date") {
      return value ? new Date(value).toLocaleDateString("fr-FR") : "Non spécifié";
    }

    if (column.type === "currency") {
      return value ? `${value} ${column.currency || "€"}` : "Non spécifié";
    }

    return value || column.defaultValue || "Non spécifié";
  };

  const handleRowClick = (item, index) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  };

  return (
    <div className={`generic-table-container ${className}`}>
      <div className="table-header">
        <h2 className="table-title">{title}</h2>
        {actions.create && (
          <button
            onClick={actions.create.onClick}
            className="btn-new-request"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            {actions.create.text || "Nouveau"}
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key || column.label}
                  className={column.sortable ? "sortable" : ""}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="th-content">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  {loadingMessage}
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => {
                if (customRowRenderer) {
                  return customRowRenderer(item, index, columns);
                }

                return (
                  <tr
                    key={item.id || index}
                    onClick={() => handleRowClick(item, index)}
                    className={onRowClick ? "clickable-row" : ""}
                  >
                    {columns.map((column) => (
                      <td key={column.key || column.label}>
                        {renderCellContent(column, item, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(totalEntries > 0 || data.length > 0) && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalEntries={totalEntries}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}