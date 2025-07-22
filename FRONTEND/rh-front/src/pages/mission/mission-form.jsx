import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "config/apiConfig";
import Alert from "components/alert";
import * as FaIcons from "react-icons/fa";
import { formatDate } from "utils/generalisation";

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
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

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
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Saisir le lieu de la mission..."
                    className="form-input"
                    disabled={isSubmitting}
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