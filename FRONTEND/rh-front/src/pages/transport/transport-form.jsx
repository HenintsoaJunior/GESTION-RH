import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import { createTransport } from "services/transport/transport";

export default function TransportForm() {
  const [formData, setFormData] = useState({
    type: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Mapper les noms des champs vers les noms des propriétés DTO
    const fieldMapping = {
      type: 'Type'
    };
    
    const dtoFieldName = fieldMapping[name];
    if (dtoFieldName) {
      setFieldErrors((prev) => ({ ...prev, [dtoFieldName]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      await createTransport(
        { type: formData.type },
        setIsSubmitting,
        (alert) => {
          setAlert(alert);
          if (returnUrl && fieldType) {
            setTimeout(() => {
              const returnParams = new URLSearchParams();
              returnParams.set("newValue", formData.type);
              returnParams.set("fieldType", fieldType);

              const [basePath, existingParams] = returnUrl.split("?");
              const finalParams = new URLSearchParams(existingParams || "");

              returnParams.forEach((value, key) => {
                finalParams.set(key, value);
              });

              const finalUrl = `${basePath}?${finalParams.toString()}`;
              navigate(finalUrl);
            }, 1500);
          } else {
            setFormData({ type: "" });
          }
        },
        (error) => {
          console.log("Erreurs par champ (fieldErrors) :", error.fieldErrors);
          setModal(error);
          setFieldErrors(error.fieldErrors || {});
        }
      );
    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ type: "" });
    setFieldErrors({});
    showAlert("info", "Formulaire réinitialisé.");
  };

  return (
    <div className="form-container">
      <Modal
        type={modal.type}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
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
                  <label htmlFor="type" className="form-label form-label-required">
                    Type de Transport
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="type"
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Ex: Bateau, Bus, Train..."
                    className={`form-input ${fieldErrors.Type ? "error" : ""}`}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.Type && (
                    <span className="error-message">{fieldErrors.Type.join(", ")}</span>
                  )}
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