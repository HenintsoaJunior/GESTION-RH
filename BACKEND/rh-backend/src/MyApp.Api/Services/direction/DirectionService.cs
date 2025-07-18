using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.direction;
using MyApp.Api.Repositories.direction;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.direction
{
    public interface IDirectionService
    {
        Task<IEnumerable<Direction>> GetAllAsync();
        Task<Direction?> GetByIdAsync(string id);
        Task AddAsync(Direction direction);
        Task UpdateAsync(Direction direction);
        Task DeleteAsync(string id);
    }

    public class DirectionService : IDirectionService
    {
        private readonly IDirectionRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<DirectionService> _logger;

        public DirectionService(
            IDirectionRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<DirectionService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<Direction>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les directions");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des directions");
                throw;
            }
        }

        public async Task<Direction?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une direction avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la direction avec l'ID: {DirectionId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la direction avec l'ID: {DirectionId}", id);
                throw;
            }
        }

        public async Task AddAsync(Direction direction)
        {
            try
            {
                if (direction == null)
                {
                    throw new ArgumentNullException(nameof(direction), "La direction ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(direction.DirectionId))
                {
                    direction.DirectionId = _sequenceGenerator.GenerateSequence("seq_direction_id", "DIR", 6, "-");
                    _logger.LogInformation("ID généré pour la direction: {DirectionId}", direction.DirectionId);
                }

                await _repository.AddAsync(direction);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Direction ajoutée avec succès avec l'ID: {DirectionId}", direction.DirectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout de la direction avec l'ID: {DirectionId}", direction?.DirectionId);
                throw;
            }
        }

        public async Task UpdateAsync(Direction direction)
        {
            try
            {
                if (direction == null)
                {
                    throw new ArgumentNullException(nameof(direction), "La direction ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(direction.DirectionId))
                {
                    throw new ArgumentException("L'ID de la direction ne peut pas être null ou vide", nameof(direction.DirectionId));
                }

                await _repository.UpdateAsync(direction);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Direction mise à jour avec succès pour l'ID: {DirectionId}", direction.DirectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la direction avec l'ID: {DirectionId}", direction?.DirectionId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de la direction ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Direction supprimée avec succès pour l'ID: {DirectionId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la direction avec l'ID: {DirectionId}", id);
                throw;
            }
        }
    }
}