"use client";

import React from "react";
import { StepperContainer, StepItem, StepCircle, StepLabel, StepSubtitle, ValidationDateText } from "@/styles/stepper-styles";
import { Check, Clock, X } from "lucide-react";
import { formatDateTime } from "@/utils/date-converter";

interface Step {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  hasIndicator: boolean;
  validationDate?: string;
  validator: {
    name: string;
  };
}

interface ValidationStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

const ValidationStepper: React.FC<ValidationStepperProps> = ({ steps, currentStep, onStepClick }) => {
  const getStepIcon = (status: string) => {
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
      {steps.map((step: Step, index: number) => (
        <StepItem
          key={step.id}
          $status={step.status}
          $isActive={index === currentStep}
          onClick={() => onStepClick && onStepClick(index)}
        >
          <StepCircle $status={step.status}>
            {step.hasIndicator ? getStepIcon(step.status) : index + 1}
          </StepCircle>
          <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', fontWeight: '500' }}>
            {step.validator.name}
          </div>
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