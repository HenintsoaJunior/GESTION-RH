import "styles/generic-form-styles.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "components/auto-complete-input";

export default function GenericForm({
  title,
  fields,
  fieldsPerRow = 2,
  onSubmit,
  submitButtonText = "Enregistrer",
  resetButtonText = "Réinitialiser",
  navigateOnSuccess,
  initialData = {},
  customValidation,
  loadingStates = {},
  autoCompleteConfig = {},
  dependentFields = {},
  computedFields = [],
  urlParamsConfig = {},
}) {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [autoCompleteData, setAutoCompleteData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Gérer les paramètres d'URL
  useEffect(() => {
    if (urlParamsConfig.parseParams) {
      const searchParams = new URLSearchParams(location.search);
      const parsedData = urlParamsConfig.parseParams(searchParams, formData);
      setFormData((prev) => ({ ...prev, ...parsedData.formData }));
      urlParamsConfig.onParamsParsed?.(parsedData);
    }
  }, [location.search, urlParamsConfig]);

  // Initialiser les données des champs autocomplétés
  useEffect(() => {
    Object.keys(autoCompleteConfig).forEach((fieldName) => {
      const config = autoCompleteConfig[fieldName];
      if (config.fetchFunction) {
        config.fetchFunction(
          (data) => {
            const fieldData = {
              rawData: data,
              suggestions: config.mapToSuggestions ? config.mapToSuggestions(data) : data,
              displayNames: config.mapToDisplayNames ? config.mapToDisplayNames(data) : data,
            };

            setAutoCompleteData((prev) => ({
              ...prev,
              [fieldName]: fieldData,
            }));

            if (config.onDataUpdate) {
              config.onDataUpdate(fieldData, formData, setFormData);
            }
          },
          config.setLoading || (() => {}),
          (alert) => setAlert(alert),
          (error) => setModal({ isOpen: true, type: "error", message: error.message })
        );
      }
    });
  }, [autoCompleteConfig, formData]);

  // Gérer les champs dépendants
  useEffect(() => {
    Object.keys(dependentFields).forEach((fieldName) => {
      const config = dependentFields[fieldName];
      if (config.dependsOn && formData[config.dependsOn]) {
        const sourceData = autoCompleteData[config.dependsOn]?.rawData;
        if (sourceData) {
          const selectedItem = sourceData.find((item) =>
            config.matchCondition(item, formData[config.dependsOn])
          );
          if (selectedItem) {
            const updatedFields = config.updateFields(selectedItem, formData);
            setFormData((prev) => ({ ...prev, ...updatedFields }));
          } else {
            const resetFields = config.resetFields ? config.resetFields(formData) : {};
            setFormData((prev) => ({ ...prev, ...resetFields }));
          }
        }
      }
    });
  }, [formData, autoCompleteData, dependentFields]);

  // Gérer les champs calculés
  useEffect(() => {
    computedFields.forEach((computeConfig) => {
      if (computeConfig.dependencies.every((dep) => formData[dep])) {
        const computedValues = computeConfig.compute(formData, autoCompleteData);
        setFormData((prev) => ({ ...prev, ...computedValues }));
        if (computeConfig.validate) {
          const validationErrors = computeConfig.validate(formData, computedValues);
          setFieldErrors((prev) => ({ ...prev, ...validationErrors }));
        }
      } else {
        const resetFields = computeConfig.resetFields ? computeConfig.resetFields(formData) : {};
        setFormData((prev) => ({ ...prev, ...resetFields }));
      }
    });
  }, [formData, computedFields, autoCompleteData]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (fieldName, value) => {
    const config = autoCompleteConfig[fieldName];
    if (config?.onAddNew) {
      config.onAddNew(value, fieldName, setFormData);
    }

    setAutoCompleteData((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        rawData: [...(prev[fieldName]?.rawData || []), { [config.valueKey || "nom"]: value }],
        suggestions: [...(prev[fieldName]?.suggestions || []), value],
        displayNames: [...(prev[fieldName]?.displayNames || []), value],
      },
    }));

    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    showAlert("success", `"${value}" ajouté aux suggestions`);
    setFieldErrors((prev) => ({ ...prev, [config.errorKey || fieldName]: undefined }));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    if (type === "date") {
      processedValue = value === "" ? null : value;
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    const field = fields.find((f) => f.name === name);
    const errorKey = field?.errorKey || name;
    setFieldErrors((prev) => ({ ...prev, [errorKey]: undefined }));
  };

  const handleAutoCompleteChange = (fieldName, value) => {
    const config = autoCompleteConfig[fieldName];
    let realValue = value;

    if (config?.extractValue) {
      realValue = config.extractValue(value, formData, autoCompleteData);
    }

    setFormData((prev) => ({ ...prev, [fieldName]: realValue }));
    setFieldErrors((prev) => ({ ...prev, [config?.errorKey || fieldName]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    if (customValidation) {
      const validationResult = customValidation(formData, autoCompleteData);
      if (!validationResult.isValid) {
        setModal({
          isOpen: true,
          type: "error",
          message: validationResult.message,
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const submitData = { ...formData };
      if (urlParamsConfig.transformSubmitData) {
        urlParamsConfig.transformSubmitData(submitData, location.search);
      }

      await onSubmit(
        submitData,
        (loading) => setIsSubmitting(loading),
        (alert) => setAlert(alert),
        (error) => {
          setModal(error);
          setFieldErrors(error.fieldErrors || {});
        },
        autoCompleteData
      );

      if (navigateOnSuccess) {
        if (typeof navigateOnSuccess === "function") {
          const navUrl = navigateOnSuccess(formData, location.search);
          navigate(navUrl);
        } else {
          navigate(navigateOnSuccess);
        }
      }
    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setFieldErrors({});
    showAlert("info", "Formulaire réinitialisé.");
  };

  const renderField = (field) => {
    const isLoading = Object.values(loadingStates).some((state) => state);
    const errorKey = field.errorKey || field.name;
    const hasError = fieldErrors[errorKey];

    switch (field.type) {
      case "text":
      case "date":
      case "email":
      case "number":
      case "time":
        return (
          <input
            id={field.name}
            type={field.type}
            name={field.name}
            value={field.type === "date" || field.type === "time" ? formData[field.name] || "" : formData[field.name] || ""}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            className={`form-input ${hasError ? "input-error" : ""}`}
            disabled={isSubmitting || isLoading || field.disabled || field.readOnly}
            required={field.required}
            readOnly={field.readOnly}
            min={field.min}
          />
        );

      case "textarea":
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            className={`form-input ${hasError ? "input-error" : ""}`}
            rows={field.rows || 4}
            disabled={isSubmitting || isLoading || field.disabled}
            required={field.required}
            readOnly={field.readOnly}
          />
        );

      case "autocomplete":
        const autoCompleteFieldData = autoCompleteData[field.name];
        return (
          <AutoCompleteInput
            value={formData[field.name] || ""}
            onChange={(value) => handleAutoCompleteChange(field.name, value)}
            suggestions={autoCompleteFieldData?.displayNames || []}
            maxVisibleItems={field.maxVisibleItems || 3}
            placeholder={field.placeholder}
            disabled={isSubmitting || isLoading || field.disabled}
            onAddNew={field.allowAddNew ? (value) => handleAddNewSuggestion(field.name, value) : undefined}
            showAddOption={field.allowAddNew}
            fieldType={field.name}
            fieldLabel={field.label?.toLowerCase()}
            addNewRoute={field.addNewRoute}
            className={`form-input ${hasError ? "input-error" : ""}`}
          />
        );

      case "select":
        return (
          <select
            id={field.name}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleInputChange}
            className={`form-input ${hasError ? "input-error" : ""}`}
            disabled={isSubmitting || isLoading || field.disabled}
            required={field.required}
          >
            <option value="">{field.placeholder || "Sélectionner..."}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "custom":
        return field.render ? field.render() : null; // Render custom content using the provided render function

      default:
        return null;
    }
  };

  // Group fields into rows based on fieldsPerRow
  const groupedFields = [];
  for (let i = 0; i < fields.length; i += fieldsPerRow) {
    groupedFields.push(fields.slice(i, i + fieldsPerRow));
  }

  return (
    <div className="form-container">
      <Modal
        type={modal.type}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      <div className="table-header">
        <h2 className="table-title">{title}</h2>
      </div>

      <form className="generic-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              {groupedFields.map((rowFields, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {rowFields.map((field, fieldIndex) => (
                    <tr key={`${rowIndex}-${field.name}`}>
                      <td className="form-label-cell" colSpan={fieldsPerRow}>
                        <label
                          htmlFor={field.name}
                          className={`form-label ${field.required ? "form-label-required" : ""}`}
                        >
                          {field.label}
                        </label>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    {rowFields.map((field) => (
                      <td key={field.name} className="form-input-cell">
                        {renderField(field)}
                        {fieldErrors[field.errorKey || field.name] && field.type !== "custom" && (
                          <span className="error-message">
                            {fieldErrors[field.errorKey || field.name].join(", ")}
                          </span>
                        )}
                      </td>
                    ))}
                    {rowFields.length < fieldsPerRow &&
                      Array(fieldsPerRow - rowFields.length)
                        .fill()
                        .map((_, index) => (
                          <td key={`empty-${rowIndex}-${index}`} className="form-input-cell"></td>
                        ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || Object.values(loadingStates).some((state) => state)}
            title={`${submitButtonText.toLowerCase()}`}
          >
            {isSubmitting ? "Envoi en cours..." : submitButtonText}
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting || Object.values(loadingStates).some((state) => state)}
            title="Réinitialiser le formulaire"
          >
            <FaIcons.FaTrash className="w-4 h-4" />
            {resetButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}