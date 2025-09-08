"use client";
import { StepperContainer, StepItem, StepCircle, StepLabel, StepSubtitle } from "styles/generaliser/validation-stepper-container";
import { Check, Clock, X } from "lucide-react";

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
        return null;
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
        </StepItem>
      ))}
    </StepperContainer>
  );
};

export default ValidationStepper;