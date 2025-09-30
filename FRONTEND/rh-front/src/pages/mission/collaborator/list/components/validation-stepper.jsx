"use client";
import { StepperContainer, StepItem, StepCircle, StepLabel, StepSubtitle } from "styles/generaliser/validation-stepper-container";
import { Check, Clock, X } from "lucide-react";
import styled from "styled-components";
import { formatDateTime } from "utils/dateConverter";

// New styled component for ValidationDate
const ValidationDateText = styled.p`
  margin-top: var(--spacing-xs, 5px);
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-secondary, #6c757d);
  font-style: italic;
  text-align: center;
`;

const ValidationStepper = ({ steps, currentStep, onStepClick }) => {
  const getStepIcon = (status) => {
    switch (status) {
      case "approved":
        return <Check size={16} />;
      case "in-progress":
      case "pending":
        return <Clock size={16} />;
      case "rejected":
        return <X size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <StepperContainer>
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          $status={step.status}
          $isActive={index === currentStep}
          onClick={() => onStepClick && onStepClick(index)}
        >
          <StepCircle $status={step.status}>
            {step.hasIndicator ? getStepIcon(step.status) : index + 1}
          </StepCircle>
          <StepLabel>{step.title}</StepLabel>
          <StepSubtitle>{step.subtitle}</StepSubtitle>
          {step.validationDate && (
            <ValidationDateText>
              Validé le: {formatDateTime(step.validationDate)}
            </ValidationDateText>
          )}
        </StepItem>
      ))}
    </StepperContainer>
  );
};

export default ValidationStepper;