import styled from "styled-components"

export const StepperContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
`

export const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  cursor: ${(props) => (props.clickable ? "pointer" : "default")};
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 20px;
    right: -50%;
    width: 100%;
    height: 2px;
    background-color: ${(props) => (props.completed ? "var(--success-color)" : "var(--border-color)")};
    z-index: 1;
  }
`

export const StepCircle = styled.div`
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
  
  background-color: ${(props) => {
    if (props.status === "approved") return "var(--success-color)"
    if (props.status === "in-progress") return "var(--erp-primary)"
    return "var(--text-muted)"
  }};
  
  color: white;
  
  ${(props) =>
    props.hasIndicator &&
    `
    &::after {
      content: '✓';
      position: absolute;
      font-size: 0.8rem;
    }
  `}
`

export const StepLabel = styled.div`
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`

export const StepSubtitle = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
`
