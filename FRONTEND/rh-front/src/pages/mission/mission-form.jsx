import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "config/apiConfig";
import Alert from "components/alert";
import * as FaIcons from "react-icons/fa";
import { formatDate } from "utils/generalisation";
import AutoCompleteInput from "components/auto-complete-input";

export default function MissionForm() {
  const [formData, setFormData] = useState({
    missionTitle: "",
    description: "",
    location: "",
    startDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [regions, setRegions] = useState([]); // State to store region suggestions
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch regions from public/data/madagascar_regions.json
  useEffect(() => {
    fetch("/data/madagascar_regions.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch regions data");
        }
        return response.json();
      })
      .then((data) => setRegions(data.regions))
      .catch((error) => {
        console.error("Error fetching regions:", error);
        setAlert({
          isOpen: true,
          type: "error",
          message: "Erreur lors du chargement des régions. Veuillez réessayer.",
        });
      });
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialValue = searchParams.get("initialValue") || "";
    const url = searchParams.get("returnUrl") || "";
    const type = searchParams.get("fieldType") || "";
    const startDate = searchParams.get("startDate") || "";

    setFormData((prev) => ({
      ...prev,
      missionTitle: initialValue,
      startDate: startDate,
    }));
    setReturnUrl(url);
    setFieldType(type);
  }, [location.search]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  // Handle adding a new region suggestion
  const handleAddNewSuggestion = (field, value) => {
    setRegions((prev) => [...prev, value]);
    setFormData((prev) => ({ ...prev, location: value }));
    showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate location
    if (formData.location && !regions.includes(formData.location)) {
      showAlert("error", "Veuillez sélectionner un lieu valide parmi les régions de Madagascar.");
      setIsSubmitting(false);
      return;
    }

    try {
      const isoStartDate = formData.startDate
        ? new Date(formData.startDate).toISOString()
        : "";

      const response = await fetch(`${BASE_URL}/api/Mission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
        body: JSON.stringify({
          missionId: "",
          name: formData.missionTitle,
          description: formData.description,
          startDate: isoStartDate,
          site: formData.location,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert("success", "Mission créée avec succès !");

        setTimeout(() => {
          if (returnUrl && fieldType) {
            const returnParams = new URLSearchParams();
            returnParams.set("newValue", formData.missionTitle);
            returnParams.set("fieldType", fieldType);

            const [basePath, existingParams] = returnUrl.split("?");
            const finalParams = new URLSearchParams(existingParams || "");

            returnParams.forEach((value, key) => {
              finalParams.set(key, value);
            });

            const finalUrl = `${basePath}?${finalParams.toString()}`;
            navigate(finalUrl);
          } else {
            navigate("/mission/list");
          }
        }, 1500);
      } else {
        let message = `Erreur ${response.status}: Échec de la création de la mission.`;
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {
          // Handle non-JSON responses
        }
        showAlert("error", message);
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ missionTitle: "", description: "", location: "", startDate: "" });
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
        <h2 className="table-title">Création d'une Mission</h2>
      </div>

      <form id="missionForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="missionTitle" className="form-label form-label-required">
                    Intitulé de la Mission
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="missionTitle"
                    type="text"
                    value={formData.missionTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, missionTitle: e.target.value }))}
                    placeholder="Saisir le titre de la mission..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                </th>
                <td className="form-input-cell">
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Saisir une description..."
                    className="form-input"
                    rows="4"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="location" className="form-label">
                    Lieu
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.location}
                    onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                    suggestions={regions}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un lieu..."
                    disabled={isSubmitting}
                    onAddNew={(value) => handleAddNewSuggestion("location", value)}
                    showAddOption={false}
                    fieldType="location"
                    fieldLabel="lieu"
                    addNewRoute="/mission/region-form" // Adjust this route as needed
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="startDate" className="form-label form-label-required">
                    Date de début
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="form-input"
                    required
                    disabled={isSubmitting}
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
            title="Enregistrer la mission"
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