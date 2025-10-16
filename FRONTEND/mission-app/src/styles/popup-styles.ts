import styled from 'styled-components';

export const PopupActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 20px 30px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;


export const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const PagePopup = styled.div`
  background: var(--bg-primary);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
`;

export const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
`;

export const PopupTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
`;

export const PopupClose = styled.button<{ disabled?: boolean }>`
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  color: var(--text-secondary);
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--bg-secondary);
  }
`;

export const PopupContent = styled.div`
  padding: var(--spacing-lg);
`;

export const SelectedUsersContainer = styled.div`
  background: var(--bg-primary);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
`;

export const SelectedUsersTitle = styled.div`
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
`;

export const SelectedUsersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

export const SelectedUserTag = styled.div`
  background: var(--primary-color);
  color: #ffffff;
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
`;

export const SectionContainer = styled.div`
  margin-bottom: var(--spacing-xl);
`;

export const SectionHeader = styled.div`
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  border-left: 3px solid var(--primary-color);
`;

export const SectionTitle = styled.div`
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
`;

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

export const RoleItem = styled.div<{ selected?: boolean }>`
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  background: ${({ selected }) => (selected ? 'rgba(0, 123, 255, 0.05)' : 'transparent')};
  transition: all 0.2s ease;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
`;

export const ItemContent = styled.div`
  flex: 1;
`;

export const RoleCheckbox = styled.input`
  margin-top: 2px;
  cursor: pointer;
`;

export const RoleLabel = styled.label`
  display: block;
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
`;

export const RoleDescription = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1.5;
`;

export const CenterContainer = styled.div`
  padding: var(--spacing-lg);
  text-align: center;
`;

export const Separator = styled.div`
  height: 1px;
  background: var(--border-light);
  margin-bottom: var(--spacing-md);
`;

export const GroupContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

export const GroupTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  padding-left: var(--spacing-sm);
`;

export const HabilitationItem = styled.div<{ selected?: boolean }>`
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  background: ${({ selected }) => (selected ? 'rgba(0, 123, 255, 0.05)' : 'transparent')};
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.2s ease;
`;

export const HabCheckbox = styled.input`
  cursor: pointer;
`;

export const HabLabel = styled.label`
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
`;

export const PopupActionButtons = styled.div`
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
`;

export const RolesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
`;

export const RoleBadge = styled.span`
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border: 1px solid var(--border-light);
`;

export const ButtonPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  box-shadow: var(--shadow-sm);
  height: 40px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--primary-color);
  color: #ffffff;
  align-self: flex-end;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;