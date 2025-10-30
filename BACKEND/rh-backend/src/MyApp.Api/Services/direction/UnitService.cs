using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using MyApp.Api.Repositories.direction;
using MyApp.Api.Utils.generator;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MyApp.Api.Services.direction
{
    public interface IUnitService
    {
        Task<(IEnumerable<Unit>, int)> SearchAsync(UnitSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Unit>> GetAllAsync();
        Task<Unit?> GetByIdAsync(string id);
        Task<IEnumerable<Unit>> GetByServiceAsync(string serviceId);
        Task<Unit> AddAsync(UnitDTOForm dto);
        Task UpdateAsync(Unit unit);
        Task DeleteAsync(string id);
    }

    public class UnitService : IUnitService
    {
        private readonly IUnitRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<UnitService> _logger;

        public UnitService(
            IUnitRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<UnitService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<(IEnumerable<Unit>, int)> SearchAsync(UnitSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des unités avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des unités");
                throw;
            }
        }

        public async Task<IEnumerable<Unit>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les unités");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des unités");
                throw;
            }
        }

        public async Task<Unit?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une unité avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de l'unité avec l'ID: {UnitId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'unité avec l'ID: {UnitId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<Unit>> GetByServiceAsync(string serviceId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(serviceId))
                {
                    _logger.LogWarning("Tentative de récupération des unités avec un ID de service null ou vide");
                    return Enumerable.Empty<Unit>();
                }

                _logger.LogInformation("Récupération des unités par service: {ServiceId}", serviceId);
                return await _repository.GetByServiceAsync(serviceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des unités par service: {ServiceId}", serviceId);
                throw;
            }
        }

        public async Task<Unit> AddAsync(UnitDTOForm dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO d'unité ne peut pas être null");
                }

                var unitId = _sequenceGenerator.GenerateSequence("seq_unit_id", "UNT", 6, "-");

                var unit = new Unit(dto) { UnitId = unitId };

                await _repository.AddAsync(unit);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Unité ajoutée avec succès avec l'ID: {UnitId}", unit.UnitId);
                return unit;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout de l'unité");
                throw;
            }
        }

        public async Task UpdateAsync(Unit unit)
        {
            try
            {
                if (unit == null)
                {
                    throw new ArgumentNullException(nameof(unit), "L'unité ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(unit.UnitId))
                {
                    throw new ArgumentException("L'ID de l'unité ne peut pas être null ou vide", nameof(unit.UnitId));
                }

                await _repository.UpdateAsync(unit);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Unité mise à jour avec succès pour l'ID: {UnitId}", unit.UnitId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'unité avec l'ID: {UnitId}", unit?.UnitId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de l'unité ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Unité supprimée avec succès pour l'ID: {UnitId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'unité avec l'ID: {UnitId}", id);
                throw;
            }
        }
    }
}