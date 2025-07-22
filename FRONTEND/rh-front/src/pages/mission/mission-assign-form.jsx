"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "config/apiConfig";
import Alert from "components/alert";
import * as FaIcons from "react-icons/fa";
import "styles/generic-form-styles.css";

export default function AssignMissionForm() {
  const [formData, setFormData] = useState({
    mission: "",
    beneficiaries: [{ name: "", matricule: "" }],
    function: "",
    base: "",
    direction: "",
    departmentService: "",
    costCenter: "",
    meansOfTransport: "",
    whoWillGo: "",
    departureDate: "",
    departureTime: "",
    missionDuration: "",
    returnDate: "",
    returnTime: "",
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

    setFormData((prev) => ({
      ...prev,
      beneficiaries: [{ name: initialValue, matricule: "" }],
    }));
    setReturnUrl(url);
    setFieldType(type);
  }, [location.search]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBeneficiaryChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedBeneficiaries = [...prev.beneficiaries];
      updatedBeneficiaries[index] = { ...updatedBeneficiaries[index], [field]: value };
      return { ...prev, beneficiaries: updatedBeneficiaries };
    });
  };

  const handleAddBeneficiary = () => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { name: "", matricule: "" }],
    }));
  };

  const handleRemoveBeneficiary = (index) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.mission) {
      showAlert("error", "Le champ Mission est requis.");
      setIsSubmitting(false);
      return;
    }
    if (formData.beneficiaries.some((b) => !b.name || !b.matricule)) {
      showAlert("error", "Tous les bénéficiaires doivent avoir un nom et un matricule.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.function || !formData.base || !formData.direction || !formData.departmentService || !formData.departureDate || !formData.departureTime || !formData.missionDuration || !formData.returnDate || !formData.returnTime) {
      showAlert("error", "Tous les champs requis doivent être remplis.");
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        ...formData,
        beneficiaries: formData.beneficiaries.map((b) => ({
          name: b.name,
          matricule: b.matricule,
        })),
      };

      const response = await fetch(`${BASE_URL}/api/AssignMission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert("success", "Mission assignée avec succès !");

        if (returnUrl && fieldType) {
          setTimeout(() => {
            const returnParams = new URLSearchParams();
            returnParams.set("newValue", formData.beneficiaries[0].name);
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
          navigate("/mission-confirmation");
        }
      } else {
        const errorData = await response.json();
        const message = errorData.message || `Erreur ${response.status}: Échec de l'assignation de la mission.`;
        showAlert("error", message);
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      mission: "",
      beneficiaries: [{ name: "", matricule: "" }],
      function: "",
      base: "",
      direction: "",
      departmentService: "",
      costCenter: "",
      meansOfTransport: "",
      whoWillGo: "",
      departureDate: "",
      departureTime: "",
      missionDuration: "",
      returnDate: "",
      returnTime: "",
    });
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
      

      <form id="assignMissionForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Informations de la Mission</h3>
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Mission</label>
                </th>
                <td className="form-input-cell" colSpan="3">
                  <input
                    type="text"
                    name="mission"
                    value={formData.mission}
                    onChange={handleChange}
                    placeholder="Saisir le nom de la mission..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-section">
          <h3>Bénéficiaires</h3>
          {formData.beneficiaries.map((beneficiary, index) => (
            <table key={index} className="form-table">
              <tbody>
                <tr>
                  <th className="form-label-cell">
                    <label className="form-label form-label-required">Bénéficiaire {index + 1}</label>
                  </th>
                  <td className="form-input-cell">
                    <input
                      type="text"
                      value={beneficiary.name}
                      onChange={(e) => handleBeneficiaryChange(index, "name", e.target.value)}
                      placeholder="Saisir le nom du bénéficiaire..."
                      className="form-input"
                      required
                      disabled={isSubmitting}
                    />
                  </td>
                  <th className="form-label-cell">
                    <label className="form-label form-label-required">Matricule</label>
                  </th>
                  <td className="form-input-cell">
                    <input
                      type="text"
                      value={beneficiary.matricule}
                      onChange={(e) => handleBeneficiaryChange(index, "matricule", e.target.value)}
                      placeholder="Saisir le matricule..."
                      className="form-input"
                      required
                      disabled={isSubmitting}
                    />
                    {formData.beneficiaries.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemoveBeneficiary(index)}
                        disabled={isSubmitting}
                        title="Supprimer ce bénéficiaire"
                      >
                        <FaIcons.FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
          <div className="form-actions">
            <button
              type="button"
              className="add-btn"
              onClick={handleAddBeneficiary}
              disabled={isSubmitting}
              title="Ajouter un bénéficiaire"
            >
              <FaIcons.FaPlus className="w-4 h-4" />
              Ajouter un bénéficiaire
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Informations Générales</h3>
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Fonction</label>
                </th>
                <td className="form-input-cell" colSpan="3">
                  <input
                    type="text"
                    name="function"
                    value={formData.function}
                    onChange={handleChange}
                    placeholder="Saisir la fonction..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Base à</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="base"
                    value={formData.base}
                    onChange={handleChange}
                    placeholder="Saisir la base..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Direction</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                    placeholder="Saisir la direction..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Département/Service</label>
                </th>
                <td className="form-input-cell" colSpan="3">
                  <input
                    type="text"
                    name="departmentService"
                    value={formData.departmentService}
                    onChange={handleChange}
                    placeholder="Saisir le département ou service..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label">Centre de coût</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleChange}
                    placeholder="Saisir le centre de coût..."
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label">Moyen de transport</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="meansOfTransport"
                    value={formData.meansOfTransport}
                    onChange={handleChange}
                    placeholder="Saisir le moyen de transport..."
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label">Qui se rendra à</label>
                </th>
                <td className="form-input-cell" colSpan="3">
                  <input
                    type="text"
                    name="whoWillGo"
                    value={formData.whoWillGo}
                    onChange={handleChange}
                    placeholder="Saisir la destination..."
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Date de départ</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Heure de départ</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Durée prévue de la mission</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="number"
                    name="missionDuration"
                    value={formData.missionDuration}
                    onChange={handleChange}
                    placeholder="Saisir la durée (jours)..."
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
                <th className="form-label-cell"></th>
                <td className="form-input-cell"></td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Date de retour</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Heure de retour</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="time"
                    name="returnTime"
                    value={formData.returnTime}
                    onChange={handleChange}
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
            title="Assigner la mission"
          >
            {isSubmitting ? "Envoi en cours..." : "Assigner"}
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