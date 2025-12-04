import { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import * as FaIcons from "react-icons/fa";

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

const IconButton = styled.span<{ $disabled?: boolean }>`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 12px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  background: transparent;
  border-left: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background: ${({ $disabled }) => ($disabled ? 'transparent' : '#e9ecef')};
  }

  svg {
    font-size: 12px;
    color: #6c757d;
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
  fieldLabel = "",
  showAddOption = true,
  maxVisibleItems = 3,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrage des suggestions
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

  // Click outside → fermer le dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleAddNewClick = () => {
    if (!onAddNew) return;
    
    // Fermer le dropdown
    setIsOpen(false);
    
    // Appeler la fonction de callback pour ouvrir la popup
    onAddNew();
  };

  const canAddNew = 
    showAddOption && 
    Boolean(value) && 
    !suggestions.some((s) => s.toLowerCase() === value.toLowerCase());

  const shouldShowScrollable = filteredSuggestions.length > maxVisibleItems;

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
        />
        <IconButton
          $disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-label={isOpen ? "Masquer les suggestions" : "Afficher les suggestions"}
          role="button"
          tabIndex={disabled ? -1 : 0}
        >
          {isOpen ? <FaIcons.FaAngleUp /> : <FaIcons.FaAngleDown />}
        </IconButton>
      </InputWrapper>

      {isOpen && !disabled && (
        <Dropdown id="autocomplete-dropdown" scrollable={shouldShowScrollable} role="listbox">
          {filteredSuggestions.length > 0 ? (
            <SuggestionsContainer>
              {filteredSuggestions.map((suggestion, index) => {
                // Créer une clé unique en combinant la valeur et l'index
                const uniqueKey = `${suggestion}_${index}`;
                return (
                  <Suggestion
                    key={uniqueKey}
                    id={`suggestion-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    selected={value === suggestion}
                    role="option"
                    aria-selected={value === suggestion}
                  >
                    {suggestion}
                  </Suggestion>
                );
              })}
            </SuggestionsContainer>
          ) : (
            <NoSuggestion role="status">Aucune suggestion trouvée</NoSuggestion>
          )}

          {/* Option "Ajouter" */}
          {value && showAddOption && onAddNew && (
            <AddOption>
              <AddItem
                onClick={handleAddNewClick}
                enabled={canAddNew}
                role="button"
                aria-disabled={!canAddNew}
                tabIndex={canAddNew ? 0 : -1}
              >
                <FaIcons.FaPlus />
                {canAddNew
                  ? `Ajouter comme nouvelle ${fieldLabel.toLowerCase()}`
                  : `${fieldLabel} existe déjà`}
              </AddItem>
            </AddOption>
          )}
        </Dropdown>
      )}
    </Container>
  );
};

export default AutoCompleteInput;