import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as FaIcons from "react-icons/fa";

const AutoCompleteInput = ({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled,
  onAddNew,
  className = "form-input",
  fieldType = "",
  fieldLabel = "",
  addNewRoute = "",
  showAddOption = true,
  maxVisibleItems = 3,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Effet pour récupérer la nouvelle valeur depuis l'URL après création
  useEffect(() => {
    // Utiliser URLSearchParams de manière sécurisée sans modification
    const searchParams = new URLSearchParams(location.search);
    const newValue = searchParams.get("newValue");
    const urlFieldType = searchParams.get("fieldType");
    
    // Si une nouvelle valeur est présente et correspond au type de champ
    if (newValue && urlFieldType === fieldType && newValue !== value) {
      onChange(newValue);
      
      // Naviguer vers la même page sans les paramètres au lieu de les modifier
      const cleanPath = location.pathname;
      const remainingParams = new URLSearchParams(location.search);
      remainingParams.delete("newValue");
      remainingParams.delete("fieldType");
      
      const cleanUrl = remainingParams.toString() 
        ? `${cleanPath}?${remainingParams.toString()}`
        : cleanPath;
      
      // Utiliser navigate avec replace pour nettoyer l'URL
      setTimeout(() => {
        navigate(cleanUrl, { replace: true });
      }, 100);
      
      // Fermer la dropdown et donner le focus
      setIsOpen(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [location.search, location.pathname, fieldType, onChange, value, navigate]);

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
      // Créer les paramètres pour la navigation
      const params = new URLSearchParams();
      params.set("fieldType", fieldType);
      params.set("fieldLabel", fieldLabel);
      params.set("initialValue", value);
      params.set("returnUrl", location.pathname + location.search);
      
      const redirectUrl = addNewRoute || `/add-${fieldType}`;
      navigate(`${redirectUrl}?${params.toString()}`);
      setIsOpen(false);
    }
  };

  const canAddNew = value && !suggestions.some((s) => s.toLowerCase() === value.toLowerCase());

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