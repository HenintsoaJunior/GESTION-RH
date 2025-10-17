import styled from 'styled-components';
import { Lock } from 'lucide-react';

// Styled Components
const ErrorContainer = styled.div`
  font-family: 'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: transparent;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0;
    margin: 0;
    min-height: 400px;
  }
`;

const IconWrapper = styled.div`
  width: 120px;
  height: 120px;
  background: rgba(105, 180, 46, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  svg {
    width: 60px;
    height: 60px;
    color: #e4002b;
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    
    svg {
      width: 50px;
      height: 50px;
    }
  }
`;

const ErrorCode = styled.h1`
  font-size: 64px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: #e4002b;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const ErrorDescription = styled.p`
  font-size: 16px;
  color: #63666a;
  margin: 0 0 32px 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 14px;
    margin: 0 0 24px 0;
  }
`;

// Component
export default function Error403Page() {
  
  return (
    <ErrorContainer>
      <IconWrapper>
        <Lock strokeWidth={1.5} />
      </IconWrapper>

      <ErrorCode>403</ErrorCode>
      <ErrorTitle>Accès Refusé</ErrorTitle>
      <ErrorDescription>
        Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
      </ErrorDescription>
    </ErrorContainer>
  );
}