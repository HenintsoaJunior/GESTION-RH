import React from 'react';
import { getPaginationRange, getPaginationInfo } from 'utils/pagination';

const Pagination = ({ currentPage, pageSize, totalEntries, onPageChange, onPageSizeChange }) => {
  const totalPages = Math.ceil(totalEntries / pageSize);
  const pages = getPaginationRange(currentPage, totalPages);
  const { startEntry, endEntry } = getPaginationInfo(currentPage, pageSize, totalEntries);

  return (
    <div className="pagination-container">
      <div className="pagination-options">
        <label htmlFor="pageSize" className="pagination-label">Afficher par page :</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={onPageSizeChange}
          className="pagination-select"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
      <div className="pagination-info">
        Affichage des données {startEntry} à {endEntry} sur {totalEntries} entrées
      </div>
      <div className="pagination-controls">
        {pages.map((page) => (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Pagination;