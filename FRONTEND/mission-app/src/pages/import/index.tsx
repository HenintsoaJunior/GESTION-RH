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
  FormLabelSearch,
  FiltersActions,
  ButtonSearch,
  Separator,
} from "@/styles/table-styles";
import Alert from "@/components/alert";
import { useEmpImport, useImport, useOrgImport } from "@/api/import/services";

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const ImportPage: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<'autres' | 'organigramme' | 'collaborateurs' | 'reinitialiser'>('organigramme');

  const [selectedEmployeeFile, setSelectedEmployeeFile] = useState<File | null>(null);
  const [selectedOtherFile, setSelectedOtherFile] = useState<File | null>(null);
  const [selectedOrgFile, setSelectedOrgFile] = useState<File | null>(null);

  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: "info",
    message: "",
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const {
    importFiles,
    isImporting,
    importError,
    resetData,
    isResetting,
    resetError,
  } = useImport();

  const {
    importOrg,
    isOrgImporting,
    orgImportError,
  } = useOrgImport();

  const {
    importEmp,
    isEmpImporting,
    empImportError,
  } = useEmpImport();

  const handleFileImport = async () => {
    if (!selectedOtherFile) {
      setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner un fichier pour les entités." });
      return;
    }

    try {
      await importFiles({ employeeFile: selectedOtherFile });
      setAlert({ isOpen: true, type: "success", message: "Import des entités réussi." });
      setSelectedOtherFile(null);
    } catch {
      setAlert({
        isOpen: true,
        type: "error",
        message: importError?.message || "Erreur lors de l'import des entités.",
      });
    }
  };

  const handleOrgImport = async () => {
    if (!selectedOrgFile) {
      setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner un fichier organigramme." });
      return;
    }

    try {
      await importOrg(selectedOrgFile);
      setAlert({ isOpen: true, type: "success", message: "Import des organigramme réussi." });
      setSelectedOrgFile(null);
    } catch {
      setAlert({
        isOpen: true,
        type: "error",
        message: orgImportError?.message || "Erreur lors de l'import des organigramme.",
      });
    }
  };

  const handleEmpImport = async () => {
    if (!selectedEmployeeFile) {
      setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner un fichier collaborateur." });
      return;
    }

    try {
      await importEmp(selectedEmployeeFile);
      setAlert({ isOpen: true, type: "success", message: "Import des collaborateurs réussi." });
      setSelectedEmployeeFile(null);
    } catch {
      setAlert({
        isOpen: true,
        type: "error",
        message: empImportError?.message || "Erreur lors de l'import des collaborateurs.",
      });
    }
  };

  const handleResetSubmit = async () => {
    try {
      await resetData();
      setAlert({ isOpen: true, type: "success", message: "Données réinitialisées avec succès." });
    } catch {
      setAlert({
        isOpen: true,
        type: "error",
        message: resetError?.message || "Erreur lors de la réinitialisation.",
      });
    }
  };

  const tabTitles = [
    { key: 'organigramme' as const, label: 'Organigramme' },
    { key: 'autres' as const, label: 'Autres' },
    { key: 'collaborateurs' as const, label: 'Collaborateurs' },
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
  }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
          padding: "var(--spacing-md)",
          backgroundColor: selectedFile ? "var(--success-bg)" : "var(--bg-secondary)",
          border: `1px dashed ${selectedFile ? "var(--success-color)" : "var(--border-color)"}`,
          borderRadius: "var(--border-radius-md)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Upload size={16} />
        {selectedFile ? `Remplacer ${label}` : `Choisir un fichier pour ${label}`}
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={disabled}
          style={{ display: "none" }}
        />
      </label>

      {selectedFile && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
          padding: "var(--spacing-sm)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--border-radius-sm)",
        }}>
          <FileText size={14} />
          <span style={{ flex: 1 }}>{selectedFile.name}</span>
          <X
            size={14}
            style={{ cursor: "pointer" }}
            onClick={() => onChange({
              target: { files: new DataTransfer().files }
            } as React.ChangeEvent<HTMLInputElement>)}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      <Alert {...alert} onClose={() => setAlert({ ...alert, isOpen: false })} />

      <FiltersContainer $isMinimized={isMinimized}>
        <FiltersHeader>
          <FiltersTitle>Options d'Import</FiltersTitle>
          <FiltersControls>
            <FilterControlButton onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </FilterControlButton>
            <FilterControlButton $isClose onClick={() => setIsHidden(!isHidden)}>
              <X size={16} />
            </FilterControlButton>
          </FiltersControls>
        </FiltersHeader>

        {!isMinimized && !isHidden && (
          <FiltersSection>
            <Separator />
            <div style={{ display: "flex", marginBottom: "var(--spacing-md)" }}>
              {tabTitles.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "var(--spacing-sm) var(--spacing-md)",
                    borderBottom: activeTab === tab.key ? "3px solid var(--primary-color)" : "1px solid var(--border-color)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'autres' && (
              <>
                <FormLabelSearch>Fichier Autres (CSV)</FormLabelSearch>
                <FileUploadField
                  label="Autres"
                  accept=".csv"
                  onChange={(e) => setSelectedOtherFile(e.target.files?.[0] || null)}
                  selectedFile={selectedOtherFile}
                  disabled={isImporting}
                />
                <FiltersActions>
                  <ButtonSearch disabled={isImporting} onClick={handleFileImport}>
                    {isImporting ? "Import en cours..." : "Importer"}
                  </ButtonSearch>
                </FiltersActions>
              </>
            )}

            {activeTab === 'organigramme' && (
              <>
                <FormLabelSearch>Fichier Organigramme (CSV)</FormLabelSearch>
                <FileUploadField
                  label="Organigramme"
                  accept=".csv"
                  onChange={(e) => setSelectedOrgFile(e.target.files?.[0] || null)}
                  selectedFile={selectedOrgFile}
                  disabled={isOrgImporting}
                />
                <FiltersActions>
                  <ButtonSearch disabled={isOrgImporting} onClick={handleOrgImport}>
                    {isOrgImporting ? "Import en cours..." : "Importer"}
                  </ButtonSearch>
                </FiltersActions>
              </>
            )}

            {activeTab === 'collaborateurs' && (
              <>
                <FormLabelSearch>Fichier Collaborateurs (CSV)</FormLabelSearch>
                <FileUploadField
                  label="Collaborateur"
                  accept=".csv"
                  onChange={(e) => setSelectedEmployeeFile(e.target.files?.[0] || null)}
                  selectedFile={selectedEmployeeFile}
                  disabled={isEmpImporting}
                />
                <FiltersActions>
                  <ButtonSearch disabled={isEmpImporting} onClick={handleEmpImport}>
                    {isEmpImporting ? "Import en cours..." : "Importer"}
                  </ButtonSearch>
                </FiltersActions>
              </>
            )}

            {activeTab === 'reinitialiser' && (
              <div style={{ textAlign: "center" }}>
                <ButtonSearch
                  onClick={handleResetSubmit}
                  disabled={isResetting}
                  style={{ backgroundColor: "var(--danger-color)", color: "#fff" }}
                >
                  <RefreshCw size={16} />
                  {isResetting ? "Réinitialisation..." : "Réinitialiser"}
                </ButtonSearch>
              </div>
            )}
          </FiltersSection>
        )}
      </FiltersContainer>
    </>
  );
};

export default ImportPage;
