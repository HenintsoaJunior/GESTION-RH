import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "components/auto-complete-input";
import { fetchAllRegions } from "services/lieu/lieu";
import { createMission } from "services/mission/mission";

export default function MissionForm() {
  const [formData, setFormData] = useState({
    missionTitle: "",
    description: "",
    location: "",
    startDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [regions, setRegions] = useState([]);
  const [regionNames, setRegionNames] = useState([]);
  const [regionDisplayNames, setRegionDisplayNames] = useState([]);
  const [isLoading, setIsLoading] = useState({ regions: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Fetch regions from API
  useEffect(() => {
    fetchAllRegions(
      (data) => {
        setRegions(data);
        setRegionNames(data.map((lieu) => lieu.nom));
        // Créer les noms d'affichage avec format nom/pays
        setRegionDisplayNames(data.map((lieu) => `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ''}`));
      },
      setIsLoading,
      (alert) => setAlert(alert)
    );
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    const newRegion = { nom: value };
    setRegions((prev) => [...prev, newRegion]);
    setRegionNames((prev) => [...prev, value]);
    setRegionDisplayNames((prev) => [...prev, value]);
    setFormData((prev) => ({ ...prev, location: value }));
    showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
    setFieldErrors((prev) => ({ ...prev, LieuId: undefined })); // Effacer l'erreur pour location
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name === "missionTitle" ? "Name" : "LieuId"]: undefined })); // Effacer l'erreur
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({}); // Réinitialiser les erreurs avant soumission

    const selectedRegion = regions.find((region) => region.nom === formData.location);
    if (formData.location && !selectedRegion) {
      setModal({
        isOpen: true,
        type: "error",
        message: "Veuillez sélectionner un lieu valide parmi les régions de Madagascar.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createMission(
        {
          missionId: formData.missionId || "",
          name: formData.missionTitle,
          description: formData.description,
          startDate: formData.startDate,
          lieuId: selectedRegion ? selectedRegion.lieuId : "",
        },
        (loading) => setIsSubmitting(loading.mission),
        (alert) => setAlert(alert),
        (error) => {
          console.log("Erreurs par champ (fieldErrors) :", error.fieldErrors);
          setModal(error); // Afficher le message global
          setFieldErrors(error.fieldErrors || {}); // Stocker les erreurs par champ
        }
      );
      navigate("/mission/list");
    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ missionTitle: "", description: "", location: "", startDate: "" });
    setFieldErrors({}); // Réinitialiser les erreurs
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
                    name="missionTitle"
                    value={formData.missionTitle}
                    onChange={handleInputChange}
                    placeholder="Saisir le titre de la mission..."
                    className={`form-input ${fieldErrors.Name ? "error" : ""}`}
                    disabled={isSubmitting || isLoading.regions}
                  />
                  {fieldErrors.Name && (
                    <span className="error-message">{fieldErrors.Name.join(", ")}</span>
                  )}
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
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Saisir une description..."
                    className="form-input"
                    rows="4"
                    disabled={isSubmitting || isLoading.regions}
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
                    onChange={(value) => {
                      // Extraire le nom du lieu depuis l'affichage "nom/pays"  
                      const realValue = value.includes('/') ? value.split('/')[0] : value;
                      setFormData((prev) => ({ ...prev, location: realValue }));
                      setFieldErrors((prev) => ({ ...prev, LieuId: undefined }));
                    }}
                    suggestions={regionDisplayNames}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un lieu..."
                    disabled={isSubmitting || isLoading.regions}
                    onAddNew={(value) => handleAddNewSuggestion("location", value)}
                    showAddOption={true}
                    fieldType="location"
                    fieldLabel="lieu"
                    addNewRoute="/lieu/create"
                    className={`form-input ${fieldErrors.LieuId ? "error" : ""}`}
                  />
                  {fieldErrors.LieuId && (
                    <span className="error-message">{fieldErrors.LieuId.join(", ")}</span>
                  )}
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
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={isSubmitting || isLoading.regions}
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
            disabled={isSubmitting || isLoading.regions}
            title="Enregistrer la mission"
          >
            {isSubmitting ? "Envoi en cours..." : "Enregistrer"}
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting || isLoading.regions}
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