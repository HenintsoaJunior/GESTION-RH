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
import { useTransports } from "@/api/transport/services";
import { useBulkCreateCompensationScales, type BulkCompensationScaleDTO } from "@/api/mission/compensation-scale/services";
import type { CompensationScale } from "@/api/mission/compensation-scale/services";

interface ScaleLine {
  scaleId?: string;
  typeId: string;
  typeLabel: string;
  amount: string;
}

interface FormData {
  transports: ScaleLine[];
  expenses: ScaleLine[];
}

interface FieldErrors {
  [key: string]: string[];
}

interface CompensationScaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  transports: CompensationScale[];
  expenses: CompensationScale[];
}

const CompensationScaleForm: React.FC<CompensationScaleFormProps> = ({ 
  isOpen, 
  onClose, 
  onFormSuccess,
  transports,
  expenses
}) => {
  const [formData, setFormData] = useState<FormData>({ transports: [], expenses: [] });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data: expenseTypesResponse } = useExpenseTypes();
  const { data: transportResponse } = useTransports();
  const createBulkMutation = useBulkCreateCompensationScales();

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
      const transportLines = transports.map((scale: CompensationScale) => ({
        scaleId: scale.compensationScaleId,
        typeId: scale.transportId || '',
        typeLabel: scale.transport?.type || '',
        amount: scale.amount.toString(),
      }));

      const expenseLines = expenses.map((scale: CompensationScale) => ({
        scaleId: scale.compensationScaleId,
        typeId: scale.expenseTypeId || '',
        typeLabel: scale.expenseType?.type || '',
        amount: scale.amount.toString(),
      }));

      setFormData({ transports: transportLines, expenses: expenseLines });
      setFieldErrors({});
    }
  }, [isOpen, transports, expenses]);

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
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const transportScales = formData.transports
      .filter((line) => line.typeId && line.amount)
      .map((line) => ({
        amount: parseFloat(line.amount),
        transportId: line.typeId,
      } as BulkCompensationScaleDTO));
      
    const expenseScales = formData.expenses
      .filter((line) => line.typeId && line.amount)
      .map((line) => ({
        amount: parseFloat(line.amount),
        expenseTypeId: line.typeId,
      } as BulkCompensationScaleDTO));
      
    const compensationScales = [...transportScales, ...expenseScales];
    
    const bulkRequest = {
      CompensationScales: compensationScales,
    };
    
    createBulkMutation.mutate({ request: bulkRequest }, {
      onSuccess: () => {
        setIsSubmitting(false);
        onFormSuccess('Échelles de compensation mises à jour avec succès.');
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
  }, [formData, onFormSuccess, validateForm, createBulkMutation]);

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
          <PopupTitle>Gestion des Échelles de Compensation</PopupTitle>
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
            <GenericForm id="compensationScaleForm" onSubmit={handleSubmit}>
              {fieldErrors.general && (
                <ErrorMessage style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  {fieldErrors.general.join(", ")}
                </ErrorMessage>
              )}

              <FormSectionTitle>Échelles de Transport</FormSectionTitle>
              <FormTable style={{ minWidth: "500px", border: "1px solid var(--border-color)" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Type de Transport</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Montant (MGA)</th>
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
              <FormTable style={{ minWidth: "500px", border: "1px solid var(--border-color)" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Type de Dépense</th>
                    <th style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>Montant (MGA)</th>
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

export default CompensationScaleForm;