import { useEffect, useMemo, useCallback, useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
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
  FormLabel,
  FormInput,
  ErrorMessage
} from "@/styles/form-container";
import { useCreateExpenseType, useUpdateExpenseType } from "@/api/mission/expense/expense";

interface FormData {
  type: string;
  timeStart: string;
  timeEnd: string;
}

interface FieldErrors {
  [key: string]: string[];
}

interface ExpenseTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  expenseType?: { expenseTypeId: string; type: string; timeStart?: string; timeEnd?: string } | null;
}

const ExpenseTypeForm: React.FC<ExpenseTypeFormProps> = ({ isOpen, onClose, onFormSuccess, expenseType }) => {
  const [formData, setFormData] = useState<FormData>({ type: '', timeStart: '', timeEnd: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMutation = useCreateExpenseType();
  const updateMutation = useUpdateExpenseType();

  const isSubmitting = useMemo(() => 
    createMutation.isPending || updateMutation.isPending,
    [createMutation.isPending, updateMutation.isPending]
  );

  useEffect(() => {
    if (isOpen) {
      if (expenseType) {
        setFormData({ 
          type: expenseType.type, 
          timeStart: expenseType.timeStart || '', 
          timeEnd: expenseType.timeEnd || '' 
        });
      } else {
        setFormData({ type: '', timeStart: '', timeEnd: '' });
      }
      setFieldErrors({});
      setSubmitError(null);
    }
  }, [isOpen, expenseType]);

  const isUpdateMode = useMemo(() => !!expenseType, [expenseType]);

  const popupTitle = useMemo(() => 
    isUpdateMode 
      ? `Modifier le type de dépense "${expenseType?.type}"` 
      : 'Ajouter un type de dépense',
    [isUpdateMode, expenseType?.type]
  );
  const submitText = useMemo(() => 
    isUpdateMode ? 'Modifier' : 'Ajouter',
    [isUpdateMode]
  );
  const submittingText = useMemo(() => 
    isUpdateMode ? 'Modification en cours...' : 'Création en cours...',
    [isUpdateMode]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FieldErrors = {};
    if (!isUpdateMode && !formData.type.trim()) {
      newErrors.type = ['Le type est requis.'];
    }
    if (formData.timeStart && formData.timeEnd && formData.timeStart >= formData.timeEnd) {
      newErrors.timeEnd = ["L'heure de fin doit être postérieure à l'heure de début."];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isUpdateMode]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError(null);
    const basePayload = {
      type: formData.type,
      timeStart: formData.timeStart || undefined,
      timeEnd: formData.timeEnd || undefined,
    };
    const payload = isUpdateMode 
      ? { ...basePayload, expenseTypeId: expenseType!.expenseTypeId } 
      : basePayload;
    if (isUpdateMode) {
      updateMutation.mutate(
        {
          id: expenseType!.expenseTypeId,
          expenseType: payload,
        },
        {
          onSuccess: () => {
            onFormSuccess('Type de dépense modifié avec succès.');
          },
          onError: (error) => {
            console.error('Erreur lors de la modification:', error);
            setSubmitError('Une erreur est survenue lors de la modification. Veuillez réessayer.');
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onFormSuccess('Type de dépense créé avec succès.');
          setFormData({ type: '', timeStart: '', timeEnd: '' });
        },
        onError: (error) => {
          console.error('Erreur lors de la création:', error);
          setSubmitError('Une erreur est survenue lors de la création. Veuillez réessayer.');
        },
      });
    }
  }, [isUpdateMode, onFormSuccess, validateForm, expenseType, formData, updateMutation, createMutation]);

  const handleCancel = useCallback(() => {
    setFieldErrors({});
    setSubmitError(null);
    onClose();
  }, [onClose]);

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
            <GenericForm id="expenseTypeForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur le Type de Dépense</FormSectionTitle>
              <FormTable>
                <tbody>
                  {!isUpdateMode && (
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelRequired>Type</FormLabelRequired>
                        <FormInput
                          type="text"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          className={fieldErrors.type && fieldErrors.type.length > 0 ? "input-error" : ""}
                        />
                        {fieldErrors.type && fieldErrors.type.length > 0 && (
                          <ErrorMessage>{fieldErrors.type.join(", ")}</ErrorMessage>
                        )}
                      </FormFieldCell>
                    </FormRow>
                  )}
                  <FormRow>
                    <FormFieldCell>
                      <FormLabel>Heure de Début</FormLabel>
                      <FormInput
                        type="time"
                        name="timeStart"
                        value={formData.timeStart}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Heure de Fin</FormLabel>
                      <FormInput
                        type="time"
                        name="timeEnd"
                        value={formData.timeEnd}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={fieldErrors.timeEnd && fieldErrors.timeEnd.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.timeEnd && fieldErrors.timeEnd.length > 0 && (
                        <ErrorMessage>{fieldErrors.timeEnd.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                  </FormRow>
                </tbody>
              </FormTable>
              {submitError && (
                <ErrorMessage style={{ marginBottom: '1rem', display: 'block' }}>{submitError}</ErrorMessage>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <ButtonPrimary
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  type="submit"
                  disabled={isSubmitting}
                  title={isSubmitting ? submittingText : submitText}
                  aria-label={isSubmitting ? submittingText : submitText}
                  style={{
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
                      <span>{submittingText}</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} aria-hidden="true" />
                      <span>{submitText}</span>
                    </>
                  )}
                </ButtonPrimary>
              </div>
            </GenericForm>
          </FormContainer>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default ExpenseTypeForm;