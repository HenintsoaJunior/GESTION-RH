import styled, { css } from "styled-components";

export const ValidateursPageContainer = styled.div`
    background: var(--bg-primary);
    border-radius: 0;
    margin-top: 0;
    margin-bottom: var(--spacing-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    
    border: none; 
    border-top: 5px solid var(--border-color);
    overflow: hidden;
    box-sizing: border-box;

    padding-left: var(--spacing-3xl);
    padding-right: var(--spacing-3xl);
    padding-bottom: var(--spacing-lg);
    padding-top: var(--spacing-md); 

    @media (max-width: 768px) {
        padding-left: var(--spacing-sm);
        padding-right: var(--spacing-sm);
        padding-bottom: var(--spacing-md);
        border-top: 3px solid var(--border-color);
    }

    @media (max-width: 480px) {
        padding-left: var(--spacing-xs);
        padding-right: var(--spacing-xs);
    }
`;

export const ValidateursHeader = styled.header`
    margin-bottom: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: var(--spacing-md);

    @media (max-width: 768px) {
        margin-bottom: var(--spacing-md);
        flex-direction: column;
        gap: var(--spacing-sm);
    }
`;

export const ValidateursTitle = styled.h1`
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
    min-width: 0;
    
    @media (max-width: 768px) {
        font-size: var(--font-size-lg);
        width: 100%;
    }

    @media (max-width: 480px) {
        font-size: var(--font-size-md);
        gap: var(--spacing-xs);
    }
`;

export const HeaderStats = styled.div`
    display: flex;
    gap: var(--spacing-lg);
    flex-wrap: wrap;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
        gap: var(--spacing-md);
    }

    @media (max-width: 480px) {
        gap: var(--spacing-sm);
    }
`;

export const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;

    @media (max-width: 768px) {
        min-width: 70px;
    }

    @media (max-width: 480px) {
        min-width: 60px;
    }
`;

export const StatValue = styled.div<{ $color?: string }>`
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: ${({ $color }) => $color || 'var(--text-color)'};
    line-height: 1;

    @media (max-width: 768px) {
        font-size: var(--font-size-md);
    }

    @media (max-width: 480px) {
        font-size: var(--font-size-sm);
    }
`;

export const StatLabel = styled.div`
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-top: 4px;
    text-align: center;

    @media (max-width: 480px) {
        font-size: 10px;
    }
`;

export const DirectionsNav = styled.nav`
    margin-bottom: var(--spacing-lg);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-md);
    }

    @media (max-width: 480px) {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 4px;
    }
`;

export const DirectionButton = styled.button<{ $isActive?: boolean }>`
    padding: 8px 12px;
    background: ${({ $isActive }) => 
        $isActive ? 'var(--primary-bg)' : 'transparent'};
    color: ${({ $isActive }) => 
        $isActive ? 'var(--primary-color)' : 'var(--text-secondary)'};
    border: 1px solid ${({ $isActive }) => 
        $isActive ? 'var(--primary-border)' : 'var(--border-color)'};
    font-size: var(--font-size-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;

    &:hover {
        background: var(--primary-light);
        color: var(--primary-color);
        border-color: var(--primary-border);
    }

    @media (max-width: 768px) {
        padding: 6px 8px;
        font-size: 11px;
    }

    @media (max-width: 480px) {
        padding: 4px 6px;
        font-size: 10px;
    }
`;

// Tableau responsive
export const ValidateursTable = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    width: 100%;
    overflow-x: auto;

    @media (max-width: 768px) {
        gap: var(--spacing-xs);
    }
`;

export const TableHeader = styled.div`
    display: grid;
    grid-template-columns: 250px 180px 1fr 220px;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-light);
    border: 1px solid var(--border-color);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 850px;

    @media (max-width: 1200px) {
        grid-template-columns: 220px 160px 1fr 200px;
        gap: var(--spacing-sm);
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

export const ValidateurRow = styled.div<{ $isActive: boolean }>`
    display: grid;
    grid-template-columns: 250px 180px 1fr 220px;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s ease;
    align-items: center;
    min-width: 850px;

    &:hover {
        background: var(--bg-light);
        border-color: var(--primary-border);
    }

    ${({ $isActive }) => !$isActive && css`
        opacity: 0.7;
        background: var(--bg-secondary);
    `}

    @media (max-width: 1200px) {
        grid-template-columns: 220px 160px 1fr 200px;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
    }

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        align-items: stretch;
        min-width: 100%;
    }

    @media (max-width: 480px) {
        padding: var(--spacing-sm);
        gap: var(--spacing-xs);
    }
