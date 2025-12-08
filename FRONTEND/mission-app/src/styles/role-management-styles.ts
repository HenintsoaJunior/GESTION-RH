import styled from 'styled-components';

export const Container = styled.div`
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  
  &.h2 {
    font-size: 1.5rem;
  }
  
  &.h3 {
    font-size: 1.125rem;
  }
`;

export const ActionsBar = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 16px;
  gap: 8px;
  min-width: 300px;
  
  input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.95rem;
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.variant === 'danger' ? 'var(--color-error-light)' : 'var(--primary-color)'};
  color: ${props => props.variant === 'danger' ? 'var(--color-error)' : 'white'};
  border: 1px solid ${props => props.variant === 'danger' ? 'var(--color-error)' : 'var(--primary-color)'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'danger' ? 'var(--color-error)' : 'var(--primary-dark)'};
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SelectionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--primary-light);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  margin-bottom: var(--spacing-lg);
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const MainContent = styled.div`
  min-height: 60vh;
`;

export const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--spacing-lg);
`;

export const RoleCard = styled.div<{ isSelected: boolean; isEditing: boolean }>`
  background: white;
  border: 2px solid ${props => props.isSelected ? 'var(--primary-color)' : 'var(--color-border)'};
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.isSelected ? 'var(--primary-color)' : 'var(--primary-light)'};
  }
  
  ${props => props.isEditing && `
    background: var(--background-light);
    border-color: var(--primary-color);
  `}
`;

export const RoleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

export const RoleBody = styled.div`
  margin-bottom: 20px;
`;

export const RoleFooter = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
`;

export const GroupSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: var(--background-light);
  border-radius: 8px;
`;

export const HabilitationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
`;

export const HabilitationItem = styled.div`
  padding: 12px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-color);
    background: var(--primary-light);
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  color: var(--text-secondary);
  
  h3 {
    margin: 16px 0 8px;
    color: var(--text-primary);
  }
`;

export const FabButton = styled.button`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
  
  &:hover {
    transform: scale(1.1);
    background: var(--primary-dark);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  }
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: var(--primary-color);
  color: white;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--background-light);
  color: var(--text-secondary);
  border-radius: 20px;
  font-size: 0.85rem;
  white-space: nowrap;
`;

export const EditableField = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }
  
  &[type="textarea"] {
    min-height: 100px;
    resize: vertical;
  }
`;

export const ConfirmationDialog = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;