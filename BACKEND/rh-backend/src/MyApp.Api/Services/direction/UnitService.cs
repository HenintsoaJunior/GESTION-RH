using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.direction;
using MyApp.Api.Repositories.direction;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.direction
{
    public interface IUnitService
    {
        Task<IEnumerable<Unit>> GetAllAsync();
        Task<Unit?> GetByIdAsync(string id);
        Task<IEnumerable<Unit>> GetByServiceAsync(string serviceId);
        Task AddAsync(Unit unit);
        Task UpdateAsync(string id, Unit unit);
        Task DeleteAsync(string id);
    }

    public class UnitService : IUnitService
    {
        private readonly IUnitRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<UnitService> _logger;

        public UnitService(
            IUnitRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<UnitService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
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

        public async Task AddAsync(Unit unit)
        {
            try
            {
                if (unit == null)
                {
                    throw new ArgumentNullException(nameof(unit), "L'unité ne peut pas être null");
                }

                unit.UnitId = _sequenceGenerator.GenerateSequence("seq_unit_id", "UNT", 6, "-");
                _logger.LogInformation("ID généré pour l'unité: {UnitId}", unit.UnitId);

                await _repository.AddAsync(unit);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Unité ajoutée avec succès avec l'ID: {UnitId}", unit.UnitId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout de l'unité");
                throw;
            }
        }

        public async Task UpdateAsync(string id, Unit unit)
        {
            try
            {
                if (unit == null)
                {
                    throw new ArgumentNullException(nameof(unit), "L'unité ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de l'unité ne peut pas être null ou vide", nameof(id));
                }

                var existingUnit = await _repository.GetByIdAsync(id);
                if (existingUnit == null)
                {
                    throw new ArgumentException("L'unité n'existe pas", nameof(id));
                }

                unit.UnitId = id; // Conserver l'ID existant
                await _repository.UpdateAsync(unit);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Unité mise à jour avec succès pour l'ID: {UnitId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'unité avec l'ID: {UnitId}", id);
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