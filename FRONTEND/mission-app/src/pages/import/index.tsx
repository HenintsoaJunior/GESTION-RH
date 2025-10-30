"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, X, Upload, RefreshCw, FileText } from "lucide-react";
import {
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FiltersControls,
  FilterControlButton,
  FiltersSection,
  FormTableSearch,
  FormRow,
  FormFieldCell,
  FormLabelSearch,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  FiltersToggle,
  ButtonShowFilters,
  Separator,
} from "@/styles/table-styles";
import Alert from "@/components/alert";
import { useImport } from "@/api/import/services";

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const ImportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'importer' | 'reinitialiser'>('importer');
  const [selectedEmployeeFile, setSelectedEmployeeFile] = useState<File | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  const {
    importFiles,
    isImporting,
    importError,
    resetData,
    isResetting,
    resetError,
  } = useImport();

  const handleEmployeeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedEmployeeFile(file);
  };

  const handleImportSubmit = async () => {
    if (!selectedEmployeeFile) {
      setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner un fichier à importer." });
      return;
    }

    try {
      await importFiles({
        employeeFile: selectedEmployeeFile,
      });
      setAlert({ isOpen: true, type: "success", message: "Import effectué avec succès." });
      setSelectedEmployeeFile(null);
    } catch {
      const errorMessage = importError?.message || "Erreur lors de l'import.";
      setAlert({ isOpen: true, type: "error", message: errorMessage });
    }
  };

  const handleResetSubmit = async () => {
    try {
      await resetData();
      setAlert({ isOpen: true, type: "success", message: "Données réinitialisées avec succès." });
    } catch {
      const errorMessage = resetError?.message || "Erreur lors de la réinitialisation.";
      setAlert({ isOpen: true, type: "error", message: errorMessage });
    }
  };

  const tabTitles = [
    { key: 'importer' as const, label: 'Importer' },
    { key: 'reinitialiser' as const, label: 'Réinitialiser' },
  ];

  const FileUploadField = ({
    label,
    accept,
    onChange,
    selectedFile,
    disabled,
  }: {
    label: string;
    accept: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedFile: File | null;
    disabled: boolean;
  }) => {
    const clearFile = () => {
      const dt = new DataTransfer();
      const event = {
        target: {
          files: dt.files,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
        <label
          htmlFor="file-upload"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
            padding: "var(--spacing-md)",
            backgroundColor: selectedFile ? "var(--success-bg)" : "var(--bg-secondary)",
            border: `1px dashed ${selectedFile ? "var(--success-color)" : "var(--border-color)"}`,
            borderRadius: "var(--border-radius-md)",
            cursor: disabled ? "not-allowed" : "pointer",
            color: disabled ? "var(--text-disabled)" : "var(--text-color)",
            transition: "none", // Pas d'animation
            fontSize: "0.875rem",
            fontWeight: "var(--font-weight-medium)",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <Upload size={16} />
          {selectedFile ? `Remplacer ${label}` : `Choisir un fichier pour ${label}`}
        </label>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={disabled}
          style={{ display: "none" }}
        />
        {selectedFile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              padding: "var(--spacing-sm) var(--spacing-md)",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--border-radius-sm)",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            <FileText size={14} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              disabled={disabled}
              style={{
                background: "none",
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                color: "var(--danger-color)",
                padding: 0,
                opacity: disabled ? 0.6 : 1,
              }}
              title="Supprimer"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Options d'Import</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized={isMinimized}
                onClick={() => setIsMinimized((p) => !p)}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={() => setIsHidden(true)} title="Fermer">
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>

          {!isMinimized && (
            <FiltersSection>
              <Separator />
              <div style={{ display: "flex", gap: "0", marginBottom: "var(--spacing-md)" }}>
                {tabTitles.map((tab, index) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: "var(--spacing-sm) var(--spacing-md)",
                      background: "transparent",
                      color: activeTab === tab.key ? "var(--primary-color)" : "var(--text-color)",
                      border: "none",
                      borderBottom: activeTab === tab.key ? "3px solid var(--primary-color)" : "1px solid var(--border-color)",
                      borderRight: index < tabTitles.length - 1 ? "1px solid var(--border-color)" : "none",
                      borderRadius: "0",
                      cursor: "pointer",
                      fontWeight: activeTab === tab.key ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
                      fontFamily: "var(--font-family)",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'importer' && (
                <form onSubmit={(e) => { e.preventDefault(); handleImportSubmit(); }}>
                  <FormTableSearch>
                    <tbody>
                      <FormRow>
                        <FormFieldCell style={{ width: "100%" }}>
                          <FormLabelSearch>Fichier Employés (CSV)</FormLabelSearch>
                          <FileUploadField
                            label="Employés"
                            accept=".csv, .xlsx, .xls"
                            onChange={handleEmployeeFileChange}
                            selectedFile={selectedEmployeeFile}
                            disabled={isImporting}
                          />
                        </FormFieldCell>
                      </FormRow>
                    </tbody>
                  </FormTableSearch>

                  <Separator />

                  <FiltersActions>
                    <ButtonReset
                      type="button"
                      onClick={() => {
                        setSelectedEmployeeFile(null);
                      }}
                      disabled={isImporting}
                      title="Effacer sélection"
                    >
                      Effacer
                    </ButtonReset>
                    <ButtonSearch type="submit" disabled={isImporting || !selectedEmployeeFile} title="Importer">
                      <Upload size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                      {isImporting ? "Import en cours..." : "Importer"}
                    </ButtonSearch>
                  </FiltersActions>
                </form>
              )}

              {activeTab === 'reinitialiser' && (
                <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
                  <p style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-secondary)" }}>
                    Cette action réinitialisera toutes les données des employés et missions. Êtes-vous sûr ?
                  </p>
                  <ButtonSearch
                    onClick={handleResetSubmit}
                    disabled={isResetting}
                    title="Réinitialiser"
                    style={{ backgroundColor: "var(--danger-color)", color: "var(--text-white)" }}
                  >
                    <RefreshCw size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    {isResetting ? "Réinitialisation en cours..." : "Réinitialiser"}
                  </ButtonSearch>
                </div>
              )}
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={() => setIsHidden(false)}>
            <Upload size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Options d'Import
          </ButtonShowFilters>
        </FiltersToggle>
      )}
    </>
  );
};

export default ImportPage;