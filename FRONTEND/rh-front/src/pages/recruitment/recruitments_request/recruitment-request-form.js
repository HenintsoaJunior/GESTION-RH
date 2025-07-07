"use client";

import { useState } from "react";
import { Send, Trash, Eraser } from "lucide-react";
import { BASE_URL } from "../../../config/apiConfig";
import "../../../styles/generic-form-styles.css";
import RichTextEditor from "../../../components/RichTextEditor";
import FileUpload from "../../../components/FileUpload";
import Alert from "../../../components/Alert";

export default function RecruitmentRequestForm() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [positions, setPositions] = useState([{ jobTitle: "", qty: 1 }]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddPosition = () => {
    setPositions([...positions, { jobTitle: "", qty: 1 }]);
  };

  const handleRemovePosition = (index) => {
    if (positions.length > 1) {
      setPositions(positions.filter((_, i) => i !== index));
    }
  };

  const handlePositionChange = (index, field, value) => {
    const updatedPositions = [...positions];
    updatedPositions[index][field] = value;
    setPositions(updatedPositions);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const form = event.target;

      formData.append("RecruitmentRequestId", "");
      formData.append("Description", description);
      formData.append("Status", "En Cours");
      formData.append("RequesterId", "USR001");
      formData.append("RequestDate", new Date().toISOString());
      formData.append("ApprovalDate", new Date().toISOString());
      formData.append("Positions", JSON.stringify(positions));

      selectedFiles.forEach((file) => {
        formData.append("Files", file);
      });

      const response = await fetch(`${BASE_URL}/api/RecruitmentRequest`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await response.json(); // No assignment to result
        showAlert("success", "Demande de recrutement soumise avec succès !");
        form.reset();
        setSelectedFiles([]);
        setDescription("");
        setPositions([{ jobTitle: "", qty: 1 }]);
      } else {
        await response.json(); // No assignment to errorData
        showAlert("error", "Erreur lors de la soumission de la demande. Veuillez réessayer.");
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPositions([{ jobTitle: "", qty: 1 }]);
    setSelectedFiles([]);
    setDescription("");
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
        <div className="table-icon">☙</div>
        <h2 className="table-title">Demande de recrutement</h2>
      </div>

      <form id="recruitmentRequestForm" className="generic-form" onSubmit={handleSubmit}>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required" htmlFor="description">
                  Description détaillée
                </label>
              </th>
              <td className="form-input-cell">
                <RichTextEditor
                  placeholder="Décrivez les besoins de recrutement en détail..."
                  onChange={setDescription}
                  disabled={isSubmitting}
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label">Pièces jointes</label>
              </th>
              <td className="form-input-cell">
                <FileUpload onFilesChange={setSelectedFiles} disabled={isSubmitting} />
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Postes à pourvoir</h3>
        <table className="form-table" id="positionsTable">
          <thead>
            <tr>
              <th>Intitulé du poste</th>
              <th>Quantité</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name={`jobTitle-${index}`}
                    value={position.jobTitle}
                    placeholder="Ex: Développeur Full Stack Senior"
                    className="form-input"
                    required
                    disabled={isSubmitting}
                    onChange={(e) => handlePositionChange(index, "jobTitle", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name={`qty-${index}`}
                    value={position.qty}
                    min="1"
                    className="form-input"
                    required
                    disabled={isSubmitting}
                    onChange={(e) => handlePositionChange(index, "qty", parseInt(e.target.value))}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => handleRemovePosition(index)}
                    disabled={positions.length === 1 || isSubmitting}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="add-btn"
          onClick={handleAddPosition}
          disabled={isSubmitting}
        >
          <i className="fa-solid fa-plus"></i> Ajouter un poste
        </button>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <Send className="w-4 h-4" />
            {isSubmitting ? "Envoi en cours..." : "Soumettre"}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset} disabled={isSubmitting}>
            <Eraser className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}