"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";
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
  CategorySection,
  SectionHeader,
  SectionSubTitle,
  StyledDivider,
  EditButton,
  ToggleButton,
  CheckboxContainer,
  CheckboxLabel,
  CheckboxInput,
} from "@/styles/table-styles";
import { ChevronDown, ChevronRight, Edit, X } from "lucide-react";
import { useExpenseTypes } from "@/api/mission/expense/expense";
import { useCompensationScales } from "@/api/mission/compensation-scale/services";
import { useGetAllCollaboratorCategories } from "@/api/collaborator/category/services";
import Alert from "@/components/alert";
import ExpenseTypeForm from "../form/type/index";
import CategoryForm from "../form/category/index";
import type { CompensationScale } from "@/api/mission/compensation-scale/services";

interface Category {
  employeeCategoryId: string;
  label: string;
  code: string;
}

interface ExtendedCategory {
  employeeCategoryId: string;
  label: string;
  code: string;
  transportScales?: CompensationScale[];
  expenseScales?: CompensationScale[];
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const ExpenseTypeList: React.FC = () => {
  const { data: searchResponse, isLoading: expenseLoading, error: expenseError, refetch: refetchExpenseTypes } = useExpenseTypes();
  const { data: compResponse, isLoading: compLoading, error: compError, refetch: refetchCompScales } = useCompensationScales();
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetAllCollaboratorCategories();

  const [isEditingTypes, setIsEditingTypes] = useState(false); 
  const [isEditingCategories, setIsEditingCategories] = useState(false); 
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState<{ expenseTypeId: string; type: string; timeStart?: string; timeEnd?: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExtendedCategory | null>(null);
  const [bulkSelectedCategories, setBulkSelectedCategories] = useState<string[]>([]);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const selectAllRef = useRef<HTMLInputElement>(null);

  const allExpenseTypes = useMemo(() => searchResponse?.data || [], [searchResponse]);
  const allCompensationScales = useMemo(() => compResponse?.data || [], [compResponse]);
  const allCategories = useMemo(() => categoriesResponse?.data || [], [categoriesResponse]);

  const sortedCategories = useMemo(() => {
    return allCategories.sort((a: Category, b: Category) => parseInt(a.code) - parseInt(b.code));
  }, [allCategories]);

  const categoryScales = useMemo(() => {
    const scalesMap = new Map<string, CompensationScale[]>();
    allCompensationScales.forEach((scale) => {
      const catId = scale.employeeCategory.employeeCategoryId;
      if (!scalesMap.has(catId)) {
        scalesMap.set(catId, []);
      }
      scalesMap.get(catId)!.push(scale);
    });
    return scalesMap;
  }, [allCompensationScales]);

  const allSelected = useMemo(() => selectedCategories.size === sortedCategories.length, [selectedCategories, sortedCategories]);
  const someSelected = useMemo(() => selectedCategories.size > 0 && !allSelected, [selectedCategories, allSelected]);

  useMemo(() => {
    const newExpanded: Record<string, boolean> = {};
    sortedCategories.forEach((category: Category) => {
      const scales = categoryScales.get(category.employeeCategoryId) || [];
      const transportScales = scales.filter((scale) => scale.transport);
      const expenseScales = scales.filter((scale) => scale.expenseType);
      const totalScales = transportScales.length + expenseScales.length;
      newExpanded[category.employeeCategoryId] = totalScales > 0;
    });
    setExpandedCategories(newExpanded);
  }, [sortedCategories, categoryScales]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleEditTypes = () => {
    setIsEditingTypes(!isEditingTypes);
  };

  const handleEditCategories = () => {
    setIsEditingCategories(!isEditingCategories);
    if (isEditingCategories) {
      setSelectedCategories(new Set());
    }
  };

  const selectAllCategories = () => {
    if (allSelected) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(sortedCategories.map((c: Category) => c.employeeCategoryId)));
    }
  };

  const handleUpdateExpenseType = (expenseType: { expenseTypeId: string; type: string; timeStart?: string; timeEnd?: string }) => {
    setSelectedExpenseType(expenseType);
    setShowExpenseForm(true);
  };

  const handleUpdateCategory = (category: Category) => {
    console.log('handleUpdateCategory called with:', category);
    const scales = categoryScales.get(category.employeeCategoryId) || [];
    const transportScales = scales.filter((scale) => scale.transport);
    const expenseScales = scales.filter((scale) => scale.expenseType);
    const fullCategory: ExtendedCategory = {
      ...category,
      transportScales,
      expenseScales
    };
    console.log('fullCategory prepared:', fullCategory);
    setSelectedCategory(fullCategory);
    setBulkSelectedCategories([]);
    setIsEditingCategories(false);
    setSelectedCategories(new Set());
    setShowCategoryForm(true);
  };

  const handleBulkEditCategories = () => {
    if (selectedCategories.size === 0) {
      console.log('No categories selected');
      return;
    }
    const selectedIds = Array.from(selectedCategories);
    console.log('handleBulkEditCategories called with:', selectedIds);
    setBulkSelectedCategories(selectedIds);
    setSelectedCategory(null);
    setShowCategoryForm(true);
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleExpenseFormSuccess = (message: string) => {
    setAlert({ isOpen: true, type: "success", message });
    refetchExpenseTypes();
    setShowExpenseForm(false);
    setSelectedExpenseType(null);
  };

  const handleCategoryFormSuccess = (message: string) => {
    setAlert({ isOpen: true, type: "success", message });
    refetchCompScales();
    setShowCategoryForm(false);
    setSelectedCategory(null);
    setBulkSelectedCategories([]);
    setIsEditingCategories(false);
    setSelectedCategories(new Set());
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (expenseError) return <div>Une erreur est survenue lors du chargement des types de dépenses.</div>;
  if (compError) return <div>Une erreur est survenue lors du chargement des échelles de compensation.</div>;
  if (categoriesLoading) return <div>Chargement des catégories...</div>;

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <TableContainer>
        <TableHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TableTitle>Type</TableTitle>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <EditButton onClick={handleEditTypes}>
              {isEditingTypes ? <X size={16} style={{ marginRight: "var(--spacing-sm)" }} /> : <Edit size={16} style={{ marginRight: "var(--spacing-sm)" }} />}
              {isEditingTypes ? 'Annuler' : 'Modifier'}
            </EditButton>
          </div>
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
                  <TableCell>{expenseType.timeStart || '-'}</TableCell>
                  <TableCell>{expenseType.timeEnd || '-'}</TableCell>
                  {isEditingTypes && (
                    <TableCell>
                      <EditButton
                        onClick={() => handleUpdateExpenseType(expenseType)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <Edit size={12} />
                      </EditButton>
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

      <StyledDivider />

      <TableContainer>
        <TableHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditingCategories && (
            <CheckboxContainer style={{ marginRight: 'var(--spacing-md)' }}>
              <CheckboxInput
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={selectAllCategories}
              />
              <CheckboxLabel />
            </CheckboxContainer>
          )}
          <TableTitle>Catégories</TableTitle>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <EditButton onClick={handleEditCategories}>
              {isEditingCategories ? <X size={16} style={{ marginRight: "var(--spacing-sm)" }} /> : <Edit size={16} style={{ marginRight: "var(--spacing-sm)" }} />}
              {isEditingCategories ? 'Annuler' : 'Modifier'}
            </EditButton>
            {isEditingCategories && (
              <EditButton onClick={handleBulkEditCategories} disabled={selectedCategories.size === 0}>
                Modifier sélection ({selectedCategories.size})
              </EditButton>
            )}
          </div>
        </TableHeader>

        {compLoading ? (
          <DataTable>
            <tbody>
              <TableRow>
                <TableCell colSpan={3}>
                  <Loading>Chargement des catégories et échelles de compensation...</Loading>
                </TableCell>
              </TableRow>
            </tbody>
          </DataTable>
        ) : sortedCategories.length > 0 ? (
          <CategorySection>
            {sortedCategories.map((category: Category) => {
              const scales = categoryScales.get(category.employeeCategoryId) || [];
              const transportScales = scales.filter((scale) => scale.transport);
              const expenseScales = scales.filter((scale) => scale.expenseType);
              const totalScales = transportScales.length + expenseScales.length;
              const categoryId = category.employeeCategoryId;
              const isExpanded = expandedCategories[categoryId] ?? false;
              const isSelected = selectedCategories.has(categoryId);
              return (
                <div key={categoryId} style={{ marginBottom: '2rem' }}>
                  <SectionHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleCategory(categoryId)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isEditingCategories && (
                        <CheckboxContainer>
                          <CheckboxInput
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCategorySelection(categoryId)}
                          />
                          <CheckboxLabel />
                        </CheckboxContainer>
                      )}
                      <span style={{ fontSize: '14px' }}>Catégorie {category.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isEditingCategories && (
                        <EditButton
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            handleUpdateCategory(category);
                          }}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          <Edit size={12} />
                        </EditButton>
                      )}
                      <ToggleButton onClick={(e: MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); toggleCategory(categoryId); }}>
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </ToggleButton>
                    </div>
                  </SectionHeader>
                  {isExpanded && (
                    <>
                      <SectionSubTitle>
                      </SectionSubTitle>
                      <StyledDivider />
                      {totalScales > 0 ? (
                        <>
                          {transportScales.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                              <SectionSubTitle style={{ marginBottom: '0.5rem', fontSize: '0.95em', color: '#666' }}>
                                Transports
                              </SectionSubTitle>
                              <DataTable style={{ borderTop: '1px solid #e0e0e0' }}>
                                <thead>
                                  <tr>
                                    <TableHeadCell style={{ backgroundColor: '#f5f5f5' }}>Transport</TableHeadCell>
                                    <TableHeadCell style={{ backgroundColor: '#f5f5f5' }}>Montant</TableHeadCell>
                                    <TableHeadCell style={{ backgroundColor: '#f5f5f5' }}>Zone</TableHeadCell>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transportScales.map((compensationScale) => (
                                    <TableRow key={compensationScale.compensationScaleId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                      <TableCell>{compensationScale.transport?.type || '-'}</TableCell>
                                      <TableCell style={{ fontWeight: 'bold', color: '#2c5aa0' }}>{compensationScale.amount} MGA</TableCell>  
                                      <TableCell>{compensationScale.place}</TableCell>
                                    </TableRow>
                                  ))}
                                </tbody>
                              </DataTable>
                            </div>
                          )}
                          {expenseScales.length > 0 && (
                            <div>
                              <SectionSubTitle style={{ marginBottom: '0.5rem', fontSize: '0.95em', color: '#666' }}>
                                Dépenses
                              </SectionSubTitle>
                              <DataTable style={{ borderTop: '1px solid #e0e0e0' }}>
                                <thead>
                                  <tr>
                                    <TableHeadCell style={{ backgroundColor: '#f5f5f5' }}>Type de Dépense</TableHeadCell>
                                    <TableHeadCell style={{ backgroundColor: '#f5f5f5' }}>Montant</TableHeadCell>
                                    <TableHeadCell style={{ backgroundColor: '#f5f5f5' }}>Zone</TableHeadCell>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expenseScales.map((compensationScale) => (
                                    <TableRow key={compensationScale.compensationScaleId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                      <TableCell>{compensationScale.expenseType?.type || '-'}</TableCell>
                                      <TableCell style={{ fontWeight: 'bold', color: '#2c5aa0' }}>{compensationScale.amount} MGA</TableCell>
                                      <TableCell>{compensationScale.place}</TableCell>
                                    </TableRow>
                                  ))}
                                </tbody>
                              </DataTable>
                            </div>
                          )}
                        </>
                      ) : (
                        <NoDataMessage style={{ marginTop: '1rem' }}>Aucune échelle de compensation pour cette catégorie.</NoDataMessage>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </CategorySection>
        ) : (
          <DataTable>
            <tbody>
              <TableRow>
                <TableCell colSpan={3}>
                  <NoDataMessage>Aucune catégorie trouvée.</NoDataMessage>
                </TableCell>
              </TableRow>
            </tbody>
          </DataTable>
        )}
      </TableContainer>

      <ExpenseTypeForm
        isOpen={showExpenseForm}
        onClose={() => {
          setShowExpenseForm(false);
          setSelectedExpenseType(null);
        }}
        onFormSuccess={handleExpenseFormSuccess}
        expenseType={selectedExpenseType}
      />

      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setSelectedCategory(null);
          setBulkSelectedCategories([]);
        }}
        onFormSuccess={handleCategoryFormSuccess}
        category={selectedCategory}
        bulkCategories={bulkSelectedCategories}
      />
    </>
  );
};

export default ExpenseTypeList;