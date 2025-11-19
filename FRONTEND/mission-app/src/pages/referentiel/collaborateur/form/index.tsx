import { useEffect, useMemo, useCallback, useState } from 'react';
import { X, Save } from 'lucide-react';
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
  FormLabel,
  StyledAutoCompleteInput,
  ErrorMessage
} from "@/styles/form-container";
import { useCreateEmployee, useUpdateEmployee } from '@/api/collaborator/services';

import { useGetSites } from '@/api/site/services';
import { useGetGenders } from '@/api/gender/services';
import { useGetContractTypes } from '@/api/contract/services';
import { useGetAllDirections } from '@/api/direction/services';
import { useGetAllDepartments } from '@/api/department/services';
import { useGetAllServices } from '@/api/service/services';
import { useGetAllUnits } from '@/api/unit/services';
import { useGetNationalities } from '@/api/nationality/services';

import type { Employee, EmployeeFormDTO } from '@/api/collaborator/services';
import type { Site } from '@/api/site/services';
import type { Gender } from '@/api/gender/services';
import type { ContractType } from '@/api/contract/services';
import type { Direction } from '@/api/direction/services';
import type { Department } from '@/api/department/services';
import type { Service } from '@/api/service/services';
import type { Unit } from '@/api/unit/services';
import type { Nationality } from '@/api/nationality/services';

interface ExtendedEmployeeFormDTO extends EmployeeFormDTO {
  nationalityId: string;
}

