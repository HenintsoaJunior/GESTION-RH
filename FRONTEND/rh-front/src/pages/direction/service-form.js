import "../../styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../config/apiConfig";
import Alert from "../../components/Alert";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "../../components/AutoCompleteInput";

export default function ServiceForm() {
  const [formData, setFormData] = useState({
    service_name: "",
    department: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const [suggestions, setSuggestions] = useState({
    department: ["Département IT", "Département RH", "Département Finance", "Département Marketing"],
  });

  // Parse URL query parameters to set initial value for service_name
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialValue = params.get("initialValue") || "";
    const url = params.get("returnUrl") || "";
    setFormData((prev) => ({ ...prev, service_name: initialValue }));
    setReturnUrl(url);
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
    showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: crypto.randomUUID(),
          service_name: formData.service_name,
          department_id: formData.department, // Using department as the value for department_id
          created_at: new Date().toISOString(),
          updated_at: null,
        }),
      });

      if (response.ok) {
        await response.json();
        showAlert("success", "Service créé avec succès !");
        event.target.reset();
        setFormData({ service_name: "", department: "" });
        // Redirect to returnUrl if provided
        if (returnUrl) {
          window.location.href = returnUrl;
        }
      } else {
        const errorData = await response.json();
        showAlert("error", errorData.message || "Erreur lors de la création du service.");
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ service_name: "", department: "" });
    showAlert("info", "Formulaire réinitialisé.");
  };

  return (
    <div className="form-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <div className="table-header">
        <h2 className="table-title">Création d'un Service</h2>
      </div>

      <form id="serviceForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Nom du Service</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    value={formData.service_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, service_name: e.target.value }))}
                    placeholder="Saisir ou sélectionner..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Département</label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.department}
                    onChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                    suggestions={suggestions.department}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner..."
                    disabled={isSubmitting}
                    onAddNew={(value) => handleAddNewSuggestion("department", value)}
                    fieldType="department"
                    fieldLabel="département"
                    addNewRoute="/direction/department-form"
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
            title="Enregistrer le service"
          >
            {isSubmitting ? "Envoi en cours..." : "Enregistrer"}
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting}
            title="Réinitialiser le formulaire"
          >
            <FaIcons.FaTrash className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}