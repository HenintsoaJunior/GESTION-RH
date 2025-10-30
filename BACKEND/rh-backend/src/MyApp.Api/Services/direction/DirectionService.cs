using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using MyApp.Api.Repositories.direction;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.direction
{
    public interface IDirectionService
    {
        Task<(IEnumerable<Direction>, int)> SearchAsync(DirectionSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Direction>> GetAllAsync();
        Task<Direction?> GetByIdAsync(string id);
        Task<Direction> AddAsync(DirectionDTOForm dto);
        Task UpdateAsync(Direction direction);
        Task DeleteAsync(string id);
    }

    public class DirectionService : IDirectionService
    {
        private readonly IDirectionRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<DirectionService> _logger;

        public DirectionService(
            IDirectionRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<DirectionService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<(IEnumerable<Direction>, int)> SearchAsync(DirectionSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des directions avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des directions");
                throw;
            }
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

        public async Task<Direction> AddAsync(DirectionDTOForm dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de direction ne peut pas être null");
                }

                var directionId = _sequenceGenerator.GenerateSequence("seq_direction_id", "DIR", 6, "-");

                var direction = new Direction(dto) { DirectionId = directionId };

                await _repository.AddAsync(direction);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Direction ajoutée avec succès avec l'ID: {DirectionId}", direction.DirectionId);
                return direction;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout de la direction");
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