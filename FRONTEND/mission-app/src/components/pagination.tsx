import React from 'react';
import { getPaginationRange, getPaginationInfo } from '@/utils/pagination';
import {
  PaginationContainer,
  PageSizeSelector,
  PaginationLabel,
  Select,
  PaginationInfo,
  PaginationButtons,
  PaginationButton,
  PaginationEllipsis,
} from '@/styles/pagination-styles';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalEntries: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  pageSize, 
  totalEntries, 
  onPageChange = () => {}, 
  onPageSizeChange = () => {} 
}) => {
  const totalPages = Math.ceil(totalEntries / pageSize);
  const { startEntry, endEntry } = getPaginationInfo(currentPage, pageSize, totalEntries);
  
  const pages: (number | '...')[] = getPaginationRange(currentPage, Math.max(totalPages, 1)); 

  const handlePageNumberChange = (page: number | '...') => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleArrowChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      onPageChange(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(e); 
  };

  const renderPageButtons = () => {
    const buttons: React.ReactNode[] = [];
    
    buttons.push(
      <PaginationButton
        key="prev"
        $isArrow
        onClick={() => handleArrowChange('prev')}
        disabled={currentPage === 1}
        aria-label="Page précédente"
      >
        &lt;
      </PaginationButton>
    );

    pages.forEach((page, index) => {
      if (page === '...') {
        buttons.push(
          <PaginationEllipsis 
            key={`ellipsis-${index}`} 
            aria-hidden="true"
          >
            ...
          </PaginationEllipsis>
        );
      } else {
        buttons.push(
          <PaginationButton
            key={page}
            $isActive={currentPage === page}
            onClick={() => handlePageNumberChange(page)}
            disabled={page === currentPage}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </PaginationButton>
        );
      }
    });

    buttons.push(
      <PaginationButton
        key="next"
        $isArrow
        onClick={() => handleArrowChange('next')}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
      >
        &gt;
      </PaginationButton>
    );

    return buttons;
  };

  return (
    <PaginationContainer role="navigation" aria-label="Pagination des résultats">
      <PageSizeSelector> 
        <PaginationLabel htmlFor="pageSize">Afficher par page :</PaginationLabel>
        <Select
          id="pageSize"
          value={String(pageSize)} 
          onChange={handleSizeChange} 
        >
          <option value="3">3</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Select>
      </PageSizeSelector>
      
      <PaginationInfo role="status">
        Affichage des données {startEntry} à {endEntry} sur {totalEntries} entrées
      </PaginationInfo>
      
      <PaginationButtons>
        {renderPageButtons()}
      </PaginationButtons>
    </PaginationContainer>
  );
};

export default Pagination;