`;

// Styles pour les cellules
export const Cell = styled.div<{ $align?: 'left' | 'center' | 'right' }>`
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    text-align: ${({ $align }) => $align || 'left'};
    overflow: hidden;
    
    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
        width: 100%;
        text-align: left;
        padding: var(--spacing-xs) 0;
        border-bottom: 1px solid var(--border-light);
        
        &:last-child {
            border-bottom: none;
        }
        
        &::before {
            content: attr(data-label);
            font-size: var(--font-size-xs);
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 4px;
            width: 100%;
        }
    }
`;

export const ValidateurInfo = styled(Cell)`
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 0;

    @media (max-width: 768px) {
        flex-direction: row;
        align-items: center;
        gap: var(--spacing-sm);
        
        &::before {
            display: none;
        }
    }
`;

export const ValidateurAvatar = styled.div<{ $isActive?: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ $isActive }) => 
        $isActive 
            ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)'
            : 'var(--bg-secondary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;

    @media (max-width: 480px) {
        width: 36px;
        height: 36px;
        font-size: 12px;
    }
`;

export const ValidateurName = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
`;

export const ValidateurFullName = styled.div<{ $isActive: boolean }>`
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: ${({ $isActive }) => 
        $isActive ? 'var(--text-color)' : 'var(--text-tertiary)'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 480px) {
        font-size: var(--font-size-xs);
    }
`;

export const ValidateurMatricule = styled.div<{ $isActive: boolean }>`
    font-size: var(--font-size-xs);
    color: ${({ $isActive }) => 
        $isActive ? 'var(--text-secondary)' : 'var(--text-tertiary)'};

    @media (max-width: 480px) {
        font-size: 10px;
    }
`;

export const DirectionCell = styled(Cell)`
    font-size: var(--font-size-sm);
    color: var(--text-color);
    font-weight: 500;

    @media (max-width: 768px) {
        font-size: var(--font-size-xs);
    }
`;

export const PosteCell = styled(Cell)`
    font-size: var(--font-size-sm);
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 768px) {
        font-size: var(--font-size-xs);
    }
`;

export const RemplacantsCell = styled(Cell)`
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
`;

export const RemplacantsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    @media (max-width: 768px) {
        gap: 6px;
    }

    @media (max-width: 480px) {
        gap: 4px;
    }
`;

export const RemplacantItem = styled.div<{ $estActif: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: ${({ $estActif }) => 
        $estActif ? 'var(--primary-light)' : 'var(--bg-secondary)'};
    border: 1px solid ${({ $estActif }) => 
        $estActif ? 'var(--primary-border)' : 'var(--border-color)'};
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 0;
    flex-shrink: 0;
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
        padding: 3px 6px;
        gap: 4px;
        border-radius: 12px;
    }

    @media (max-width: 480px) {
        padding: 2px 4px;
        gap: 3px;
    }
`;

export const RemplacantAvatar = styled.div<{ $estActif: boolean }>`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${({ $estActif }) => 
        $estActif 
            ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)'
            : 'var(--bg-tertiary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;

    @media (max-width: 768px) {
        width: 24px;
        height: 24px;
        font-size: 10px;
    }

    @media (max-width: 480px) {
        width: 22px;
        height: 22px;
        font-size: 9px;
    }
`;

export const RemplacantInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    overflow: hidden;
`;

export const RemplacantName = styled.div`
    font-size: 11px;
    font-weight: 500;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;

    @media (max-width: 768px) {
        font-size: 10px;
        max-width: 60px;
    }

    @media (max-width: 480px) {
        font-size: 9px;
        max-width: 50px;
    }
`;

export const RemplacantOrdre = styled.div`
    font-size: 9px;
    font-weight: 600;
    color: var(--primary-color);

    @media (max-width: 480px) {
        font-size: 8px;
    }
`;

// Modal pour les détails du validateur
export const DetailsModal = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    top: 0;
    right: ${({ $isOpen }) => $isOpen ? '0' : '-400px'};
    width: 400px;
    height: 100vh;
    background: var(--bg-primary);
    border-left: 1px solid var(--border-color);
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    @media (max-width: 768px) {
        width: 100%;
        right: ${({ $isOpen }) => $isOpen ? '0' : '-100%'};
    }
`;

export const ModalHeader = styled.div`
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-light);
`;

export const ModalTitle = styled.h3`
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
`;

export const ModalContent = styled.div`
    padding: var(--spacing-md);
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
`;

export const ModalSection = styled.div`
    background: var(--bg-light);
    border: 1px solid var(--border-color);
    padding: var(--spacing-md);
`;

export const SectionTitle = styled.h4`
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const LoadingState = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    font-size: var(--font-size-md);
    color: var(--text-secondary);
    width: 100%;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    text-align: center;
    gap: var(--spacing-md);
`;

export const EmptyIcon = styled.div`
    color: var(--text-tertiary);
    opacity: 0.5;
`;

export const EmptyText = styled.div`
    font-size: var(--font-size-md);
    color: var(--text-secondary);
`;