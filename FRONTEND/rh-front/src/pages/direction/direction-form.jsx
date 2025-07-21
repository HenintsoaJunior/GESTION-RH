import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "config/apiConfig";
import Alert from "components/alert";
import * as FaIcons from "react-icons/fa";

export default function DirectionForm() {
  const [formData, setFormData] = useState({
    directionName: "",
    acronym: "",
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
    
    setFormData((prev) => ({ ...prev, directionName: initialValue }));
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
      const response = await fetch(`${BASE_URL}/api/Direction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directionName: formData.directionName,
          acronym: formData.acronym,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert("success", "Direction créée avec succès !");
        
        if (returnUrl && fieldType) {
          // Si on vient d'un AutoCompleteInput, retourner avec la nouvelle valeur
          setTimeout(() => {
            // Construire l'URL de retour de manière sécurisée
            const returnParams = new URLSearchParams();
            returnParams.set("newValue", formData.directionName);
            returnParams.set("fieldType", fieldType);
            
            // Séparer l'URL de base des paramètres existants
            const [basePath, existingParams] = returnUrl.split('?');
            const finalParams = new URLSearchParams(existingParams || '');
            
            // Ajouter les nouveaux paramètres
            returnParams.forEach((value, key) => {
              finalParams.set(key, value);
            });
            
            const finalUrl = `${basePath}?${finalParams.toString()}`;
            navigate(finalUrl);
          }, 1500);
        } else {
          // Sinon, réinitialiser le formulaire
          event.target.reset();
          setFormData({ directionName: "", acronym: "" });
        }
      } else {
        const errorData = await response.json();
        const message = errorData.message || `Erreur ${response.status}: Échec de la création de la direction.`;
        showAlert("error", message);
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ directionName: "", acronym: "" });
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
        <h2 className="table-title">Création d'une Direction</h2>
      </div>

      <form id="directionForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Nom de la Direction</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    value={formData.directionName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, directionName: e.target.value }))}
                    placeholder="Saisir ou sélectionner..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label">Acronyme</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    value={formData.acronym}
                    onChange={(e) => setFormData((prev) => ({ ...prev, acronym: e.target.value }))}
                    placeholder="Ex: DG, DT..."
                    className="form-input"
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
            title="Enregistrer la direction"
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