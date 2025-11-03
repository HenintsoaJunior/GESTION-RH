"use client";
import { useMemo, useState } from "react";
import {
  TableContainer,
  DataTable,
  TableTitle,
  TableHeader,
  TableHeadCell,
  TableRow,
  TableCell,
  Loading,
  NoDataMessage,
  EditActionButtonStyled,
} from "@/styles/table-styles";
import { Edit, X } from "lucide-react";
import { useExpenseTypes } from "@/api/mission/expense/expense";
import Alert from "@/components/alert";
import ExpenseTypeForm from "../form/index";

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

interface ExpenseType {
  expenseTypeId: string;
  type: string;
  timeStart?: string;
  timeEnd?: string;
}

interface ToggleEditButtonProps {
  isEditing: boolean;
  onClick: () => void;
}

interface RowEditButtonProps {
  onClick: () => void;
}

const ToggleEditButton: React.FC<ToggleEditButtonProps> = ({ isEditing, onClick }) => (
  <EditActionButtonStyled type="button" onClick={onClick}>
    {isEditing ? <X size={16} /> : <Edit size={16} />}
    {isEditing ? "Annuler" : "Modifier"}
  </EditActionButtonStyled>
);

const RowEditButton: React.FC<RowEditButtonProps> = ({ onClick }) => (
  <EditActionButtonStyled
    type="button"
    onClick={onClick}
    style={{ padding: "4px 8px", fontSize: "12px", minWidth: "auto" }}
  >
    <Edit size={12} />
  </EditActionButtonStyled>
);

const ExpenseTypesList: React.FC = () => {
  const { data: searchResponse, isLoading: expenseLoading, error: expenseError, refetch: refetchExpenseTypes } = useExpenseTypes();

  const [isEditingTypes, setIsEditingTypes] = useState(false); 
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const allExpenseTypes = useMemo(() => searchResponse?.data || [], [searchResponse]);

  const handleEditTypes = (): void => {
    setIsEditingTypes(!isEditingTypes);
  };

  const handleUpdateExpenseType = (expenseType: ExpenseType): void => {
    setSelectedExpenseType(expenseType);
    setShowExpenseForm(true);
  };

  const handleExpenseFormSuccess = (message: string): void => {
    setAlert({ isOpen: true, type: "success", message });
    refetchExpenseTypes();
    setShowExpenseForm(false);
    setSelectedExpenseType(null);
  };

  if (expenseError) return <div>Une erreur est survenue lors du chargement des types de dépenses.</div>;

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
          <TableTitle>Type de Dépense</TableTitle>
          <ToggleEditButton isEditing={isEditingTypes} onClick={handleEditTypes} />
        </TableHeader>

        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Heure de Début</TableHeadCell>
              <TableHeadCell>Heure de Fin</TableHeadCell>
              {isEditingTypes && <TableHeadCell>Actions</TableHeadCell>}
            </tr>
          </thead>
          <tbody>
            {expenseLoading ? (
              <TableRow>
                <TableCell colSpan={isEditingTypes ? 4 : 3}>
                  <Loading>Chargement des types de dépenses...</Loading>
                </TableCell>
              </TableRow>
            ) : allExpenseTypes.length > 0 ? (
              allExpenseTypes.map((expenseType) => (
                <TableRow key={expenseType.expenseTypeId}>
                  <TableCell>{expenseType.type}</TableCell>
                  <TableCell>{expenseType.timeStart || "-"}</TableCell>
                  <TableCell>{expenseType.timeEnd || "-"}</TableCell>
                  {isEditingTypes && (
                    <TableCell>
                      <RowEditButton onClick={() => handleUpdateExpenseType(expenseType)} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isEditingTypes ? 4 : 3}>
                  <NoDataMessage>Aucun type de dépense trouvé.</NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
      </TableContainer>

      <ExpenseTypeForm
        isOpen={showExpenseForm}
        onClose={(): void => {
          setShowExpenseForm(false);
          setSelectedExpenseType(null);
        }}
        onFormSuccess={handleExpenseFormSuccess}
        expenseType={selectedExpenseType}
      />
    </>
  );
};

export default ExpenseTypesList;