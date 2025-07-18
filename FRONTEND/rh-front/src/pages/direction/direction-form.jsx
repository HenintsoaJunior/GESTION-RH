import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
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
  const [setReturnUrl] = useState("");

  // Parse URL query parameters to set initial value for directionName
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialValue = params.get("initialValue") || "";
    const url = params.get("returnUrl") || "";
    setFormData((prev) => ({ ...prev, directionName: initialValue }));
    setReturnUrl(url);
  }, [setReturnUrl]);

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
        await response.json();
        showAlert("success", "Direction créée avec succès !");
        event.target.reset();
        setFormData({ directionName: "", acronym: "" });
        // if (returnUrl) {
        //   window.location.href = returnUrl;
        // }
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