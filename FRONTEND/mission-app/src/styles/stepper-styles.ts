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
  padding: var(--spacing-sm) 0; /* Réduit de md à sm pour compacité */

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 28px; /* Ajusté pour le cercle plus petit (32px) */
    right: -50%;
    width: 100%; /* Garde la largeur pour connexion fluide */
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
    padding: var(--spacing-xs) 0; /* Encore plus compact sur mobile */

    &:not(:last-child)::after {
      top: -50%;
      right: auto;
      bottom: 16px; /* Réduit pour cercle plus petit */
      left: 16px; /* Moins d'espace à gauche */
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
  margin: var(--spacing-md) 0; /* Réduit de lg à md */
  padding: 0 var(--spacing-lg); /* Latéraux réduits de 3xl à lg ; top/bottom gérés séparément */
  font-family: var(--font-family);

  background: var(--bg-primary);
  border-radius: 0;
  margin-top: 0;
  margin-bottom: var(--spacing-md); /* Réduit de lg à md */
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  border: none;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: var(--spacing-md); /* Réduit de lg à md */
  padding-top: var(--spacing-sm); /* Réduit de md à sm */

  @media (max-width: 768px) {
    padding-left: var(--spacing-sm); /* Réduit de md à sm */
    padding-right: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    flex-direction: column;
    gap: var(--spacing-sm); /* Ajout d'un gap réduit pour espacer les étapes verticalement */
  }
`;

export const StepCircle = styled.div<StepCircleProps>`
  width: 32px; /* Réduit de 40px à 32px pour compacité */
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem; /* Légèrement réduit pour fitting */
  position: relative;
  z-index: 2;
  margin-bottom: 0.25rem; /* Réduit de 0.5rem à 0.25rem */
  font-family: var(--font-family);

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

  border: 2px solid ${({ $status }) => { /* Réduit de 3px à 2px */
    if ($status === "approved") return "var(--success-color)";
    if ($status === "in-progress" || $status === "pending") return "var(--warning-color)";
    if ($status === "rejected") return "var(--error-color)";
    return "var(--border-light)";
  }};

  transition: all 0.3s ease;
`;

export const StepLabel = styled.div`
  text-align: center;
  font-size: 0.85rem; /* Légèrement réduit de 0.9rem */
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.125rem; /* Réduit de 0.25rem */
  font-family: var(--font-family);
`;

export const StepSubtitle = styled.div`
  text-align: center;
  font-size: 0.75rem; /* Réduit de 0.8rem */
  color: var(--text-muted);
  font-family: var(--font-family);
`;

export const ValidationDateText = styled.p`
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs); /* Réduit de sm à xs pour plus de densité */
  color: var(--text-secondary);
  text-align: center;
  font-family: var(--font-family);
`;