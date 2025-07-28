using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.employee
{
    public interface IGenderService
    {
        Task<IEnumerable<Gender>> GetAllAsync();
        Task<Gender?> GetByIdAsync(string id);
        Task AddAsync(Gender gender);
        Task UpdateAsync(string id, Gender gender);
        Task DeleteAsync(string id);
    }

    public class GenderService : IGenderService
    {
        private readonly IGenderRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<GenderService> _logger;

        public GenderService(
            IGenderRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<GenderService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
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

        public async Task AddAsync(Gender gender)
        {
            try
            {
                if (gender == null)
                {
                    throw new ArgumentNullException(nameof(gender), "Le genre ne peut pas être null");
                }

                gender.GenderId = _sequenceGenerator.GenerateSequence("seq_gender_id", "GEN", 6, "-");
                _logger.LogInformation("ID généré pour le genre: {GenderId}", gender.GenderId);

                await _repository.AddAsync(gender);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Genre ajouté avec succès avec l'ID: {GenderId}", gender.GenderId);
            }
            catch (Exception ex)
            {
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