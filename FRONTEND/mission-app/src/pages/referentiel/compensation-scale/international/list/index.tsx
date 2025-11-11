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
import { useGetAllExpenseCompensationScales } from "@/api/mission/expense_compensarion_scale/services";
import Alert from "@/components/alert";
import ExpenseCompensationScaleForm from "../form/index";

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

const ExpenseCompensationScaleInternational: React.FC = () => {
  const { data: expCompResponse, isLoading: expCompLoading, error: expCompError, refetch: refetchExpCompScales } = useGetAllExpenseCompensationScales();

  const [showScaleForm, setShowScaleForm] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const allExpenseCompensationScales = useMemo(() => expCompResponse?.data || [], [expCompResponse]);

  const transportScales = useMemo(() => allExpenseCompensationScales.filter((scale) => scale.isTransport === 1), [allExpenseCompensationScales]);
  const expenseScales = useMemo(() => allExpenseCompensationScales.filter((scale) => scale.isTransport === 0), [allExpenseCompensationScales]);

  const handleBulkEditScales = (): void => {
    setShowScaleForm(true);
  };

  const handleScaleFormSuccess = (message: string): void => {
    setAlert({ isOpen: true, type: "success", message });
    refetchExpCompScales();
    setShowScaleForm(false);
  };

  if (expCompError) return <div>Une erreur est survenue lors du chargement des échelles de compensation des frais.</div>;

  const renderTransportItem = (
    zone: string,
    amount: number,
    devise: string,
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
      <span style={{ fontSize: "0.9em", color: "#333" }}>{zone}</span>
      <span style={{ fontWeight: "bold", color: "#2c5aa0", fontSize: "0.95em" }}>
        {amount} {devise}
      </span>
    </div>
  );

  const renderExpenseItem = (
    zone: string,
    type: string,
    amount: number,
    devise: string,
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
        <span style={{ fontSize: "0.9em", color: "#333" }}>{zone}</span>
        <span style={{ fontSize: "0.85em", color: "#666" }}>{type}</span>
      </div>
      <span style={{ fontWeight: "bold", color: "#2c5aa0", fontSize: "0.95em" }}>
        {amount} {devise}
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
          <TableTitle>Échelles de Compensation des Frais Globales</TableTitle>
          <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
            <EditActionButton onClick={handleBulkEditScales} />
          </div>
        </TableHeader>

        {expCompLoading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <Loading>Chargement des échelles de compensation des frais...</Loading>
          </div>
        ) : (
          <>
            {transportScales.length > 0 && (
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
                  {transportScales.map((expenseCompensationScale) =>
                    renderTransportItem(
                      expenseCompensationScale.zone?.name || "-",
                      expenseCompensationScale.amount,
                      expenseCompensationScale.devise,
                      expenseCompensationScale.expenseCompensationScaleId,
                    ),
                  )}
                </div>
              </div>
            )}

            {expenseScales.length > 0 && (
              <div>
                <SectionSubTitle
                  style={{ marginBottom: "1rem", fontSize: "1.1em", color: "#444", fontWeight: "600" }}
                >
                  Dépenses
                </SectionSubTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  {expenseScales.map((expenseCompensationScale) =>
                    renderExpenseItem(
                      expenseCompensationScale.zone?.name || "-",
                      expenseCompensationScale.expenseType?.type || "-",
                      expenseCompensationScale.amount,
                      expenseCompensationScale.devise,
                      expenseCompensationScale.expenseCompensationScaleId,
                    ),
                  )}
                </div>
              </div>
            )}

            {transportScales.length === 0 && expenseScales.length === 0 && (
              <NoDataMessage style={{ marginTop: "1rem", textAlign: "center" }}>
                Aucune échelle de compensation des frais trouvée.
              </NoDataMessage>
            )}
          </>
        )}
      </TableContainer>

      <ExpenseCompensationScaleForm
        isOpen={showScaleForm}
        onClose={(): void => setShowScaleForm(false)}
        onFormSuccess={handleScaleFormSuccess}
        transportScales={transportScales}
        expenseScales={expenseScales}
      />
    </>
  );
};

export default ExpenseCompensationScaleInternational;