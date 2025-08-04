import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, X, Search, RotateCcw } from "lucide-react";
import AutoCompleteInput from "components/auto-complete-input";

export function GenericSearch({
  fields = [],
  onSearch,
  onReset,
  initialFilters = {},
  autoCompleteConfig = {},
  isLoading = false,
  title = "Filtres de Recherche",
  submitButtonText = "Rechercher",
  resetButtonText = "Réinitialiser",
  showAlert,
  className = "",
  fieldsPerRow = 2,
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [autoCompleteData, setAutoCompleteData] = useState({});

  useEffect(() => {
    Object.keys(autoCompleteConfig).forEach((fieldName) => {
      const config = autoCompleteConfig[fieldName];
      if (config.fetchFunction) {
        config.fetchFunction(
          (data) => {
            const fieldData = {
              rawData: data,
              suggestions: config.mapToSuggestions ? config.mapToSuggestions(data) : data,
              displayNames: config.mapToDisplayNames ? config.mapToDisplayNames(data) : data,
            };

            setAutoCompleteData((prev) => ({
              ...prev,
              [fieldName]: fieldData,
            }));

            if (config.onDataUpdate) {
              config.onDataUpdate(fieldData);
            }
          },
          config.setLoading || (() => {}),
          (alert) => showAlert && showAlert(alert)
        );
      }
    });
  }, [autoCompleteConfig, showAlert]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleAutoCompleteChange = useCallback((fieldName, value) => {
    const config = autoCompleteConfig[fieldName];
    let realValue = value;

    if (config?.extractValue) {
      realValue = config.extractValue(value);
    }

    setFilters((prev) => ({ ...prev, [fieldName]: realValue }));
  }, [autoCompleteConfig]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    setAppliedFilters({ ...filters });
    if (onSearch) {
      onSearch(filters, autoCompleteData);
    }
  }, [filters, autoCompleteData, onSearch]);

  const handleReset = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    if (onReset) {
      onReset();
    }
    if (showAlert) {
      showAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
    }
  }, [initialFilters, onReset, showAlert]);

  const renderField = (field) => {
    const fieldValue = filters[field.name] || "";

    switch (field.type) {
      case "text":
      case "date":
      case "email":
      case "number":
        return (
          <input
            name={field.name}
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="form-input-search"
            disabled={isLoading}
          />
        );

      case "select":
        return (
          <select
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            className="form-input-search"
            disabled={isLoading}
          >
            <option value="">{field.placeholder || "Tous"}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "autocomplete":
        const autoCompleteFieldData = autoCompleteData[field.name];
        return (
          <AutoCompleteInput
            value={fieldValue}
            onChange={(value) => handleAutoCompleteChange(field.name, value)}
            suggestions={autoCompleteFieldData?.displayNames || []}
            maxVisibleItems={field.maxVisibleItems || 5}
            placeholder={field.placeholder}
            disabled={isLoading}
            fieldType={field.name}
            fieldLabel={field.label?.toLowerCase()}
            className="form-input-search"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`generic-search-container ${className}`}>
      {!isHidden && (
        <table className={`filters-container ${isMinimized ? "minimized" : ""}`}>
          <thead>
            <tr>
              <th colSpan={fieldsPerRow * 2} className="filters-header">
                <div className="filters-header-content">
                  <h2 className="filters-title">{title}</h2>
                  <div className="filters-controls">
                    <button
                      type="button"
                      className="filter-control-btn filter-minimize-btn"
                      onClick={() => setIsMinimized(!isMinimized)}
                      title={isMinimized ? "Développer" : "Réduire"}
                    >
                      {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      className="filter-control-btn filter-close-btn"
                      onClick={() => setIsHidden(true)}
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          {!isMinimized && (
            <tbody>
              <tr>
                <td colSpan={fieldsPerRow * 2}>
                  <form onSubmit={handleSubmit}>
                    <table className="form-table-search">
                      <tbody>
                        {fields.reduce((rows, field, index) => {
                          const rowIndex = Math.floor(index / fieldsPerRow);
                          if (!rows[rowIndex]) {
                            rows[rowIndex] = [];
                          }
                          rows[rowIndex].push(field);
                          return rows;
                        }, []).map((rowFields, rowIndex) => (
                          <tr key={rowIndex}>
                            {rowFields.map((field) => (
                              <React.Fragment key={field.name}>
                                <td className="form-label-cell-search">
                                  <label className="form-label-search">{field.label}</label>
                                  {renderField(field)}
                                </td>
                              </React.Fragment>
                            ))}
                            {rowFields.length < fieldsPerRow &&
                              Array(fieldsPerRow - rowFields.length)
                                .fill()
                                .map((_, index) => (
                                  <td key={`empty-${index}`} className="form-label-cell-search"></td>
                                ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="filters-actions">
                      <button type="button" className="btn-reset" onClick={handleReset} disabled={isLoading}>
                        <RotateCcw className="w-4 h-4" />
                        {resetButtonText}
                      </button>
                      <button type="submit" className="btn-search" disabled={isLoading}>
                        <Search className="w-4 h-4" />
                        {isLoading ? "Recherche..." : submitButtonText}
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      )}

      {isHidden && (
        <div className="filters-toggle">
          <button type="button" className="btn-show-filters" onClick={() => setIsHidden(false)}>
            Afficher les filtres
          </button>
        </div>
      )}
    </div>
  );
}