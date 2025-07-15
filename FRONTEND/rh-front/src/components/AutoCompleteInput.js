import React, { useState, useRef, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import AddItemModal from "./AddItemModal"; // Importer le composant modal

// Composant d'autocomplétion personnalisé style ERPNext avec modal
const AutoCompleteInput = ({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled,
  onAddNew,
  className = "form-input",
  fieldType = "", // Type de champ pour le modal
  fieldLabel = "", // Label pour le modal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value) {
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleAddNew = () => {
    if (value && !suggestions.includes(value)) {
      // Ouvrir le modal au lieu d'ajouter directement
      setIsModalOpen(true);
      setIsOpen(false);
    }
  };

  const handleModalAdd = (newItem) => {
    if (onAddNew) {
      onAddNew(newItem);
      onChange(newItem); // Sélectionner automatiquement l'élément ajouté
    }
  };

  const canAddNew = value && !suggestions.some((s) => s.toLowerCase() === value.toLowerCase());

  return (
    <>
      <div ref={containerRef} className="autocomplete-container">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
        <span
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="autocomplete-icon"
        >
          {isOpen ? "▲" : "▼"}
        </span>

        {isOpen && !disabled && (
          <div className="autocomplete-dropdown">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="autocomplete-suggestion"
                >
                  {suggestion}
                </div>
              ))
            ) : (
              <div className="autocomplete-no-suggestion">
                Aucune suggestion trouvée
              </div>
            )}

            {value && (
              <div className="autocomplete-add-option">
                <div
                  onClick={handleAddNew}
                  className={`autocomplete-add-item ${canAddNew ? "enabled" : "disabled"}`}
                >
                  <FaIcons.FaPlus className="icon" />
                  {canAddNew ? `Ajouter "${value}"` : `"${value}" existe déjà`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal pour ajouter un nouvel élément */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleModalAdd}
        fieldType={fieldType}
        fieldLabel={fieldLabel}
      />
    </>
  );
};

export default AutoCompleteInput;