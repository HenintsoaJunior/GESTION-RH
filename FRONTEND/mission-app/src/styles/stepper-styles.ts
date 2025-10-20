import styled from "styled-components";

interface StepItemProps {
  $status?: string;
  $isActive?: boolean;
}

interface StepCircleProps {
  $status?: string;
}

export const StepItem = styled.div<StepItemProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  cursor: ${({ $isActive }) => ($isActive ? "pointer" : "default")};
  padding: var(--spacing-md) 0;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 35px;
    right: -50%;
    width: 100%;
    height: 2px;
    background-color: ${({ $status }) =>
      $status === "approved" ? "var(--success-color)" : "var(--border-color)"};
    z-index: 1;
  }

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    flex: none;
    width: 100%;

    &:not(:last-child)::after {
      top: -50%;
      right: auto;
      bottom: 20px;
      left: 20px;
      width: 2px;
      height: 100%;
      background-color: ${({ $status }) =>
        $status === "approved" ? "var(--success-color)" : "var(--border-color)"};
    }
  }
`;

export const StepperContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  margin: var(--spacing-lg) 0;
  padding: 0;

  background: var(--bg-primary);
  border-radius: 0;
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  border: none;
  overflow: hidden;
  box-sizing: border-box;
  padding-left: var(--spacing-3xl);
  padding-right: var(--spacing-3xl);
  padding-bottom: var(--spacing-lg);
  padding-top: var(--spacing-md);

  @media (max-width: 768px) {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
    padding-bottom: var(--spacing-md);
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

export const StepCircle = styled.div<StepCircleProps>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  z-index: 2;
  margin-bottom: 0.5rem;

  background-color: ${({ $status }) => {
    if ($status === "approved") return "var(--success-color)";
    if ($status === "in-progress" || $status === "pending") return "var(--warning-color)";
    if ($status === "rejected") return "var(--error-color)";
    return "var(--bg-secondary)";
  }};

  color: ${({ $status }) => 
    $status === "approved" || $status === "rejected" || $status === "in-progress" || $status === "pending" 
      ? "white" 
      : "var(--text-primary)"
  };

  border: 3px solid ${({ $status }) => {
    if ($status === "approved") return "var(--success-color)";
    if ($status === "in-progress" || $status === "pending") return "var(--warning-color)";
    if ($status === "rejected") return "var(--error-color)";
    return "var(--border-light)";
  }};

  transition: all 0.3s ease;
`;

export const StepLabel = styled.div`
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

export const StepSubtitle = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
`;

export const ValidationDateText = styled.p`
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-style: italic;
  text-align: center;
`;