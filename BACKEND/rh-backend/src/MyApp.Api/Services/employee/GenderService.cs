using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.employee
{
    public interface IGenderService
    {
        Task<IEnumerable<Gender>> GetAllAsync();
        Task<Gender?> GetByIdAsync(string id);
        Task<Gender> AddAsync(CreateGenderDTO dto);
        Task UpdateAsync(string id, Gender gender);
        Task DeleteAsync(string id);
    }

    public class GenderService : IGenderService
    {
        private readonly IGenderRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<GenderService> _logger;

        public GenderService(
            IGenderRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<GenderService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Gender>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les genres");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des genres");
                throw;
            }
        }

        public async Task<Gender?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un genre avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération du genre avec l'ID: {GenderId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du genre avec l'ID: {GenderId}", id);
                throw;
            }
        }

        public async Task<Gender> AddAsync(CreateGenderDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de genre ne peut pas être null");
                }
                var genderId = _sequenceGenerator.GenerateSequence("seq_gender_id", "GEN", 6, "-");


                var gender = new Gender(dto) { GenderId = genderId };

                
                await _repository.AddAsync(gender);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Genre ajouté avec succès avec l'ID: {GenderId}", gender.GenderId);
                return gender;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout du genre");
                throw;
            }
        }

        public async Task UpdateAsync(string id, Gender gender)
        {
            try
            {
                if (gender == null)
                {
                    throw new ArgumentNullException(nameof(gender), "Le genre ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du genre ne peut pas être null ou vide", nameof(id));
                }

                var existingGender = await _repository.GetByIdAsync(id);
                if (existingGender == null)
                {
                    throw new ArgumentException("Le genre n'existe pas", nameof(id));
                }

                gender.GenderId = id; // Conserver l'ID existant
                await _repository.UpdateAsync(gender);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Genre mis à jour avec succès pour l'ID: {GenderId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du genre avec l'ID: {GenderId}", id);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du genre ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Genre supprimé avec succès pour l'ID: {GenderId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du genre avec l'ID: {GenderId}", id);
                throw;
            }
        }
    }
}