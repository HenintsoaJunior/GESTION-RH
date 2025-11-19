"use client";

import { useMemo, useState } from "react";
import {
  TableContainer,
  TableTitle,
  TableHeader,
  Loading,
  NoDataMessage,
  SectionSubTitle,
  EditActionButtonStyled,
} from "@/styles/table-styles";
import { Edit } from "lucide-react";
import { useGetAllExpenseCompensationScales, type ExpenseCompensationScale } from "@/api/mission/expense_compensarion_scale/services";
import Alert from "@/components/alert";
import ExpenseCompensationScaleForm from "../form/index";

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const EditActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <EditActionButtonStyled type="button" onClick={onClick}>
    <Edit size={16} />
    Modifier
  </EditActionButtonStyled>
);

const EXPENSE_LABELS: Record<string, string> = {
  exp001: "Petit Déjeuner",
  exp002: "Déjeuner",
  exp003: "Dîner",
  exp004: "Hébergement",
  exp005: "Communication",
  exp006: "Visa sur place",
  exp007: "Frais médicaux",
  exp008: "Taxes",
};

export default function ExpenseCompensationScaleInternational() {
  const { data: response, isLoading, error, refetch } = useGetAllExpenseCompensationScales();

  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [selectedType, setSelectedType] = useState<string>("all");

  const allScales = useMemo<ExpenseCompensationScale[]>(() => response?.data ?? [], [response]);

  const transportScales = useMemo(
    () => allScales.filter((s) => s.expenseTypeId === "exp009"),
    [allScales]
  );

  const otherScales = useMemo(
    () => allScales.filter((s) => s.expenseTypeId !== "exp009"),
    [allScales]
  );

  // Types disponibles pour le filtre (hors transport)
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    otherScales.forEach((s) => s.expenseTypeId && types.add(s.expenseTypeId));
    return Array.from(types)
      .map((id) => ({
        id,
        label: EXPENSE_LABELS[id] ?? "Autre dépense",
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [otherScales]);

  // Application du filtre uniquement par type
  const filteredScales = useMemo(() => {
    if (selectedType === "all") return otherScales;
    return otherScales.filter((scale) => scale.expenseTypeId === selectedType);
  }, [otherScales, selectedType]);

  // Regroupement par type de dépense
  const groupedByType = useMemo(() => {
    const groups: Record<string, ExpenseCompensationScale[]> = {};
    filteredScales.forEach((scale) => {
      const typeId = scale.expenseTypeId ?? "unknown";
      if (!groups[typeId]) groups[typeId] = [];
      groups[typeId].push(scale);
    });
    return groups;
  }, [filteredScales]);

  const handleSuccess = (msg: string) => {
    setAlert({ isOpen: true, type: "success", message: msg });
    refetch();
    setShowForm(false);
  };

  if (error) {
    return <div style={{ padding: "2rem", color: "#d32f2f", textAlign: "center" }}>Erreur de chargement.</div>;
  }

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      <TableContainer>
        <TableHeader
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <TableTitle>Échelles de Compensation des Frais Internationales</TableTitle>
          <EditActionButton onClick={() => setShowForm(true)} />
        </TableHeader>

        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Loading>Chargement...</Loading>
          </div>
        ) : (
          <>
            {/* Filtre uniquement par type de dépense */}
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "flex-start" }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  minWidth: "250px",
                  fontSize: "1rem",
                }}
              >
                <option value="all">Tous les types de dépense</option>
                {availableTypes.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Transports */}
            {transportScales.length > 0 && (
              <div style={{ marginBottom: "3rem" }}>
                <SectionSubTitle style={{ color: "#1a3e72", marginBottom: "1rem" }}>
                  Transports
                </SectionSubTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {transportScales.map((s) => (
                    <div
                      key={s.expenseCompensationScaleId}
                      style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "#f0f7ff",
                        borderRadius: "8px",
                        border: "1px solid #bbd9ff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 500, color: "#1a3e72" }}>
                        {s.zone?.name ?? "Zone inconnue"}
                      </span>
                      <strong style={{ color: "#1a3e72" }}>
                        {s.amount} {s.devise}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dépenses regroupées par type */}
            <SectionSubTitle style={{ color: "#2c5aa0", marginBottom: "1.5rem" }}>
              Hébergement, Repas & Autres Dépenses
            </SectionSubTitle>

            {Object.keys(groupedByType).length === 0 ? (
              <NoDataMessage>
                {allScales.length === 0
                  ? "Aucune échelle de compensation trouvée."
                  : "Aucun résultat pour le type sélectionné."}
              </NoDataMessage>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                {Object.entries(groupedByType).map(([typeId, scales]) => {
                  const label = EXPENSE_LABELS[typeId] ?? "Autre dépense";

                  return (
                    <div key={typeId}>
                      <h3
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 600,
                          color: "#2c5aa0",
                          marginBottom: "1rem",
                          paddingBottom: "0.5rem",
                          borderBottom: "2px solid #2c5aa0",
                        }}
                      >
                        {label}
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                        {scales.map((s) => (
                          <div
                            key={s.expenseCompensationScaleId}
                            style={{
                              padding: "0.75rem 1rem",
                              backgroundColor: "#f9f9f9",
                              borderRadius: "8px",
                              border: "1px solid #e0e0e0",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>
                              {s.zone?.name ?? "Zone inconnue"}
                            </span>
                            <strong style={{ color: "#2c5aa0" }}>
                              {s.amount} {s.devise}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </TableContainer>

      <ExpenseCompensationScaleForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onFormSuccess={handleSuccess}
        transportScales={transportScales}
        expenseScales={otherScales}
      />
    </>
  );
}