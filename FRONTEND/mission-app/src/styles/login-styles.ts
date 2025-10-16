import styled from 'styled-components';

export const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
`;

export const LoginCard = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-3xl);
  width: 100%;
  max-width: 23rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  width: 100%;
`;

export const Logo = styled.img`
  height: 6rem;
  width: auto;
`;

export const LoginTitle = styled.h2`
  margin-bottom: var(--spacing-2xl);
  text-align: center;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
`;

export const Separator = styled.div`
  margin-bottom: var(--spacing-2xl);
  height: 1px;
  width: 100%;
  background-color: var(--border-color);
`;

export const LoginDescription = styled.p`
  margin-bottom: var(--spacing-3xl);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  width: 100%;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
`;

export const FormLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
`;

const FormInputBase = `
  height: 3rem;
  padding: 0 var(--spacing-md);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  width: 100%;
  font-size: var(--font-size-md);
  font-family: var(--font-family);
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-focus);
  }

  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FormInput = styled.input`
  ${FormInputBase}
`;

export const PasswordInput = styled.input`
  ${FormInputBase}
  padding-right: 3.5rem; /* Augmenté pour accommoder le bouton toggle sans débordement */
`;

export const PasswordHeader = styled.div`
  display: flex;
  justify-content: flex-start; /* Aligné à gauche pour cohérence avec le label username */
  align-items: center;
  width: 100%;
`;

export const PasswordInputContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden; /* Empêche tout débordement potentiel du toggle */
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: var(--spacing-sm); /* Réduit légèrement pour centrer dans l'espace padding */
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 10;
  width: 2rem;
  height: 2rem;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  font-size: var(--font-size-sm);
  text-align: center;
  color: var(--danger-color);
`;

export const LoginButton = styled.button`
  height: 3rem;
  width: 100%;
  border-radius: var(--border-radius-sm);
  background-color: var(--primary-color);
  color: var(--text-white);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  font-size: var(--font-size-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-speed);

  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
  }

  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;