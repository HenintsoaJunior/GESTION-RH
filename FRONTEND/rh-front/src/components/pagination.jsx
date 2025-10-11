import React from 'react';
// Assurez-vous que ces chemins sont corrects pour votre projet
import { getPaginationRange, getPaginationInfo } from 'utils/pagination';
import 'styles/pagination.css';

// 💡 Définition des props avec des valeurs par défaut pour les callbacks
const Pagination = ({ 
  currentPage, 
  pageSize, 
  totalEntries, 
  // Sécuriser les callbacks en leur donnant une fonction vide par défaut
  onPageChange = () => {}, 
  onPageSizeChange = () => {} 
}) => {
  const totalPages = Math.ceil(totalEntries / pageSize);
  const { startEntry, endEntry } = getPaginationInfo(currentPage, pageSize, totalEntries);
  
  // Générer la liste des pages visibles (y compris '...')
  const pages = getPaginationRange(currentPage, Math.max(totalPages, 1)); 

  // --- Fonctions de gestion ---

  // Gère le clic sur un numéro de page.
  const handlePageNumberChange = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Gère les clics sur les flèches Précédent/Suivant.
  const handleArrowChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      onPageChange(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 🔴 CORRECTION ICI : Passer l'objet Event complet (e) au parent
  // Le composant parent s'attend à recevoir l'objet event pour lire e.target.value
  const handleSizeChange = (e) => {
    // onPageSizeChange doit être la fonction du parent qui gère l'événement
    onPageSizeChange(e); 
  };

  // --- Rendu des Boutons ---

  const renderPageButtons = () => {
    const buttons = [];
    
    // Bouton 'Précédent'
    buttons.push(
      <button
        key="prev"
        className="pagination-button pagination-arrow-btn"
        onClick={() => handleArrowChange('prev')}
        disabled={currentPage === 1}
        aria-label="Page précédente"
      >
        &lt;
      </button>
    );

    // Boutons de pages (numéros et '...')
    pages.forEach((page, index) => {
      if (page === '...') {
        buttons.push(
          <span 
            key={`ellipsis-${index}`} 
            className="pagination-ellipsis"
            aria-hidden="true"
          >
            ...
          </span>
        );
      } else {
        buttons.push(
          <button
            key={page}
            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
            onClick={() => handlePageNumberChange(page)}
            disabled={page === currentPage}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      }
    });

    // Bouton 'Suivant'
    buttons.push(
      <button
        key="next"
        className="pagination-button pagination-arrow-btn"
        onClick={() => handleArrowChange('next')}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
      >
        &gt;
      </button>
    );

    return buttons;
  };

  return (
    <div className="pagination-container" role="navigation" aria-label="Pagination des résultats">
      {/* 1. Sélecteur de taille de page */}
      <div className="page-size-selector"> 
        <label htmlFor="pageSize" className="pagination-label">Afficher par page :</label>
        <select
          id="pageSize"
          value={String(pageSize)} 
          onChange={handleSizeChange} 
        >
          {/* Les valeurs des options doivent être des chaînes */}
          <option value="3">3</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
      
      {/* 2. Information sur les entrées */}
      <div className="pagination-info" role="status">
        Affichage des données {startEntry} à {endEntry} sur {totalEntries} entrées
      </div>
      
      {/* 3. Contrôles de pagination (Boutons) */}
      <div className="pagination-buttons">
        {renderPageButtons()}
      </div>
    </div>
  );
};

export default Pagination;