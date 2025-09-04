"use client"

import { StepperContainer, StepItem, StepCircle, StepLabel, StepSubtitle } from "styles/generaliser/validation-stepper-container"

const ValidationStepper = ({ steps, currentStep, onStepClick }) => {
  return (
    <StepperContainer>
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          clickable={index <= currentStep}
          completed={index < currentStep}
          onClick={() => onStepClick && onStepClick(index)}
        >
          <StepCircle status={step.status} hasIndicator={step.hasIndicator}>
            {step.hasIndicator ? "✓" : index + 1}
          </StepCircle>
          <StepLabel>{step.title}</StepLabel>
          <StepSubtitle>{step.subtitle}</StepSubtitle>
        </StepItem>
      ))}
    </StepperContainer>
  )
}

export default ValidationStepper
