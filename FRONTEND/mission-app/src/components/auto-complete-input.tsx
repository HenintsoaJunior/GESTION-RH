import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import styled, { css } from "styled-components";
import type { RefObject } from "react";

interface AutoCompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  disabled?: boolean;
  onAddNew?: () => void;
  className?: string;
  fieldType: string;
  fieldLabel: string;
  addNewRoute?: string;
  showAddOption?: boolean;
  maxVisibleItems?: number;
}

const Container = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const InputWrapper = styled.div<{ className?: string }>`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  background: white;
  overflow: hidden;

  input {
    flex: 1;
    padding: 8px 12px;
    padding-right: 45px;
    border: none;
    outline: none;
    font-size: 12px;
    color: var(--text-color);
    background: transparent;

    &:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }

    ${({ className }) => className && css`
      /* Allow external className for additional input styling */
      &.${className} {
        /* Placeholder for external styles */
      }
    `}
  }
`;

const IconButton = styled.span`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 12px;
  cursor: pointer;
  background: transparent;
  border-left: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #e9ecef;
  }

  svg {
    font-size: 12px;
    color: #6c757d;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Dropdown = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'scrollable',
})<{ scrollable?: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow: hidden;

  ${({ scrollable }) => scrollable && css`
    max-height: 200px;
    overflow-y: auto;
  `}
`;

const SuggestionsContainer = styled.div`
  max-height: 150px;
  overflow-y: auto;
`;

const Suggestion = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  background: white;
  font-size: 12px;
  color: var(--text-color);
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  ${({ selected }) => selected && css`
    background: #e3f2fd;
  `}

  &:last-child {
    border-bottom: none;
  }
`;

const NoSuggestion = styled.div`
  padding: 12px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
  font-size: 12px;
`;

const AddOption = styled.div`
  border-top: 1px solid #eee;
`;

const AddItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'enabled',
})<{ enabled?: boolean }>`
  padding: 8px 12px;
  cursor: ${({ enabled }) => (enabled ? 'pointer' : 'not-allowed')};
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ enabled }) => (enabled ? '#007bff' : '#6c757d')};
  font-size: 12px;
  transition: color 0.2s;

  &:hover {
    ${({ enabled }) => enabled && css`
      background: #f8f9fa;
    `}
  }

  svg {
    font-size: 12px;
  }
`;

const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled = false,
  onAddNew,
  className = "form-input",
  fieldType = "",
  fieldLabel = "",
  addNewRoute = "",
  showAddOption = true,
  maxVisibleItems = 3,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
  const inputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Effet pour récupérer la nouvelle valeur depuis l'URL après création
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newValue = searchParams.get("newValue");
    const urlFieldType = searchParams.get("fieldType");
    
    // Si une nouvelle valeur est présente et correspond au type de champ
    if (newValue && urlFieldType === fieldType && newValue !== value) {
      onChange(newValue);
      
      // Naviguer vers la même page sans les paramètres
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

  // Filtrer les suggestions basées sur la valeur de l'input
  useEffect(() => {
    if (value) {
      const filtered: string[] = suggestions.filter((s: string) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [value, suggestions]);

  // Gérer les clics en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue: string = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: string): void => {
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleAddNew = (): void => {
    if (value && !suggestions.includes(value)) {
      // Créer les paramètres pour la navigation
      const params = new URLSearchParams();
      params.set("fieldType", fieldType);
      params.set("fieldLabel", fieldLabel);
      params.set("initialValue", value);
      params.set("returnUrl", location.pathname + location.search);
      
      const redirectUrl: string = addNewRoute || `/add-${fieldType}`;
      navigate(`${redirectUrl}?${params.toString()}`);
      setIsOpen(false);
    }
    onAddNew?.();
  };

  const canAddNew: boolean = Boolean(value) && !suggestions.some((s: string) => s.toLowerCase() === value.toLowerCase());

  const shouldShowScrollable: boolean = filteredSuggestions.length > maxVisibleItems;

  return (
    <Container
      ref={containerRef}
      role="combobox"
      aria-controls="autocomplete-dropdown"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      <InputWrapper className={className}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          aria-autocomplete="list"
          aria-controls="autocomplete-dropdown"
          aria-activedescendant={isOpen && filteredSuggestions.length > 0 ? "suggestion-0" : undefined}
        />
        <IconButton
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-label={isOpen ? "Masquer les suggestions" : "Afficher les suggestions"}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
        >
          {isOpen ? <FaIcons.FaAngleUp /> : <FaIcons.FaAngleDown />}
        </IconButton>
      </InputWrapper>

      {isOpen && !disabled && (
        <Dropdown 
          id="autocomplete-dropdown" 
          scrollable={shouldShowScrollable}
          role="listbox"
        >
          {filteredSuggestions.length > 0 ? (
            <SuggestionsContainer>
              {filteredSuggestions.map((suggestion: string, index: number) => (
                <Suggestion
                  key={suggestion}
                  id={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  selected={value === suggestion}
                  role="option"
                  aria-selected={value === suggestion}
                >
                  {suggestion}
                </Suggestion>
              ))}
            </SuggestionsContainer>
          ) : (
            <NoSuggestion role="status">
              Aucune suggestion trouvée
            </NoSuggestion>
          )}

          {value && showAddOption && (
            <AddOption>
              <AddItem
                onClick={handleAddNew}
                enabled={canAddNew}
                role="button"
                aria-disabled={!canAddNew}
                tabIndex={canAddNew ? 0 : -1}
              >
                <FaIcons.FaPlus />
                {canAddNew ? `Ajouter "${value}"` : `"${value}" existe déjà`}
              </AddItem>
            </AddOption>
          )}
        </Dropdown>
      )}
    </Container>
  );
};

export default AutoCompleteInput;