import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "components/auto-complete-input";
import { createRegion } from "services/lieu/lieu";

export default function LieuForm() {
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    ville: "",
    codePostal: "",
    pays: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [paysSuggestions, setPaysSuggestions] = useState([]); // Initialize as empty
  const [isLoading, setIsLoading] = useState({ lieux: false });
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
    
    setFormData((prev) => ({ ...prev, nom: initialValue }));
    setReturnUrl(url);
    setFieldType(type);
  }, [location.search]);

  // Fetch countries from country.json
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/data/country.json");
        if (!response.ok) {
          throw new Error("Failed to fetch country data");
        }
        const countries = await response.json();
        // Map to an array of country names for AutoCompleteInput
        setPaysSuggestions(countries.map((country) => country.name));
      } catch (error) {
        console.error("Error fetching countries:", error);
        showAlert("error", "Erreur lors du chargement des pays.");
      }
    };

    fetchCountries();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    if (field === "pays") {
      setPaysSuggestions((prev) => [...prev, value]);
      setFormData((prev) => ({ ...prev, pays: value }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, Pays: undefined }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    const fieldMapping = {
      nom: "Nom",
      adresse: "Adresse",
      ville: "Ville",
      codePostal: "CodePostal",
      pays: "Pays",
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
      await createRegion(
        {
          nom: formData.nom,
          adresse: formData.adresse,
          ville: formData.ville,
          codePostal: formData.codePostal,
          pays: formData.pays,
        },
        setIsLoading,
        (alert) => {
          setAlert(alert);
          if (returnUrl && fieldType) {
            setTimeout(() => {
              const returnParams = new URLSearchParams();
              returnParams.set("newValue", formData.nom);
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
            setFormData({ nom: "", adresse: "", ville: "", codePostal: "", pays: "" });
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
    setFormData({ nom: "", adresse: "", ville: "", codePostal: "", pays: "" });
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
        <h2 className="table-title">Création d'un Lieu</h2>
      </div>

      <form id="lieuForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="nom" className="form-label form-label-required">
                    Nom
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="nom"
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Saisir le nom du lieu..."
                    className={`form-input ${fieldErrors.Nom ? "error" : ""}`}
                    disabled={isSubmitting || isLoading.lieux}
                  />
                  {fieldErrors.Nom && (
                    <span className="error-message">{fieldErrors.Nom.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="adresse" className="form-label">
                    Adresse
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="adresse"
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    placeholder="Saisir l'adresse..."
                    className={`form-input ${fieldErrors.Adresse ? "error" : ""}`}
                    disabled={isSubmitting || isLoading.lieux}
                  />
                  {fieldErrors.Adresse && (
                    <span className="error-message">{fieldErrors.Adresse.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="ville" className="form-label">
                    Ville
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="ville"
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    placeholder="Saisir la ville..."
                    className={`form-input ${fieldErrors.Ville ? "error" : ""}`}
                    disabled={isSubmitting || isLoading.lieux}
                  />
                  {fieldErrors.Ville && (
                    <span className="error-message">{fieldErrors.Ville.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="codePostal" className="form-label">
                    Code Postal
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="codePostal"
                    type="text"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleInputChange}
                    placeholder="Saisir le code postal..."
                    className={`form-input ${fieldErrors.CodePostal ? "error" : ""}`}
                    disabled={isSubmitting || isLoading.lieux}
                  />
                  {fieldErrors.CodePostal && (
                    <span className="error-message">{fieldErrors.CodePostal.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="pays" className="form-label form-label-required">
                    Pays
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.pays}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, pays: value }));
                      setFieldErrors((prev) => ({ ...prev, Pays: undefined }));
                    }}
                    suggestions={paysSuggestions}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un pays..."
                    disabled={isSubmitting || isLoading.lieux}
                    onAddNew={(value) => handleAddNewSuggestion("pays", value)}
                    showAddOption={false}
                    fieldType="pays"
                    fieldLabel="pays"
                    addNewRoute="/lieu/pays-form"
                    className={`form-input ${fieldErrors.Pays ? "error" : ""}`}
                  />
                  {fieldErrors.Pays && (
                    <span className="error-message">{fieldErrors.Pays.join(", ")}</span>
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
            disabled={isSubmitting || isLoading.lieux}
            title="Enregistrer le lieu"
          >
            {isSubmitting ? "Envoi en cours..." : "Enregistrer"}
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting || isLoading.lieux}
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