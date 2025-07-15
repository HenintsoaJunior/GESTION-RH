import "../../styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../config/apiConfig";
import Alert from "../../components/Alert";
import * as FaIcons from "react-icons/fa";

export default function DirectionForm() {
  const [formData, setFormData] = useState({
    direction_name: "",
    acronym: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");

  // Parse URL query parameters to set initial value for direction_name
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialValue = params.get("initialValue") || "";
    const url = params.get("returnUrl") || "";
    setFormData((prev) => ({ ...prev, direction_name: initialValue }));
    setReturnUrl(url);
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/directions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          direction_id: crypto.randomUUID(),
          direction_name: formData.direction_name,
          acronym: formData.acronym,
          created_at: new Date().toISOString(),
          updated_at: null,
        }),
      });

      if (response.ok) {
        await response.json();
        showAlert("success", "Direction créée avec succès !");
        event.target.reset();
        setFormData({ direction_name: "", acronym: "" });
        // Redirect to returnUrl if provided
        if (returnUrl) {
          window.location.href = returnUrl;
        }
      } else {
        const errorData = await response.json();
        showAlert("error", errorData.message || "Erreur lors de la création de la direction.");
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ direction_name: "", acronym: "" });
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
                    value={formData.direction_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, direction_name: e.target.value }))}
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