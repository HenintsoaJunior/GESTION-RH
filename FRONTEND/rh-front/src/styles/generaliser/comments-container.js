import styled from "styled-components";

export const CommentSection = styled.div`
    margin-bottom: var(--spacing-lg, 20px);
`;

export const CommentInputGroup = styled.div`
    position: relative;
    margin-bottom: var(--spacing-xs, 5px);
`;

export const CommentButton = styled.button`
    padding: var(--spacing-sm, 10px) var(--spacing-lg, 20px);
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 500;
    min-width: auto;
    background-color: var(--primary-color, #007bff);
    color: #ffffff;
    border: 1px solid var(--primary-color, #007bff);
    border-radius: var(--radius-md, 6px);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
        background-color: #ffffff;
        color: var(--primary-color, #007bff);
        border-color: var(--primary-color, #007bff);
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background-color: var(--primary-color, #007bff);
        color: #ffffff;
        border-color: var(--primary-color, #007bff);
        box-shadow: none;
    }
`;

export const CommentText = styled.p`
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-primary, #343a40);
  margin-bottom: 5px;
`;

export const CommentLabel = styled.label`
    display: block;
    margin-bottom: var(--spacing-xs, 5px);
    font-weight: 600;
    color: var(--text-secondary, #6c757d);
    font-size: var(--font-size-sm, 0.875rem);
`;

export const CommentTextarea = styled.textarea`
    width: 100%;
    min-height: 100px;
    padding: var(--spacing-sm, 10px);
    border: 1px solid var(--border-color, #ced4da);
    border-radius: var(--radius-sm, 8px);
    font-family: inherit;
    font-size: var(--font-size-sm, 0.875rem);
    resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
        outline: none;
        border-color: var(--primary-color, #007bff);
        box-shadow: 0 0 0 2px var(--primary-shadow, rgba(0, 123, 255, 0.25));
    }
`;

export const CommentsList = styled.div`
    margin-top: var(--spacing-lg, 20px);
    max-height: 300px;
    overflow-y: auto;
    padding: var(--spacing-sm, 10px);
    background-color: var(--bg-secondary, #f9f9f9);
    border-radius: var(--radius-sm, 8px);
    border: 1px solid var(--border-light, #e0e0e0);
`;

export const CommentItem = styled.div`
    padding: var(--spacing-sm, 10px);
    border-bottom: 1px solid var(--border-light, #e0e0e0);
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm, 10px);
`;

export const CommentContent = styled.div`
    flex: 1;
`;

export const CommentMeta = styled.div`
    font-size: var(--font-size-xs, 0.75rem);
    color: var(--text-secondary, #6c757d);
`;

export const CommentActions = styled.div`
    display: flex;
    gap: var(--spacing-xs, 5px);
`;

export const CommentActionButton = styled.button`
    padding: 4px 8px;
    background-color: var(--background-light, #f8f9fa);
    border: 1px solid var(--border-light, #dee2e6);
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
    color: var(--text-secondary, #6c757d);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
        background-color: var(--primary-color, #007bff);
        color: white;
        border-color: var(--primary-color, #007bff);
    }

    &.delete {
        &:hover {
            background-color: var(--error-color, #dc3545);
            color: white;
            border-color: var(--error-color, #dc3545);
        }
    }
`;