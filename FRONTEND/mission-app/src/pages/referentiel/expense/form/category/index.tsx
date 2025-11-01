/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useCallback, useState } from 'react';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  ButtonPrimary
} from "@/styles/popup-styles";
import {
  FormContainer,
  GenericForm,
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabelRequired,
  FormInput,
  ErrorMessage,
  FormActions,
  Button,
  RemoveItem,
} from "@/styles/form-container";
import { useExpenseTypes } from "@/api/mission/expense/expense";
import { useTransports } from "@/api/transport/services";
import { useBulkCreateCompensationScales, type BulkCompensationScaleDTO } from "@/api/mission/compensation-scale/services";

interface ScaleLine {
  scaleId?: string;
  typeId: string;
  typeLabel: string;
  amount: string;
  place: string;
}

interface FormData {
  label: string;
  code: string;
  transports: ScaleLine[];
  expenses: ScaleLine[];
}

interface FieldErrors {
  [key: string]: string[];
}

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  category?: {
    employeeCategoryId: string;
    label: string;
    code: string;
    transportScales?: any[];
    expenseScales?: any[];
  } | null;
  bulkCategories?: string[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  isOpen, 
  onClose, 
  onFormSuccess, 
  category, 
  bulkCategories = [] 
}) => {
  const [formData, setFormData] = useState<FormData>({ label: '', code: '', transports: [], expenses: [] });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data: expenseTypesResponse } = useExpenseTypes();
  const { data: transportResponse } = useTransports();
  const createBulkMutation = useBulkCreateCompensationScales();

  const isBulkMode = bulkCategories.length > 0;
  const isCreateMode = !category && !isBulkMode;
  const isUpdateMode = !!category;

  const parseTime = (timeStr?: string): number | null => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const transportOptions = useMemo(() => 
    transportResponse?.data?.map((t: any) => ({ id: t.transportId, label: t.type }))?.sort((a, b) => a.label.localeCompare(b.label)) || [], 
    [transportResponse]
  );

  const expenseOptions = useMemo(() => {
    const options = expenseTypesResponse?.data?.map((et: any) => ({ 
      id: et.expenseTypeId, 
      label: et.type,
      timeStart: et.timeStart 
    })) || [];
    return options.sort((a, b) => {
      const timeA = parseTime(a.timeStart);
      const timeB = parseTime(b.timeStart);
      if (timeA === null && timeB === null) return a.label.localeCompare(b.label);
      if (timeA === null) return 1;
      if (timeB === null) return -1;
      return timeA - timeB;
    }).map(({ id, label }) => ({ id, label }));
  }, [expenseTypesResponse]);

  const usedTransportIds = useMemo(() => 
    formData.transports.map(line => line.typeId).filter(id => id !== ''), 
    [formData.transports]
  );

  const usedExpenseIds = useMemo(() => 
    formData.expenses.map(line => line.typeId).filter(id => id !== ''), 
    [formData.expenses]
  );

  const canAddTransport = useMemo(() => 
    usedTransportIds.length < transportOptions.length, 
    [usedTransportIds.length, transportOptions.length]
  );

  const canAddExpense = useMemo(() => 
    usedExpenseIds.length < expenseOptions.length, 
    [usedExpenseIds.length, expenseOptions.length]
  );

  useEffect(() => {
    if (isOpen) {
      console.log('Form opened - Props:', { category, bulkCategories, isBulkMode, isUpdateMode, isCreateMode });
      
      if (category) {
        const transports = (category.transportScales || []).map((scale: any) => ({
          scaleId: scale.compensationScaleId,
          typeId: scale.transport?.transportId || '',
          typeLabel: scale.transport?.type || '',
          amount: scale.amount?.toString() || '',
          place: scale.place || '',
        }));
        const expenses = (category.expenseScales || []).map((scale: any) => ({
          scaleId: scale.compensationScaleId,
          typeId: scale.expenseType?.expenseTypeId || '',
          typeLabel: scale.expenseType?.type || '',
          amount: scale.amount?.toString() || '',
          place: scale.place || '',
        }));
        setFormData({ 
          label: category.label || '', 
          code: category.code || '', 
          transports, 
          expenses 
        });
      } else if (isBulkMode) {
        setFormData({ label: '', code: '', transports: [], expenses: [] });
      } else {
        setFormData({ label: '', code: '', transports: [], expenses: [] });
      }
      setFieldErrors({});
    }
  }, [isOpen, category, isBulkMode, bulkCategories, isCreateMode, isUpdateMode]);

  const popupTitle = useMemo(() => {
    if (isBulkMode) {
      return `Modifier les échelles pour ${bulkCategories.length} catégories`;
    } else if (isUpdateMode) {
      return `Modifier la catégorie "${category?.label}"`;
    } else {
      return 'Ajouter une catégorie';
    }
  }, [isBulkMode, bulkCategories.length, isUpdateMode, category?.label]);

  const submitText = useMemo(() => {
    if (isBulkMode) {
      return 'Appliquer';
    } else if (isUpdateMode) {
      return 'Modifier';
    } else {
      return 'Ajouter';
    }
  }, [isBulkMode, isUpdateMode]);

  const submittingText = useMemo(() => {
    if (isBulkMode) {
      return 'Application en cours...';
    } else if (isUpdateMode) {
      return 'Modification en cours...';
    } else {
      return 'Création en cours...';
    }
  }, [isBulkMode, isUpdateMode]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const handleTransportLineChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fullName = e.target.name;
    const field = fullName.split('.').pop() || fullName;
    const { value } = e.target;
    setFormData((prev: FormData) => {
      const lines = [...prev.transports];
      if (field === 'typeId') {
        if (value && usedTransportIds.includes(value) && lines[index].typeId !== value) {
          return prev;
        }
        const selected = transportOptions.find((opt: any) => opt.id === value);
        lines[index] = { 
          ...lines[index], 
          typeId: value, 
          typeLabel: selected?.label || '' 
        };
      } else {
        lines[index] = { ...lines[index], [field]: value };
      }
      return { ...prev, transports: lines };
    });
  }, [transportOptions, usedTransportIds]);

  const handleExpenseLineChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fullName = e.target.name;
    const field = fullName.split('.').pop() || fullName;
    const { value } = e.target;
    setFormData((prev: FormData) => {
      const lines = [...prev.expenses];
      if (field === 'typeId') {
        if (value && usedExpenseIds.includes(value) && lines[index].typeId !== value) {
          return prev;
        }
        const selected = expenseOptions.find((opt: any) => opt.id === value);
        lines[index] = { 
          ...lines[index], 
          typeId: value, 
          typeLabel: selected?.label || '' 
        };
      } else {
        lines[index] = { ...lines[index], [field]: value };
      }
      return { ...prev, expenses: lines };
    });
  }, [expenseOptions, usedExpenseIds]);

  const addLine = useCallback((section: 'transports' | 'expenses') => {
    const newLine: ScaleLine = {
      typeId: '',
      typeLabel: '',
      amount: '',
      place: '',
    };
    setFormData((prev: FormData) => ({
      ...prev,
      [section]: [...prev[section], newLine],
    }));
  }, []);

  const removeLine = useCallback((section: 'transports' | 'expenses', index: number) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [section]: prev[section].filter((_: any, i: number) => i !== index),
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FieldErrors = {};
    if (isCreateMode) {
      if (!formData.label.trim()) {
        newErrors.label = ['Le label est requis.'];
      }
      if (!formData.code.trim()) {
        newErrors.code = ['Le code est requis.'];
      }
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isCreateMode]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    let successMessage: string;
    if (isBulkMode) {
      successMessage = `Échelles appliquées à ${bulkCategories.length} catégories avec succès.`;
    } else if (isUpdateMode) {
      successMessage = 'Catégorie modifiée avec succès.';
    } else {
      successMessage = 'Catégorie créée avec succès.';
    }
    
    if (isCreateMode) {
      setTimeout(() => {
        setIsSubmitting(false);
        onFormSuccess(successMessage);
        setFormData({ label: '', code: '', transports: [], expenses: [] });
      }, 1000);
    } else {
      let categoryIds: string[] = [];
      
      if (isBulkMode) {
        console.log('Mode BULK - bulkCategories:', bulkCategories);
        categoryIds = bulkCategories.filter(id => id && String(id).trim());
      } else if (category?.employeeCategoryId) {
        console.log('Mode SINGLE - category:', category);
        const categoryId = String(category.employeeCategoryId).trim();
        if (categoryId) {
          categoryIds = [categoryId];
        }
      }
      
      console.log('CategoryIds finales:', categoryIds);
      
      if (categoryIds.length === 0) {
        setIsSubmitting(false);
        setFieldErrors(prev => ({ 
          ...prev, 
          general: ['Aucune catégorie valide sélectionnée. Veuillez réessayer.'] 
        }));
        console.error('Aucun ID de catégorie valide:', { isBulkMode, bulkCategories, category, categoryIds });
        return;
      }
      
      const transportScales = formData.transports
        .filter((line) => line.typeId && line.amount)
        .map((line) => ({
          amount: parseFloat(line.amount),
          place: line.place || '',
          transportId: line.typeId,
        } as BulkCompensationScaleDTO));
        
      const expenseScales = formData.expenses
        .filter((line) => line.typeId && line.amount)
        .map((line) => ({
          amount: parseFloat(line.amount),
          place: line.place || '',
          expenseTypeId: line.typeId,
        } as BulkCompensationScaleDTO));
        
      const compensationScales = [...transportScales, ...expenseScales];
      
      const bulkRequest = {
        CategoryIds: categoryIds,
        CompensationScales: compensationScales,
      };
      
      console.log('Requête API:', JSON.stringify(bulkRequest, null, 2));
      
      createBulkMutation.mutate({ request: bulkRequest }, {
        onSuccess: () => {
          console.log('Succès API');
          setIsSubmitting(false);
          onFormSuccess(successMessage);
        },
        onError: (error: any) => {
          console.error('Erreur API complète:', error);
          console.error('Erreur API response:', error?.response);
          console.error('Erreur API response data:', error?.response?.data);
          setIsSubmitting(false);
          const errorMessage = error?.response?.data?.message || error?.message || 'Une erreur est survenue';
          setFieldErrors(prev => ({ 
            ...prev, 
            general: [errorMessage] 
          }));
        },
      });
    }
  }, [isBulkMode, bulkCategories, isUpdateMode, category, formData, isCreateMode, onFormSuccess, validateForm, createBulkMutation]);

  const handleCancel = useCallback(() => {
    setFieldErrors({});
    onClose();
  }, [onClose]);

  const renderSelect = (options: any[], value: string, onChange: (e: any) => void, name: string) => (
    <FormInput as="select" value={value} onChange={onChange} name={name}>
      <option value="">Sélectionnez...</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </FormInput>
  );

  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>{popupTitle}</PopupTitle>
          <PopupClose
            onClick={handleCancel}
            disabled={isSubmitting}
            aria-label="Fermer le formulaire"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          <FormContainer>
            <GenericForm id="categoryForm" onSubmit={handleSubmit}>
              {isCreateMode && (
                <>
                  <FormSectionTitle>Informations sur la Catégorie</FormSectionTitle>
                  <FormTable>
                    <tbody>
                      <FormRow>
                        <FormFieldCell>
                          <FormLabelRequired>Label</FormLabelRequired>
                          <FormInput
                            type="text"
                            name="label"
                            value={formData.label}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={fieldErrors.label && fieldErrors.label.length > 0 ? "input-error" : ""}
                          />
                          {fieldErrors.label && fieldErrors.label.length > 0 && (
                            <ErrorMessage>{fieldErrors.label.join(", ")}</ErrorMessage>
                          )}
                        </FormFieldCell>
                        <FormFieldCell>
                          <FormLabelRequired>Code</FormLabelRequired>
                          <FormInput
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={fieldErrors.code && fieldErrors.code.length > 0 ? "input-error" : ""}
                          />
                          {fieldErrors.code && fieldErrors.code.length > 0 && (
                            <ErrorMessage>{fieldErrors.code.join(", ")}</ErrorMessage>
                          )}
                        </FormFieldCell>
                      </FormRow>
                    </tbody>
                  </FormTable>
                </>
              )}

              {fieldErrors.general && (
                <ErrorMessage style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  {fieldErrors.general.join(", ")}
                </ErrorMessage>
              )}

              <FormSectionTitle>Échelles de Transport</FormSectionTitle>
              {isBulkMode && (
                <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '1rem' }}>
                  Les échelles ajoutées seront appliquées à toutes les catégories sélectionnées.
                </p>
              )}
              <FormTable style={{ minWidth: "600px", border: "1px solid var(--border-color)" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Type de Transport</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Montant (MGA)</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Zone</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)", width: "80px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.transports.map((line, index) => (
                    <tr key={line.scaleId || index}>
                      <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                        {renderSelect(transportOptions, line.typeId, (e) => handleTransportLineChange(index, e), `transports[${index}].typeId`)}
                      </FormFieldCell>
                      <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                        <FormInput
                          type="number"
                          name={`transports[${index}].amount`}
                          value={line.amount}
                          onChange={(e) => handleTransportLineChange(index, e)}
                          disabled={isSubmitting}
                          min="0"
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                        <FormInput
                          type="text"
                          name={`transports[${index}].place`}
                          value={line.place}
                          onChange={(e) => handleTransportLineChange(index, e)}
                          disabled={isSubmitting}
                          placeholder="Ex: Zone 1"
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ textAlign: "center", padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                        <RemoveItem type="button" onClick={() => removeLine('transports', index)} disabled={isSubmitting}>
                          <Trash2 size={16} />
                        </RemoveItem>
                      </FormFieldCell>
                    </tr>
                  ))}
                </tbody>
              </FormTable>
              <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)" }}>
                <Button type="button" onClick={() => addLine('transports')} disabled={isSubmitting || !canAddTransport}>
                  <Plus size={16} /> Ajouter une échelle de transport
                </Button>
              </div>

              <FormSectionTitle>Échelles de Dépenses</FormSectionTitle>
              {isBulkMode && (
                <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '1rem' }}>
                  Les échelles ajoutées seront appliquées à toutes les catégories sélectionnées.
                </p>
              )}
              <FormTable style={{ minWidth: "600px", border: "1px solid var(--border-color)" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Type de Dépense</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Montant (MGA)</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Zone</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)", width: "80px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.expenses.map((line, index) => (
                    <tr key={line.scaleId || index}>
                      <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                        {renderSelect(expenseOptions, line.typeId, (e) => handleExpenseLineChange(index, e), `expenses[${index}].typeId`)}
                      </FormFieldCell>
                      <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                        <FormInput
                          type="number"
                          name={`expenses[${index}].amount`}
                          value={line.amount}
                          onChange={(e) => handleExpenseLineChange(index, e)}
                          disabled={isSubmitting}
                          min="0"
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                        <FormInput
                          type="text"
                          name={`expenses[${index}].place`}
                          value={line.place}
                          onChange={(e) => handleExpenseLineChange(index, e)}
                          disabled={isSubmitting}
                          placeholder="Ex: Zone 1"
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ textAlign: "center", padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                        <RemoveItem type="button" onClick={() => removeLine('expenses', index)} disabled={isSubmitting}>
                          <Trash2 size={16} />
                        </RemoveItem>
                      </FormFieldCell>
                    </tr>
                  ))}
                </tbody>
              </FormTable>
              <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)" }}>
                <Button type="button" onClick={() => addLine('expenses')} disabled={isSubmitting || !canAddExpense}>
                  <Plus size={16} /> Ajouter une échelle de dépense
                </Button>
              </div>

              <FormActions style={{ justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <ButtonPrimary
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      {submittingText}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {submitText}
                    </>
                  )}
                </ButtonPrimary>
              </FormActions>
            </GenericForm>
          </FormContainer>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default CategoryForm;