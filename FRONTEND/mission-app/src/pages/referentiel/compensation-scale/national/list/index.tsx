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
import { useCompensationScales } from "@/api/mission/compensation-scale/services";
import Alert from "@/components/alert";
import CompensationScaleForm from "../form/index";

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

interface EditActionButtonProps {
  onClick: () => void;
}

const EditActionButton: React.FC<EditActionButtonProps> = ({ onClick }) => (
  <EditActionButtonStyled type="button" onClick={onClick}>
    <Edit size={16} />
    Modifier
  </EditActionButtonStyled>
);

const CompensationScaleNational: React.FC = () => {
  const { data: compResponse, isLoading: compLoading, error: compError, refetch: refetchCompScales } =
    useCompensationScales();

  const [showScaleForm, setShowScaleForm] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const allCompensationScales = useMemo(() => compResponse?.data || [], [compResponse]);

  const globalTransportScales = useMemo(
    () => allCompensationScales.filter((scale) => scale.transportId),
    [allCompensationScales],
  );
  const globalExpenseScales = useMemo(
    () => allCompensationScales.filter((scale) => scale.expenseTypeId),
    [allCompensationScales],
  );

  const handleBulkEditScales = (): void => {
    setShowScaleForm(true);
  };

  const handleScaleFormSuccess = (message: string): void => {
    setAlert({ isOpen: true, type: "success", message });
    refetchCompScales();
    setShowScaleForm(false);
  };

  if (compError) {
    return <div>Une erreur est survenue lors du chargement des échelles de compensation.</div>;
  }

  const renderScaleItem = (
    label: string,
    amount: number,
    key: string | number,
  ): React.ReactElement => (
    <div
      key={key}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--spacing-sm)",
        backgroundColor: "#f9f9f9",
        marginBottom: "var(--spacing-sm)",
        border: "1px solid #e0e0e0",
      }}
    >
      <span style={{ fontSize: "0.9em", color: "#333" }}>{label}</span>
      <span style={{ fontWeight: "bold", color: "#2c5aa0", fontSize: "0.95em" }}>
        {amount} MGA
      </span>
    </div>
  );

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={(): void => setAlert({ ...alert, isOpen: false })}
      />
      <TableContainer>
        <TableHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <TableTitle>Échelles de Compensation Globales</TableTitle>
          <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
            <EditActionButton onClick={handleBulkEditScales} />
          </div>
        </TableHeader>

        {compLoading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <Loading>Chargement des échelles de compensation...</Loading>
          </div>
        ) : (
          <>
            {globalTransportScales.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <SectionSubTitle
                  style={{ marginBottom: "1rem", fontSize: "1.1em", color: "#444", fontWeight: "600" }}
                >
                  Transports
                </SectionSubTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  {globalTransportScales.map((compensationScale) =>
                    renderScaleItem(
                      compensationScale.transport?.type || "-",
                      compensationScale.amount,
                      compensationScale.compensationScaleId,
                    ),
                  )}
                </div>
              </div>
            )}

            {globalExpenseScales.length > 0 && (
              <div>
                <SectionSubTitle
                  style={{ marginBottom: "1rem", fontSize: "1.1em", color: "#444", fontWeight: "600" }}
                >
                  Dépenses
                </SectionSubTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  {globalExpenseScales.map((compensationScale) =>
                    renderScaleItem(
                      compensationScale.expenseType?.type || "-",
                      compensationScale.amount,
                      compensationScale.compensationScaleId,
                    ),
                  )}
                </div>
              </div>
            )}

            {globalTransportScales.length === 0 && globalExpenseScales.length === 0 && (
              <NoDataMessage style={{ marginTop: "1rem", textAlign: "center" }}>
                Aucune échelle de compensation trouvée.
              </NoDataMessage>
            )}
          </>
        )}
      </TableContainer>

      <CompensationScaleForm
        isOpen={showScaleForm}
        onClose={(): void => setShowScaleForm(false)}
        onFormSuccess={handleScaleFormSuccess}
        transports={globalTransportScales}
        expenses={globalExpenseScales}
      />
    </>
  );
};

export default CompensationScaleNational;