import styled from 'styled-components';

export const ProfilePageContainer = styled.div`
  font-family: var(--font-family);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  padding: var(--spacing-2xl);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: var(--spacing-lg);
  }
`;

export const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: var(--bg-primary);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-md);
  overflow: hidden;
`;

export const ProfileHeader = styled.div`
  background: var(--primary-gradient);
  padding: var(--spacing-4xl) var(--spacing-3xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-3xl) var(--spacing-2xl);
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-lg);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }
`;

export const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`;

export const AvatarText = styled.span`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-white);
`;

export const ProfileHeaderInfo = styled.div`
  flex: 1;
  position: relative;
  z-index: 1;
`;

export const ProfileTitle = styled.h1`
  font-size: 2rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-white);
  margin: 0 0 var(--spacing-sm) 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const ProfileSubtitle = styled.p`
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  opacity: 0.9;

  @media (max-width: 480px) {
    font-size: var(--font-size-md);
  }
`;

export const ProfileContent = styled.div`
  padding: var(--spacing-4xl) var(--spacing-3xl);

  @media (max-width: 768px) {
    padding: var(--spacing-3xl) var(--spacing-2xl);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }
`;

export const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-2xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

export const ProfileField = styled.div`
  background: var(--bg-tertiary);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary-color);
  position: relative;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: var(--spacing-lg);
  }
`;

export const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

export const FieldIcon = styled.div`
  font-size: var(--font-size-lg);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: var(--radius-sm);
`;

export const FieldLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const FieldValue = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  word-break: break-word;
`;

export const FieldEmpty = styled.span`
  color: var(--text-muted);
  font-style: italic;
  font-weight: var(--font-weight-normal);
`;

export const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl);
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
`;

export const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  text-align: center;
`;

export const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
`;

export const ErrorText = styled.p`
  font-size: var(--font-size-xl);
  color: var(--danger-color);
  margin: 0 0 var(--spacing-2xl) 0;
  font-weight: var(--font-weight-medium);
`;

export const ErrorButton = styled.button`
  padding: var(--spacing-lg) var(--spacing-2xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  box-shadow: var(--shadow-sm);
  background-color: var(--primary-color);
  color: #ffffff;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--primary-hover);
  }
`;