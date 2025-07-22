  import "styles/generic-form-styles.css";
  import { useState, useEffect } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  import { BASE_URL } from "config/apiConfig";
  import Alert from "components/alert";
  import * as FaIcons from "react-icons/fa";

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

    // Parse URL query parameters de manière sécurisée
    useEffect(() => {
      const searchParams = new URLSearchParams(location.search);
      const initialValue = searchParams.get("initialValue") || "";
      const url = searchParams.get("returnUrl") || "";
      const type = searchParams.get("fieldType") || "";
      
      setFormData((prev) => ({ ...prev, missionTitle: initialValue }));
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
        const response = await fetch(`${BASE_URL}/api/Mission`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            missionTitle: formData.missionTitle,
            description: formData.description,
            location: formData.location,
            startDate: formData.startDate,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          showAlert("success", "Mission créée avec succès !");
          
          if (returnUrl && fieldType) {
            // Si on vient d'un AutoCompleteInput, retourner avec la nouvelle valeur
            setTimeout(() => {
              const returnParams = new URLSearchParams();
              returnParams.set("newValue", formData.missionTitle);
              returnParams.set("fieldType", fieldType);
              
              const [basePath, existingParams] = returnUrl.split('?');
              const finalParams = new URLSearchParams(existingParams || '');
              
              returnParams.forEach((value, key) => {
                finalParams.set(key, value);
              });
              
              const finalUrl = `${basePath}?${finalParams.toString()}`;
              navigate(finalUrl);
            }, 1500);
          } else {
            // Sinon, réinitialiser le formulaire
            event.target.reset();
            setFormData({ missionTitle: "", description: "", location: "", startDate: "" });
          }
        } else {
          const errorData = await response.json();
          const message = errorData.message || `Erreur ${response.status}: Échec de la création de la mission.`;
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
                    <label className="form-label form-label-required">Intitulé de la Mission</label>
                  </th>
                  <td className="form-input-cell">
                    <input
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
                    <label className="form-label">Description</label>
                  </th>
                  <td className="form-input-cell">
                    <textarea
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
                    <label className="form-label">Lieu</label>
                  </th>
                  <td className="form-input-cell">
                    <input
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
                    <label className="form-label form-label-required">Date de début</label>
                  </th>
                  <td className="form-input-cell">
                    <input
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