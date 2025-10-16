// alert-styles.ts
import styled, { css, keyframes } from "styled-components";
import { X } from "lucide-react";

const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const progress = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

export const AlertContainer = styled.div`
  position: fixed;
  bottom: var(--spacing-2xl);
  right: var(--spacing-2xl);
  z-index: 9999;
  font-family: var(--font-family);
  max-width: 420px;
  pointer-events: none;
  transition: bottom 0.3s ease;

  & + & {
    bottom: calc(var(--spacing-2xl) + 90px);
  }

  & + & + & {
    bottom: calc(var(--spacing-2xl) + 180px);
  }

  @media (max-width: 768px) {
    right: var(--spacing-lg);
    bottom: var(--spacing-lg);
    max-width: calc(100% - 2 * var(--spacing-lg));
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const AlertProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--alert-border-color);
  border-radius: 2px;
  animation: ${progress} 5s linear forwards;
  opacity: 0.5;
  transition: opacity 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

interface AlertStyledProps {
  $type: "success" | "error" | "warning" | "info";
  $closing: boolean;
}

export const AlertStyled = styled.div<AlertStyledProps>`
  background: var(--alert-bg-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--alert-border-color);
  border-left: 4px solid var(--alert-border-color);
  overflow: hidden;
  position: relative;
  width: 100%;
  pointer-events: auto;
  transform: translateX(100%);
  opacity: 0;
  animation: ${slideInRight} 0.3s ease-out forwards;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  ${({ $type }) => {
    switch ($type) {
      case "success":
        return css`
          --alert-bg-color: var(--success-bg);
          --alert-border-color: var(--success-border);
          --alert-text-color: var(--success-text);
          --alert-icon-color: var(--success-icon);
          --alert-icon-bg: var(--success-icon-bg);
        `;
      case "error":
        return css`
          --alert-bg-color: var(--error-bg);
          --alert-border-color: var(--error-border);
          --alert-text-color: var(--error-text);
          --alert-icon-color: var(--error-icon);
          --alert-icon-bg: var(--error-icon-bg);
        `;
      case "warning":
        return css`
          --alert-bg-color: var(--warning-bg);
          --alert-border-color: var(--warning-border);
          --alert-text-color: var(--warning-text);
          --alert-icon-color: var(--warning-icon);
          --alert-icon-bg: var(--warning-icon-bg);
        `;
      case "info":
      default:
        return css`
          --alert-bg-color: var(--info-bg);
          --alert-border-color: var(--info-border);
          --alert-text-color: var(--info-text);
          --alert-icon-color: var(--info-icon);
          --alert-icon-bg: var(--info-icon-bg);
        `;
    }
  }}

  ${({ $closing }) =>
    $closing &&
    css`
      animation: ${slideOutRight} 0.25s ease-in forwards;
    `}

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-2px);
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    ${AlertProgress} {
      animation-play-state: paused;
      opacity: 0.7;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

export const AlertContent = styled.div`
  padding: var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }
`;

export const AlertIcon = styled.div`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--alert-icon-bg);
  color: var(--alert-icon-color);
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: var(--font-size-xs);
  }
`;

export const AlertMessage = styled.div`
  flex: 1;
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--alert-text-color);
  line-height: 1.5;
  margin-top: var(--spacing-sm);
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: var(--font-size-xs);
  }
`;

export const AlertClose = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--alert-text-color);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  opacity: 0.7;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-xs);

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 3px;
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    padding: var(--spacing-xs);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const CloseIcon = styled(X)`
  color: inherit;
`;