import "../../styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../config/apiConfig";
import Alert from "../../components/Alert";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "../../components/AutoCompleteInput";

export default function ServiceForm() {
  const [formData, setFormData] = useState({
    serviceName: "",
    departmentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [departmentMap, setDepartmentMap] = useState({}); // Maps departmentName to departmentId

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/Department`, {
          method: "GET",
          headers: {
            "Accept": "text/plain",
          },
        });
        if (response.ok) {
          const data = await response.json();
          const departmentNames = data.map((dept) => dept.departmentName);
          const map = data.reduce((acc, dept) => ({
            ...acc,
            [dept.departmentName]: dept.departmentId,
          }), {});
          setSuggestions(departmentNames);
          setDepartmentMap(map);
        } else {
          showAlert("error", `Erreur ${response.status}: Erreur lors du chargement des départements.`);
        }
      } catch (error) {
        showAlert("error", "Erreur de connexion lors du chargement des départements.");
      }
    };
    fetchDepartments();
  }, []);

  // Parse URL query parameters to set initial value for serviceName
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialValue = params.get("initialValue") || "";
    const url = params.get("returnUrl") || "";
    setFormData((prev) => ({ ...prev, serviceName: initialValue }));
    setReturnUrl(url);
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/Service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceName: formData.serviceName,
          departmentId: formData.departmentId,
        }),
      });

      if (response.ok) {
        await response.json();
        showAlert("success", "Service créé avec succès !");
        event.target.reset();
        setFormData({ serviceName: "", departmentId: "" });
        // if (returnUrl) {
        //   window.location.href = returnUrl;
        // }
      } else {
        const errorData = await response.json();
        const message = errorData.message || `Erreur ${response.status}: Échec de la création du service.`;
        showAlert("error", message);
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ serviceName: "", departmentId: "" });
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
                    value={formData.serviceName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, serviceName: e.target.value }))}
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
                    value={Object.keys(departmentMap).find((name) => departmentMap[name] === formData.departmentId) || ""}
                    onChange={(value) => {
                      const departmentId = departmentMap[value] || "";
                      setFormData((prev) => ({ ...prev, departmentId }));
                    }}
                    suggestions={suggestions}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner..."
                    disabled={isSubmitting}
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