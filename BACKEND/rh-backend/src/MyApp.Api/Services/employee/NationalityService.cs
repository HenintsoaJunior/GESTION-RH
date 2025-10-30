using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.employee
{
    public interface INationalityService
    {
        Task<IEnumerable<Nationality>> GetAllAsync();
        Task<Nationality?> GetByIdAsync(string id);
        Task<Nationality> AddAsync(CreateNationalityDTO dto);
        Task UpdateAsync(Nationality nationality);
        Task DeleteAsync(string id);
    }

    public class NationalityService : INationalityService
    {
        private readonly INationalityRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<NationalityService> _logger;

        public NationalityService(
            INationalityRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<NationalityService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Nationality>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les nationalités");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des nationalités");
                throw;
            }
        }

        public async Task<Nationality?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une nationalité avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la nationalité avec l'ID: {NationalityId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la nationalité avec l'ID: {NationalityId}", id);
                throw;
            }
        }

        public async Task<Nationality> AddAsync(CreateNationalityDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de nationalité ne peut pas être null");
                }

                var nationalityId = _sequenceGenerator.GenerateSequence("seq_nationality_id", "NAT", 6, "-");

                var nationality = new Nationality(dto) { NationalityId = nationalityId };

                await _repository.AddAsync(nationality);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Nationalité ajoutée avec succès avec l'ID: {NationalityId}", nationality.NationalityId);
                return nationality;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout de la nationalité");
                throw;
            }
        }

        public async Task UpdateAsync(Nationality nationality)
        {
            try
            {
                if (nationality == null)
                {
                    throw new ArgumentNullException(nameof(nationality), "La nationalité ne peut pas être null");
                }

                await _repository.UpdateAsync(nationality);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Nationalité mise à jour avec succès pour l'ID: {NationalityId}", nationality.NationalityId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la nationalité avec l'ID: {NationalityId}", nationality.NationalityId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de la nationalité ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Nationalité supprimée avec succès pour l'ID: {NationalityId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la nationalité avec l'ID: {NationalityId}", id);
                throw;
            }
        }
    }
}