import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";

const AddItemModal = ({ isOpen, onClose, onAdd, fieldType, fieldLabel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    isActive: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAdd(formData.name.trim());
      setFormData({ name: "", description: "", code: "", isActive: true });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "", code: "", isActive: true });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Ajouter un nouveau {fieldLabel}</h3>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={handleClose}
          >
            <FaIcons.FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label form-label-required">
              Nom du {fieldLabel}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
              placeholder={`Saisir le nom du ${fieldLabel}`}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="form-input"
              rows="3"
              placeholder="Description optionnelle"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="form-input"
              placeholder="Code optionnel"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="form-checkbox"
              />
              Actif
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="submit"
              className="submit-btn"
            >
              <FaIcons.FaPlus className="w-4 h-4" />
              Ajouter
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
            >
              <FaIcons.FaTimes className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;