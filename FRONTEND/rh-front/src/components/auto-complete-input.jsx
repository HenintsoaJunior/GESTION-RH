import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";

// Composant d'autocomplétion personnalisé style ERPNext avec redirection
const AutoCompleteInput = ({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled,
  onAddNew,
  className = "form-input",
  fieldType = "", // Type de champ pour la redirection
  fieldLabel = "", // Label pour la redirection
  addNewRoute = "", // Route vers laquelle rediriger
  showAddOption = true, // Contrôle si l'option "Ajouter" doit être affichée
  maxVisibleItems = 3, // Nombre max d'éléments visibles avant dropdown
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

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
      // Rediriger vers la page de création avec les paramètres
      const queryParams = new URLSearchParams({
        fieldType: fieldType,
        fieldLabel: fieldLabel,
        initialValue: value,
        returnUrl: window.location.pathname,
      });
      
      const redirectUrl = addNewRoute || `/add-${fieldType}`;
      navigate(`${redirectUrl}?${queryParams.toString()}`);
      setIsOpen(false);
      // Call onAddNew if provided to update suggestions
      if (onAddNew) {
        onAddNew(value);
      }
    }
  };

  const canAddNew = value && !suggestions.some((s) => s.toLowerCase() === value.toLowerCase());

  // Détermine si on doit afficher le dropdown avec défilement
  const shouldShowScrollable = filteredSuggestions.length > maxVisibleItems;

  return (
    <div
      ref={containerRef}
      className="autocomplete-container"
      role="combobox"
      aria-controls="autocomplete-dropdown"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        aria-autocomplete="list"
        aria-controls="autocomplete-dropdown"
        aria-activedescendant={isOpen && filteredSuggestions.length > 0 ? "suggestion-0" : undefined}
      />
      <span
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="autocomplete-icon"
        aria-label={isOpen ? "Masquer les suggestions" : "Afficher les suggestions"}
      >
        {isOpen ? <FaIcons.FaAngleUp /> : <FaIcons.FaAngleDown />}
      </span>

      {isOpen && !disabled && (
        <div 
          id="autocomplete-dropdown" 
          className={`autocomplete-dropdown ${shouldShowScrollable ? 'scrollable' : ''}`}
          role="listbox"
        >
          {filteredSuggestions.length > 0 ? (
            <div className="autocomplete-suggestions-container">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  id={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="autocomplete-suggestion"
                  role="option"
                  aria-selected={value === suggestion}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          ) : (
            <div className="autocomplete-no-suggestion" role="status">
              Aucune suggestion trouvée
            </div>
          )}

          {value && showAddOption && (
            <div className="autocomplete-add-option">
              <div
                onClick={handleAddNew}
                className={`autocomplete-add-item ${canAddNew ? "enabled" : "disabled"}`}
                role="button"
                aria-disabled={!canAddNew}
              >
                <FaIcons.FaPlus className="icon" />
                {canAddNew ? `Ajouter "${value}"` : `"${value}" existe déjà`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteInput;