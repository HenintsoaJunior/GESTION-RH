import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "config/apiConfig";
import Alert from "components/alert";
import * as FaIcons from "react-icons/fa";

export default function TransportForm() {
  const [formData, setFormData] = useState({
    type: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const [fieldType, setFieldType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialValue = searchParams.get("initialValue") || "";
    const url = searchParams.get("returnUrl") || "";
    const type = searchParams.get("fieldType") || "";
    
    setFormData((prev) => ({ ...prev, type: initialValue }));
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
      const response = await fetch(`${BASE_URL}/api/Transport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "text/plain"
        },
        body: JSON.stringify({
          type: formData.type
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert("success", "Transport créé avec succès !");
        
        if (returnUrl && fieldType) {
          // Handle return to AutoCompleteInput
          setTimeout(() => {
            const returnParams = new URLSearchParams();
            returnParams.set("newValue", formData.type);
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
          // Reset form
          event.target.reset();
          setFormData({ type: "" });
        }
      } else {
        const errorData = await response.json();
        const message = errorData.message || `Erreur ${response.status}: Échec de la création du transport.`;
        showAlert("error", message);
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ type: "" });
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
        <h2 className="table-title">Création d'un Transport</h2>
      </div>

      <form id="transportForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Type de Transport</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    placeholder="Ex: Bateau, Bus, Train..."
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
            title="Enregistrer le transport"
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