type EmployeeWithNationality = Employee & {
  nationalityId?: string;
  nationality?: {
    name: string;
  };
};

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  employee: Employee | null;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, onFormSuccess, employee }) => {
  const [formData, setFormData] = useState<ExtendedEmployeeFormDTO>({
    lastName: '',
    firstName: '',
    employeeCode: '',
    birthDate: '',
    birthPlace: '',
    idNumber: '',
    idIssueDate: '',
    idIssuePlace: '',
    phoneNumber: '',
    hireDate: '',
    jobTitle: '',
    contractEndDate: '',
    siteId: '',
    genderId: '',
    nationalityId: '',
    contractTypeId: '',
    directionId: '',
    departmentId: '',
    serviceId: '',
    unitId: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [siteSearch, setSiteSearch] = useState<string>('');
  const [genderSearch, setGenderSearch] = useState<string>('');
  const [nationalitySearch, setNationalitySearch] = useState<string>('');
  const [contractTypeSearch, setContractTypeSearch] = useState<string>('');
  const [directionSearch, setDirectionSearch] = useState<string>('');
  const [departmentSearch, setDepartmentSearch] = useState<string>('');
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [unitSearch, setUnitSearch] = useState<string>('');

  const createEmployeeMutation = useCreateEmployee();
  const employeeId = employee?.employeeId || '';
  const updateEmployeeMutation = useUpdateEmployee(employeeId);

  // Fetch all related entities
  const { data: sitesResponse } = useGetSites();
  const { data: gendersResponse } = useGetGenders();
  const { data: nationalitiesResponse } = useGetNationalities();
  const { data: contractTypesResponse } = useGetContractTypes();
  const { data: directionsResponse } = useGetAllDirections();
  const { data: departmentsResponse } = useGetAllDepartments();
  const { data: servicesResponse } = useGetAllServices();
  const { data: unitsResponse } = useGetAllUnits();

  const allSites = useMemo(() => sitesResponse?.data || [], [sitesResponse]);
  const allGenders = useMemo(() => gendersResponse?.data || [], [gendersResponse]);
  const allNationalities = useMemo(() => nationalitiesResponse?.data || [], [nationalitiesResponse]);
  const allContractTypes = useMemo(() => contractTypesResponse?.data || [], [contractTypesResponse]);
  const allDirections = useMemo(() => directionsResponse?.data || [], [directionsResponse]);
  const allDepartments = useMemo(() => departmentsResponse?.data || [], [departmentsResponse]);
  const allServices = useMemo(() => servicesResponse?.data || [], [servicesResponse]);
  const allUnits = useMemo(() => unitsResponse?.data || [], [unitsResponse]);

  // Suggestions and filtered suggestions for each autocomplete
  const siteSuggestions = useMemo(() => allSites.map((site: Site) => site.siteName), [allSites]);
  const filteredSiteSuggestions = useMemo(() => siteSuggestions.filter((sug) =>
    sug.toLowerCase().includes(siteSearch.toLowerCase())
  ), [siteSuggestions, siteSearch]);

  const genderSuggestions = useMemo(() => allGenders.map((gender: Gender) => gender.label), [allGenders]);
  const filteredGenderSuggestions = useMemo(() => genderSuggestions.filter((sug) =>
    sug.toLowerCase().includes(genderSearch.toLowerCase())
  ), [genderSuggestions, genderSearch]);

  const nationalitySuggestions = useMemo(() => allNationalities.map((nat: Nationality) => nat.name), [allNationalities]);
  const filteredNationalitySuggestions = useMemo(() => nationalitySuggestions.filter((sug) =>
    sug.toLowerCase().includes(nationalitySearch.toLowerCase())
  ), [nationalitySuggestions, nationalitySearch]);

  const contractTypeSuggestions = useMemo(() => allContractTypes.map((ct: ContractType) => ct.label), [allContractTypes]);
  const filteredContractTypeSuggestions = useMemo(() => contractTypeSuggestions.filter((sug) =>
    sug.toLowerCase().includes(contractTypeSearch.toLowerCase())
  ), [contractTypeSuggestions, contractTypeSearch]);

  const directionSuggestions = useMemo(() => allDirections.map((dir: Direction) => dir.directionName), [allDirections]);
  const filteredDirectionSuggestions = useMemo(() => directionSuggestions.filter((sug) =>
    sug.toLowerCase().includes(directionSearch.toLowerCase())
  ), [directionSuggestions, directionSearch]);

  const departmentSuggestions = useMemo(() => allDepartments.map((dept: Department) => dept.departmentName), [allDepartments]);
  const filteredDepartmentSuggestions = useMemo(() => departmentSuggestions.filter((sug) =>
    sug.toLowerCase().includes(departmentSearch.toLowerCase())
  ), [departmentSuggestions, departmentSearch]);

  const serviceSuggestions = useMemo(() => allServices.map((svc: Service) => svc.serviceName), [allServices]);
  const filteredServiceSuggestions = useMemo(() => serviceSuggestions.filter((sug) =>
    sug.toLowerCase().includes(serviceSearch.toLowerCase())
  ), [serviceSuggestions, serviceSearch]);

  const unitSuggestions = useMemo(() => allUnits.map((unit: Unit) => unit.unitName), [allUnits]);
  const filteredUnitSuggestions = useMemo(() => unitSuggestions.filter((sug) =>
    sug.toLowerCase().includes(unitSearch.toLowerCase())
  ), [unitSuggestions, unitSearch]);

  useEffect(() => {
    if (employee) {
      const emp = employee as EmployeeWithNationality;
      setFormData({
        lastName: employee.lastName,
        firstName: employee.firstName || '',
        employeeCode: employee.employeeCode || '',
        birthDate: employee.birthDate || '',
        birthPlace: employee.birthPlace || '',
        idNumber: employee.idNumber || '',
        idIssueDate: employee.idIssueDate || '',
        idIssuePlace: employee.idIssuePlace || '',
        phoneNumber: employee.phoneNumber || '',
        hireDate: employee.hireDate || '',
        jobTitle: employee.jobTitle || '',
        contractEndDate: employee.contractEndDate || '',
        siteId: employee.siteId,
        genderId: employee.genderId,
        nationalityId: emp.nationalityId || '',
        contractTypeId: employee.contractTypeId || '',
        directionId: employee.directionId,
        departmentId: employee.departmentId || '',
        serviceId: employee.serviceId || '',
        unitId: employee.unitId || ''
      });
      setSiteSearch(employee.site?.siteName || '');
      setGenderSearch(employee.gender?.label || '');
      setNationalitySearch(emp.nationality?.name || '');
      setContractTypeSearch(employee.contractType?.label || '');
      setDirectionSearch(employee.direction?.directionName || '');
      setDepartmentSearch(employee.department?.departmentName || '');
      setServiceSearch(employee.service?.serviceName || '');
      setUnitSearch(employee.unit?.unitName || '');
    } else {
      setFormData({
        lastName: '',
        firstName: '',
        employeeCode: '',
        birthDate: '',
        birthPlace: '',
        idNumber: '',
        idIssueDate: '',
        idIssuePlace: '',
        phoneNumber: '',
        hireDate: '',
        jobTitle: '',
        contractEndDate: '',
        siteId: '',
        genderId: '',
        nationalityId: '',
        contractTypeId: '',
        directionId: '',
        departmentId: '',
        serviceId: '',
        unitId: ''
      });
      setSiteSearch('');
      setGenderSearch('');
      setNationalitySearch('');
      setContractTypeSearch('');
      setDirectionSearch('');
      setDepartmentSearch('');
      setServiceSearch('');
      setUnitSearch('');
    }
    setFieldErrors({});
  }, [employee]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!employee, [employee]);
  const isProcessing = useMemo(() => 
    createEmployeeMutation.isPending || updateEmployeeMutation.isPending,
    [createEmployeeMutation.isPending, updateEmployeeMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier l\'employé' : 'Ajouter un employé',
    [isUpdateMode]
  );
  const submitText = useMemo(() => 
    isUpdateMode ? 'Modifier' : 'Ajouter',
    [isUpdateMode]
  );
  const submittingText = useMemo(() => 
    isUpdateMode ? 'Modification en cours...' : 'Création en cours...',
    [isUpdateMode]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ExtendedEmployeeFormDTO) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof ExtendedEmployeeFormDTO]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const handleSiteChange = useCallback((value: string): void => {
    setSiteSearch(value);
    const matchedSite = allSites.find((site: Site) => site.siteName === value);
    if (matchedSite) {
      setFormData((prev) => ({ ...prev, siteId: matchedSite.siteId }));
    } else {
      setFormData((prev) => ({ ...prev, siteId: '' }));
    }
    // Clear error on change
    if (fieldErrors['siteId']) {
      setFieldErrors(prev => ({ ...prev, 'siteId': [] }));
    }
  }, [allSites, fieldErrors]);

  const handleGenderChange = useCallback((value: string): void => {
    setGenderSearch(value);
    const matchedGender = allGenders.find((gender: Gender) => gender.label === value);
    if (matchedGender) {
      setFormData((prev) => ({ ...prev, genderId: matchedGender.genderId }));
    } else {
      setFormData((prev) => ({ ...prev, genderId: '' }));
    }
    // Clear error on change
    if (fieldErrors['genderId']) {
      setFieldErrors(prev => ({ ...prev, 'genderId': [] }));
    }
  }, [allGenders, fieldErrors]);

  const handleNationalityChange = useCallback((value: string): void => {
    setNationalitySearch(value);
    const matchedNationality = allNationalities.find((nat: Nationality) => nat.name === value);
    if (matchedNationality) {
      setFormData((prev) => ({ ...prev, nationalityId: matchedNationality.nationalityId }));
    } else {
      setFormData((prev) => ({ ...prev, nationalityId: '' }));
    }
    // Clear error on change
    if (fieldErrors['nationalityId']) {
      setFieldErrors(prev => ({ ...prev, 'nationalityId': [] }));
    }
  }, [allNationalities, fieldErrors]);

  const handleContractTypeChange = useCallback((value: string): void => {
    setContractTypeSearch(value);
    const matchedCT = allContractTypes.find((ct: ContractType) => ct.label === value);
    if (matchedCT) {
      setFormData((prev) => ({ ...prev, contractTypeId: matchedCT.contractTypeId }));
    } else {
      setFormData((prev) => ({ ...prev, contractTypeId: '' }));
    }
    // Clear error on change
    if (fieldErrors['contractTypeId']) {
      setFieldErrors(prev => ({ ...prev, 'contractTypeId': [] }));
    }
  }, [allContractTypes, fieldErrors]);

  const handleDirectionChange = useCallback((value: string): void => {
    setDirectionSearch(value);
    const matchedDir = allDirections.find((dir: Direction) => dir.directionName === value);
    if (matchedDir) {
      setFormData((prev) => ({ ...prev, directionId: matchedDir.directionId }));
    } else {
      setFormData((prev) => ({ ...prev, directionId: '' }));
    }
    // Clear error on change
    if (fieldErrors['directionId']) {
      setFieldErrors(prev => ({ ...prev, 'directionId': [] }));
    }
  }, [allDirections, fieldErrors]);

  const handleDepartmentChange = useCallback((value: string): void => {
    setDepartmentSearch(value);
    const matchedDept = allDepartments.find((dept: Department) => dept.departmentName === value);
    if (matchedDept) {
      setFormData((prev) => ({ ...prev, departmentId: matchedDept.departmentId }));
    } else {
      setFormData((prev) => ({ ...prev, departmentId: '' }));
    }
    // Clear error on change
    if (fieldErrors['departmentId']) {
      setFieldErrors(prev => ({ ...prev, 'departmentId': [] }));
    }
  }, [allDepartments, fieldErrors]);

  const handleServiceChange = useCallback((value: string): void => {
    setServiceSearch(value);
    const matchedSvc = allServices.find((svc: Service) => svc.serviceName === value);
    if (matchedSvc) {
      setFormData((prev) => ({ ...prev, serviceId: matchedSvc.serviceId }));
    } else {
      setFormData((prev) => ({ ...prev, serviceId: '' }));
    }
    // Clear error on change
    if (fieldErrors['serviceId']) {
      setFieldErrors(prev => ({ ...prev, 'serviceId': [] }));
    }
  }, [allServices, fieldErrors]);

  const handleUnitChange = useCallback((value: string): void => {
    setUnitSearch(value);
    const matchedUnit = allUnits.find((unit: Unit) => unit.unitName === value);
    if (matchedUnit) {
      setFormData((prev) => ({ ...prev, unitId: matchedUnit.unitId }));
    } else {
      setFormData((prev) => ({ ...prev, unitId: '' }));
    }
    // Clear error on change
    if (fieldErrors['unitId']) {
      setFieldErrors(prev => ({ ...prev, 'unitId': [] }));
    }
  }, [allUnits, fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.lastName.trim()) {
      newErrors.lastName = ['Nom de famille est requis'];
    }
    if (!formData.siteId) {
      newErrors.siteId = ['Site est requis'];
    }
    if (!formData.genderId) {
      newErrors.genderId = ['Genre est requis'];
    }
    if (!formData.directionId) {
      newErrors.directionId = ['Direction est requise'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (employee) {
      updateEmployeeMutation.mutate(formData as EmployeeFormDTO, {
        onSuccess: () => {
          onFormSuccess('Employé modifié avec succès.');
        },
      });
    } else {
      createEmployeeMutation.mutate(formData as EmployeeFormDTO, {
        onSuccess: () => {
          onFormSuccess('Employé créé avec succès.');
        },
      });
    }
  }, [employee, formData, updateEmployeeMutation, createEmployeeMutation, onFormSuccess, validateForm]);

  const handleCancel = useCallback(() => {
    setFieldErrors({});
    onClose();
  }, [onClose]);

  // Ne pas afficher le popup si non ouvert
  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>{popupTitle}</PopupTitle>
          <PopupClose
            onClick={handleCancel}
            disabled={isProcessing}
            aria-label="Fermer le formulaire"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          <FormContainer>
            <GenericForm id="employeeForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations Personnelles</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Nom de famille</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                        className={fieldErrors.lastName && fieldErrors.lastName.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.lastName && fieldErrors.lastName.length > 0 && (
                        <ErrorMessage>{fieldErrors.lastName.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Prénom</FormLabel>
                      <FormInput
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Date de naissance</FormLabel>
                      <FormInput
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Lieu de naissance</FormLabel>
                      <FormInput
                        type="text"
                        name="birthPlace"
                        value={formData.birthPlace}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Numéro CIN</FormLabel>
                      <FormInput
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Date CIN</FormLabel>
                      <FormInput
                        type="date"
                        name="idIssueDate"
                        value={formData.idIssueDate}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Lieu CIN</FormLabel>
                      <FormInput
                        type="text"
                        name="idIssuePlace"
                        value={formData.idIssuePlace}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Nationalité</FormLabel>
                      <StyledAutoCompleteInput
                        value={nationalitySearch}
                        onChange={handleNationalityChange}
                        suggestions={filteredNationalitySuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner une nationalité..."
                        disabled={isProcessing}
                        fieldType="nationality"
                        fieldLabel="nationality"
                        showAddOption={false}
                      />
                    </FormFieldCell>
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Code employé</FormLabel>
                      <FormInput
                        type="text"
                        name="employeeCode"
                        value={formData.employeeCode}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Téléphone</FormLabel>
                      <FormInput
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Site</FormLabelRequired>
                      <StyledAutoCompleteInput
                        value={siteSearch}
                        onChange={handleSiteChange}
                        suggestions={filteredSiteSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un site..."
                        disabled={isProcessing}
                        fieldType="site"
                        fieldLabel="site"
                        showAddOption={false}
                      />
                      {fieldErrors.siteId && fieldErrors.siteId.length > 0 && (
                        <ErrorMessage>{fieldErrors.siteId.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabelRequired>Genre</FormLabelRequired>
                      <StyledAutoCompleteInput
                        value={genderSearch}
                        onChange={handleGenderChange}
                        suggestions={filteredGenderSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un genre..."
                        disabled={isProcessing}
                        fieldType="gender"
                        fieldLabel="gender"
                        showAddOption={false}
                      />
                      {fieldErrors.genderId && fieldErrors.genderId.length > 0 && (
                        <ErrorMessage>{fieldErrors.genderId.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                  </FormRow>
                </tbody>
              </FormTable>

              <FormSectionTitle>Informations Contractuelles</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Date d'embauche</FormLabel>
                      <FormInput
                        type="date"
                        name="hireDate"
                        value={formData.hireDate}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Poste</FormLabel>
                      <FormInput
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Date fin contrat</FormLabel>
                      <FormInput
                        type="date"
                        name="contractEndDate"
                        value={formData.contractEndDate}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Type de contrat</FormLabel>
                      <StyledAutoCompleteInput
                        value={contractTypeSearch}
                        onChange={handleContractTypeChange}
                        suggestions={filteredContractTypeSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un type de contrat..."
                        disabled={isProcessing}
                        fieldType="contractType"
                        fieldLabel="contractType"
                        showAddOption={false}
                      />
                    </FormFieldCell>
                  </FormRow>
                </tbody>
              </FormTable>

              <FormSectionTitle>Organisation</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Direction</FormLabelRequired>
                      <StyledAutoCompleteInput
                        value={directionSearch}
                        onChange={handleDirectionChange}
                        suggestions={filteredDirectionSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner une direction..."
                        disabled={isProcessing}
                        fieldType="direction"
                        fieldLabel="direction"
                        showAddOption={false}
                      />
                      {fieldErrors.directionId && fieldErrors.directionId.length > 0 && (
                        <ErrorMessage>{fieldErrors.directionId.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Département</FormLabel>
                      <StyledAutoCompleteInput
                        value={departmentSearch}
                        onChange={handleDepartmentChange}
                        suggestions={filteredDepartmentSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un département..."
                        disabled={isProcessing}
                        fieldType="department"
                        fieldLabel="department"
                        showAddOption={false}
                      />
                    </FormFieldCell>
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Service</FormLabel>
                      <StyledAutoCompleteInput
                        value={serviceSearch}
                        onChange={handleServiceChange}
                        suggestions={filteredServiceSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un service..."
                        disabled={isProcessing}
                        fieldType="service"
                        fieldLabel="service"
                        showAddOption={false}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Unité</FormLabel>
                      <StyledAutoCompleteInput
                        value={unitSearch}
                        onChange={handleUnitChange}
                        suggestions={filteredUnitSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner une unité..."
                        disabled={isProcessing}
                        fieldType="unit"
                        fieldLabel="unit"
                        showAddOption={false}
                      />
                    </FormFieldCell>
                  </FormRow>
                </tbody>
              </FormTable>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <ButtonPrimary
                  type="button"
                  onClick={handleCancel}
                  disabled={isProcessing}
                  style={{
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  type="submit"
                  disabled={isProcessing}
                  title={isProcessing ? submittingText : submitText}
                  aria-label={isProcessing ? submittingText : submitText}
                  style={{
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <Save size={16} aria-hidden="true" />
                  <span>{isProcessing ? submittingText : submitText}</span>
                </ButtonPrimary>
              </div>
            </GenericForm>
          </FormContainer>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default EmployeeForm;