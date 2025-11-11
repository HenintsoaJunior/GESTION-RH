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
  FormFieldCell,
  FormInput,
  ErrorMessage,
  FormActions,
  Button,
  RemoveItem,
} from "@/styles/form-container";
import { useExpenseTypes } from "@/api/mission/expense_type/services";
import { useGetAllGeoZones } from "@/api/zones/services";
import { useBulkSyncExpenseCompensationScales, type BulkExpenseCompensationScaleDTO } from "@/api/mission/expense_compensarion_scale/services";
import type { ExpenseCompensationScale } from "@/api/mission/expense_compensarion_scale/services";

interface TransportScaleLine {
  scaleId?: string;
  zoneId: string;
  zoneLabel: string;
  amount: string;
}

interface ExpenseScaleLine {
  scaleId?: string;
  zoneId: string;
  zoneLabel: string;
  expenseTypeId: string;
  typeLabel: string;
  amount: string;
}

interface FormData {
  transports: TransportScaleLine[];
  expenses: ExpenseScaleLine[];
}

interface FieldErrors {
  [key: string]: string[];
}

interface ExpenseCompensationScaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  transportScales: ExpenseCompensationScale[];
  expenseScales: ExpenseCompensationScale[];
}

const ExpenseCompensationScaleForm: React.FC<ExpenseCompensationScaleFormProps> = ({ 
  isOpen, 
  onClose, 
  onFormSuccess,
  transportScales,
  expenseScales
}) => {
  const [formData, setFormData] = useState<FormData>({ transports: [], expenses: [] });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data: expenseTypesResponse } = useExpenseTypes();
  const { data: zonesResponse } = useGetAllGeoZones();
  const bulkSyncMutation = useBulkSyncExpenseCompensationScales();

  const zoneOptions = useMemo(() => 
    zonesResponse?.data
      ?.filter((z: any) => z && z.zoneId && z.name)
      ?.map((z: any) => ({ id: z.zoneId, label: z.name }))
      ?.sort((a, b) => (a.label || '').localeCompare(b.label || '')) || [], 
    [zonesResponse]
  );

  const expenseOptions = useMemo(() => 
    expenseTypesResponse?.data
      ?.filter((et: any) => et && et.expenseTypeId && et.type)
      ?.map((et: any) => ({ id: et.expenseTypeId, label: et.type }))
      ?.sort((a, b) => (a.label || '').localeCompare(b.label || '')) || [], 
    [expenseTypesResponse]
  );

  const usedZoneIds = useMemo(() => 
    formData.transports.map(line => line.zoneId).filter(id => id !== ''), 
    [formData.transports]
  );

  const usedCombos = useMemo(() => 
    formData.expenses
      .map(line => line.zoneId && line.expenseTypeId ? `${line.zoneId}-${line.expenseTypeId}` : null)
      .filter(Boolean) as string[],
    [formData.expenses]
  );

  const canAddTransport = useMemo(() => 
    usedZoneIds.length < zoneOptions.length, 
    [usedZoneIds.length, zoneOptions.length]
  );

  const canAddExpense = useMemo(() => true, []); // No strict limit for expenses

  useEffect(() => {
    if (isOpen) {
      const transportLines = transportScales.map((scale: ExpenseCompensationScale) => ({
        scaleId: scale.expenseCompensationScaleId,
        zoneId: scale.zoneId || '',
        zoneLabel: scale.zone?.name || '',
        amount: scale.amount.toString(),
      }));

      const expenseLines = expenseScales.map((scale: ExpenseCompensationScale) => ({
        scaleId: scale.expenseCompensationScaleId,
        zoneId: scale.zoneId || '',
        zoneLabel: scale.zone?.name || '',
        expenseTypeId: scale.expenseTypeId || '',
        typeLabel: scale.expenseType?.type || '',
        amount: scale.amount.toString(),
      }));

      setFormData({ transports: transportLines, expenses: expenseLines });
      setFieldErrors({});
    }
  }, [isOpen, transportScales, expenseScales]);

  const handleTransportLineChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fullName = e.target.name;
    const field = fullName.split('.').pop() || fullName;
    const { value } = e.target;
    setFormData((prev: FormData) => {
      const lines = [...prev.transports];
      if (field === 'zoneId') {
        if (value && usedZoneIds.includes(value) && lines[index].zoneId !== value) {
          return prev;
        }
        const selected = zoneOptions.find((opt: any) => opt.id === value);
        lines[index] = { 
          ...lines[index], 
          zoneId: value, 
          zoneLabel: selected?.label || '' 
        };
      } else {
        lines[index] = { ...lines[index], [field]: value };
      }
      return { ...prev, transports: lines };
    });
  }, [zoneOptions, usedZoneIds]);

  const handleExpenseLineChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fullName = e.target.name;
    const field = fullName.split('.').pop() || fullName;
    const { value } = e.target;
    setFormData((prev: FormData) => {
      const lines = [...prev.expenses];
      const currentCombo = lines[index].zoneId && lines[index].expenseTypeId ? `${lines[index].zoneId}-${lines[index].expenseTypeId}` : null;
      const combosWithoutSelf = usedCombos.filter(c => c !== currentCombo);
      if (field === 'zoneId') {
        const currentTypeId = lines[index].expenseTypeId;
        const newCombo = value && currentTypeId ? `${value}-${currentTypeId}` : null;
        if (newCombo && combosWithoutSelf.includes(newCombo)) {
          return prev;
        }
        const selectedZone = zoneOptions.find((opt: any) => opt.id === value);
        lines[index] = { 
          ...lines[index], 
          zoneId: value, 
          zoneLabel: selectedZone?.label || '' 
        };
      } else if (field === 'expenseTypeId') {
        const currentZoneId = lines[index].zoneId;
        const newCombo = currentZoneId && value ? `${currentZoneId}-${value}` : null;
        if (newCombo && combosWithoutSelf.includes(newCombo)) {
          return prev;
        }
        const selectedExpense = expenseOptions.find((opt: any) => opt.id === value);
        lines[index] = { 
          ...lines[index], 
          expenseTypeId: value, 
          typeLabel: selectedExpense?.label || '' 
        };
      } else {
        lines[index] = { ...lines[index], [field]: value };
      }
      return { ...prev, expenses: lines };
    });
  }, [expenseOptions, zoneOptions, usedCombos]);

  const addLine = useCallback((section: 'transports' | 'expenses') => {
    const newLine = section === 'transports' 
      ? { zoneId: '', zoneLabel: '', amount: '' } as TransportScaleLine
      : { zoneId: '', zoneLabel: '', expenseTypeId: '', typeLabel: '', amount: '' } as ExpenseScaleLine;
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

    // Validate transports
    formData.transports.forEach((line, index) => {
      const key = `transports.${index}`;
      if (!line.zoneId.trim()) {
        if (!newErrors[`${key}.zoneId`]) newErrors[`${key}.zoneId`] = [];
        newErrors[`${key}.zoneId`].push('Zone requise');
      }
      const amountNum = parseFloat(line.amount);
      if (!line.amount.trim() || isNaN(amountNum) || amountNum < 0) {
        if (!newErrors[`${key}.amount`]) newErrors[`${key}.amount`] = [];
        newErrors[`${key}.amount`].push('Montant valide (≥ 0) requis');
      }
    });

    // Validate expenses
    formData.expenses.forEach((line, index) => {
      const key = `expenses.${index}`;
      if (!line.zoneId.trim()) {
        if (!newErrors[`${key}.zoneId`]) newErrors[`${key}.zoneId`] = [];
        newErrors[`${key}.zoneId`].push('Zone requise');
      }
      if (!line.expenseTypeId.trim()) {
        if (!newErrors[`${key}.expenseTypeId`]) newErrors[`${key}.expenseTypeId`] = [];
        newErrors[`${key}.expenseTypeId`].push('Type de dépense requis');
      }
      const amountNum = parseFloat(line.amount);
      if (!line.amount.trim() || isNaN(amountNum) || amountNum < 0) {
        if (!newErrors[`${key}.amount`]) newErrors[`${key}.amount`] = [];
        newErrors[`${key}.amount`].push('Montant valide (≥ 0) requis');
      }
    });

    // Optional: Validate no duplicates (UI already prevents, but robust check)
    const validTransports = formData.transports.filter(line => line.zoneId.trim());
    const transportZoneIds = validTransports.map(line => line.zoneId);
    if (new Set(transportZoneIds).size < transportZoneIds.length) {
      if (!newErrors.duplicateTransports) newErrors.duplicateTransports = [];
      newErrors.duplicateTransports.push('Zones dupliquées dans les transports non autorisées');
    }

    const validExpenses = formData.expenses.filter(line => line.zoneId.trim() && line.expenseTypeId.trim());
    const expenseCombos = validExpenses.map(line => `${line.zoneId}-${line.expenseTypeId}`);
    if (new Set(expenseCombos).size < expenseCombos.length) {
      if (!newErrors.duplicateExpenses) newErrors.duplicateExpenses = [];
      newErrors.duplicateExpenses.push('Combinaisons zone/type de dépense dupliquées non autorisées');
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const transportDtos = formData.transports
      .filter((line) => line.zoneId.trim() && line.amount.trim())
      .map((line) => {
        const amount = parseFloat(line.amount);
        return {
          amount: isNaN(amount) ? 0 : amount,
          isTransport: 1,
          zoneId: line.zoneId,
          devise: 'EUR',
        } as BulkExpenseCompensationScaleDTO;
      });
      
    const expenseDtos = formData.expenses
      .filter((line) => line.zoneId.trim() && line.expenseTypeId.trim() && line.amount.trim())
      .map((line) => {
        const amount = parseFloat(line.amount);
        return {
          amount: isNaN(amount) ? 0 : amount,
          isTransport: 0,
          expenseTypeId: line.expenseTypeId,
          zoneId: line.zoneId,
          devise: 'EUR',
        } as BulkExpenseCompensationScaleDTO;
      });
      
    const expenseCompensationScales = [...transportDtos, ...expenseDtos];
    
    const syncRequest = {
      expenseCompensationScales,
    };
    
    bulkSyncMutation.mutate(syncRequest, {
      onSuccess: () => {
        setIsSubmitting(false);
        onFormSuccess('Échelles de compensation des frais mises à jour avec succès.');
        setFormData({ transports: [], expenses: [] });
      },
      onError: (error: any) => {
        setIsSubmitting(false);
        const errorMessage = error?.response?.data?.message || error?.message || 'Une erreur est survenue';
        setFieldErrors(prev => ({ 
          ...prev, 
          general: [errorMessage] 
        }));
      },
    });
  }, [formData, onFormSuccess, validateForm, bulkSyncMutation]);

  const handleCancel = useCallback(() => {
    setFieldErrors({});
    onClose();
  }, [onClose]);

  const renderSelect = (options: any[], value: string, onChange: (e: any) => void, name: string, errorKey?: string) => (
    <>
      <FormInput as="select" value={value} onChange={onChange} name={name}>
        <option value="">Sélectionnez...</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </FormInput>
      {errorKey && fieldErrors[errorKey] && (
        <ErrorMessage>{fieldErrors[errorKey].join(", ")}</ErrorMessage>
      )}
    </>
  );

  const renderInput = (type: string, value: string, onChange: (e: any) => void, name: string, errorKey?: string, disabled?: boolean) => (
    <>
      <FormInput
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min="0"
      />
      {errorKey && fieldErrors[errorKey] && (
        <ErrorMessage>{fieldErrors[errorKey].join(", ")}</ErrorMessage>
      )}
    </>
  );

  // Render section errors (e.g., duplicates)
  const renderSectionErrors = (section: 'transports' | 'expenses') => {
    const errorKey = `duplicate${section.charAt(0).toUpperCase() + section.slice(1)}`;
    return fieldErrors[errorKey] ? (
      <ErrorMessage style={{ marginBottom: '0.5rem', display: 'block' }}>
        {fieldErrors[errorKey].join(", ")}
      </ErrorMessage>
    ) : null;
  };

  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>Gestion des Échelles de Compensation des Frais</PopupTitle>
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
            <GenericForm id="expenseCompensationScaleForm" onSubmit={handleSubmit}>
              {fieldErrors.general && (
                <ErrorMessage style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  {fieldErrors.general.join(", ")}
                </ErrorMessage>
              )}

              <FormSectionTitle>Échelles de Transport</FormSectionTitle>
              {renderSectionErrors('transports')}
              <FormTable style={{ minWidth: "500px", border: "1px solid var(--border-color)" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Zone</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Montant (EUR)</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)", width: "80px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.transports.map((line, index) => {
                    const zoneErrorKey = `transports.${index}.zoneId`;
                    const amountErrorKey = `transports.${index}.amount`;
                    return (
                      <tr key={line.scaleId || index}>
                        <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                          {renderSelect(
                            zoneOptions,
                            line.zoneId,
                            (e) => handleTransportLineChange(index, e),
                            `transports[${index}].zoneId`,
                            zoneErrorKey
                          )}
                        </FormFieldCell>
                        <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                          {renderInput(
                            "number",
                            line.amount,
                            (e) => handleTransportLineChange(index, e),
                            `transports[${index}].amount`,
                            amountErrorKey,
                            isSubmitting
                          )}
                        </FormFieldCell>
                        <FormFieldCell style={{ textAlign: "center", padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                          <RemoveItem type="button" onClick={() => removeLine('transports', index)} disabled={isSubmitting}>
                            <Trash2 size={16} />
                          </RemoveItem>
                        </FormFieldCell>
                      </tr>
                    );
                  })}
                </tbody>
              </FormTable>
              <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)" }}>
                <Button type="button" onClick={() => addLine('transports')} disabled={isSubmitting || !canAddTransport}>
                  <Plus size={16} /> Ajouter une échelle de transport
                </Button>
              </div>

              <FormSectionTitle>Échelles de Dépenses</FormSectionTitle>
              {renderSectionErrors('expenses')}
              <FormTable style={{ minWidth: "600px", border: "1px solid var(--border-color)" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Zone</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Type de Dépense</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Montant (EUR)</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)", width: "80px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.expenses.map((line, index) => {
                    const zoneErrorKey = `expenses.${index}.zoneId`;
                    const typeErrorKey = `expenses.${index}.expenseTypeId`;
                    const amountErrorKey = `expenses.${index}.amount`;
                    return (
                      <tr key={line.scaleId || index}>
                        <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                          {renderSelect(
                            zoneOptions,
                            line.zoneId,
                            (e) => handleExpenseLineChange(index, e),
                            `expenses[${index}].zoneId`,
                            zoneErrorKey
                          )}
                        </FormFieldCell>
                        <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                          {renderSelect(
                            expenseOptions,
                            line.expenseTypeId,
                            (e) => handleExpenseLineChange(index, e),
                            `expenses[${index}].expenseTypeId`,
                            typeErrorKey
                          )}
                        </FormFieldCell>
                        <FormFieldCell style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                          {renderInput(
                            "number",
                            line.amount,
                            (e) => handleExpenseLineChange(index, e),
                            `expenses[${index}].amount`,
                            amountErrorKey,
                            isSubmitting
                          )}
                        </FormFieldCell>
                        <FormFieldCell style={{ textAlign: "center", padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                          <RemoveItem type="button" onClick={() => removeLine('expenses', index)} disabled={isSubmitting}>
                            <Trash2 size={16} />
                          </RemoveItem>
                        </FormFieldCell>
                      </tr>
                    );
                  })}
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
                      Enregistrement en cours...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Enregistrer
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

export default ExpenseCompensationScaleForm;