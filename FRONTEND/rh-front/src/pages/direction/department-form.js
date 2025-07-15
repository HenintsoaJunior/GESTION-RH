import "../../styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../config/apiConfig";
import Alert from "../../components/Alert";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "../../components/AutoCompleteInput";

export default function DepartmentForm() {
  const [formData, setFormData] = useState({
    department_name: "",
    direction: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const [suggestions, setSuggestions] = useState({
    direction: ["Direction Générale", "Direction Technique", "Direction Administrative", "Direction Commerciale"],
  });

  // Parse URL query parameters to set initial value for department_name
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialValue = params.get("initialValue") || "";
    const url = params.get("returnUrl") || "";
    setFormData((prev) => ({ ...prev, department_name: initialValue }));
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
      const response = await fetch(`${BASE_URL}/api/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department_id: crypto.randomUUID(),
          department_name: formData.department_name,
          direction_id: formData.direction, // Using direction as the value for direction_id
          created_at: new Date().toISOString(),
          updated_at: null,
        }),
      });

      if (response.ok) {
        await response.json();
        showAlert("success", "Département créé avec succès !");
        event.target.reset();
        setFormData({ department_name: "", direction: "" });
        // Redirect to returnUrl if provided
        if (returnUrl) {
          window.location.href = returnUrl;
        }
      } else {
        const errorData = await response.json();
        showAlert("error", errorData.message || "Erreur lors de la création du département.");
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ department_name: "", direction: "" });
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
        <h2 className="table-title">Création d'un Département</h2>
      </div>

      <form id="departmentForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Nom du Département</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    value={formData.department_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department_name: e.target.value }))}
                    placeholder="Saisir ou sélectionner..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Direction</label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.direction}
                    onChange={(value) => setFormData((prev) => ({ ...prev, direction: value }))}
                    suggestions={suggestions.direction}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner..."
                    disabled={isSubmitting}
                    onAddNew={(value) => handleAddNewSuggestion("direction", value)}
                    fieldType="direction"
                    fieldLabel="direction"
                    addNewRoute="/direction/direction-form"
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
            title="Enregistrer le département"
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