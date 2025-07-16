import "../../styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../config/apiConfig";
import Alert from "../../components/Alert";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "../../components/AutoCompleteInput";

export default function DepartmentForm() {
  const [formData, setFormData] = useState({
    departmentName: "",
    directionId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [directionMap, setDirectionMap] = useState({}); // Maps directionName to directionId

  // Fetch directions from API
  useEffect(() => {
    const fetchDirections = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/Direction`, {
          method: "GET",
          headers: {
            "Accept": "text/plain",
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Set suggestions as array of directionName
          const directionNames = data.map((dir) => dir.directionName);
          // Create mapping of directionName to directionId
          const map = data.reduce((acc, dir) => ({
            ...acc,
            [dir.directionName]: dir.directionId,
          }), {});
          setSuggestions(directionNames);
          setDirectionMap(map);
        } else {
          showAlert("error", "Erreur lors du chargement des directions.");
        }
      } catch (error) {
        showAlert("error", "Erreur de connexion lors du chargement des directions.");
      }
    };
    fetchDirections();
  }, []);

  // Parse URL query parameters to set initial value for departmentName
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialValue = params.get("initialValue") || "";
    const url = params.get("returnUrl") || "";
    setFormData((prev) => ({ ...prev, departmentName: initialValue }));
    setReturnUrl(url);
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    // Note: Temporary directionId until integrated with POST /api/Direction
    const tempId = `DR_${Math.random().toString(36).substr(2, 9)}`;
    setSuggestions((prev) => [...prev, value]);
    setDirectionMap((prev) => ({ ...prev, [value]: tempId }));
    setFormData((prev) => ({ ...prev, directionId: tempId }));
    showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/Department`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departmentName: formData.departmentName,
          directionId: formData.directionId,
        }),
      });

      if (response.ok) {
        await response.json();
        showAlert("success", "Département créé avec succès !");
        event.target.reset();
        setFormData({ departmentName: "", directionId: "" });
        if (returnUrl) {
          window.location.href = returnUrl;
        }
      } else {
        const errorData = await response.json();
        const message = errorData.message || `Erreur ${response.status}: Échec de la création du département.`;
        showAlert("error", message);
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ departmentName: "", directionId: "" });
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
                    value={formData.departmentName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, departmentName: e.target.value }))}
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
                    value={Object.keys(directionMap).find((name) => directionMap[name] === formData.directionId) || ""}
                    onChange={(value) => {
                      const directionId = directionMap[value] || "";
                      setFormData((prev) => ({ ...prev, directionId }));
                    }}
                    suggestions={suggestions}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner..."
                    disabled={isSubmitting}
                    onAddNew={(value) => handleAddNewSuggestion("directionId", value)}
                    fieldType="directionId"
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