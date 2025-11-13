// src/styles/calendar-styles.ts
import styled from "styled-components";

export const CalendarContainer = styled.div`
  height: 600px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  overflow: hidden;
  background-color: var(--bg-primary, #ffffff);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  .rbc-calendar {
    height: 100%;
    font-family: inherit;
  }

  .rbc-toolbar {
    background: linear-gradient(135deg, var(--primary-color, #007bff) 0%, var(--primary-dark, #0056b3) 100%);
    border-bottom: none;
    padding: var(--spacing-lg, 1.5rem) var(--spacing-md, 1rem);
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .rbc-btn-group {
      display: flex;
      gap: var(--spacing-sm, 0.5rem);

      button {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
        border-radius: var(--border-radius, 4px);
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s ease;

        &:hover {
          background-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    .rbc-toolbar-label {
      font-weight: var(--font-weight-semibold, 600);
      font-size: 1.25rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  .rbc-month-view,
  .rbc-week-view,
  .rbc-day-view {
    background-color: var(--bg-primary, #ffffff);
  }

  .rbc-day-bg {
    background-color: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-color, #ddd);
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--primary-light, #cce7ff);
    }
  }

  .rbc-event {
    background: linear-gradient(135deg, var(--primary-color, #007bff) 0%, var(--primary-dark, #0056b3) 100%);
    border: none;
    border-radius: var(--border-radius, 4px);
    padding: 4px 8px;
    font-size: 0.75rem;
    color: white;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.25);
    transition: all 0.2s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
      z-index: 10;
    }
  }

  .rbc-selected {
    background: linear-gradient(135deg, var(--primary-dark, #0056b3) 0%, var(--primary-color, #007bff) 100%) !important;
    box-shadow: 0 0 0 2px rgba(105, 180, 46, 0.3) !important;
  }

  .rbc-today {
    background-color: var(--primary-light, #cce7ff);
    font-weight: var(--font-weight-semibold, 600);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid var(--primary-color, #007bff);
      border-radius: var(--border-radius, 4px);
      pointer-events: none;
    }
  }

  .rbc-header {
    background-color: var(--bg-secondary, #f8f9fa);
    color: var(--text-color, #333);
    font-weight: var(--font-weight-semibold, 600);
    padding: var(--spacing-md, 1rem);
    border-bottom: 1px solid var(--border-color, #ddd);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
  }

  .rbc-off-range-bg {
    background-color: var(--bg-tertiary, #f5f5f5);
    opacity: 0.5;
  }

  .rbc-time-header-cell {
    border-left: 1px solid var(--border-color, #ddd);
  }

  .rbc-time-header-content {
    padding: 0 var(--spacing-sm, 0.5rem);
  }

  .rbc-time-content {
    border-top: 1px solid var(--border-color, #ddd);
  }

  .rbc-show-more {
    background-color: var(--primary-color, #007bff);
    color: white;
    cursor: pointer;
    padding: var(--spacing-sm, 0.5rem);
    border-radius: var(--border-radius, 4px);
    font-size: 0.75rem;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--primary-dark, #0056b3);
    }
  }
`;