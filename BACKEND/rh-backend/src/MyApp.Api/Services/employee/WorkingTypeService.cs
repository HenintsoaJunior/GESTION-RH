using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.employee
{
    public interface IWorkingTimeTypeService
    {
        Task<IEnumerable<WorkingTimeType>> GetAllAsync();
        Task<WorkingTimeType?> GetByIdAsync(string id);
        Task AddAsync(WorkingTimeType workingTimeType);
        Task UpdateAsync(string id, WorkingTimeType workingTimeType);
        Task DeleteAsync(string id);
    }

    public class WorkingTimeTypeService : IWorkingTimeTypeService
    {
        private readonly IWorkingTimeTypeRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<WorkingTimeTypeService> _logger;

        public WorkingTimeTypeService(
            IWorkingTimeTypeRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<WorkingTimeTypeService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<WorkingTimeType>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les types de temps de travail");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des types de temps de travail");
                throw;
            }
        }

        public async Task<WorkingTimeType?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un type de temps de travail avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                throw;
            }
        }

        public async Task AddAsync(WorkingTimeType workingTimeType)
        {
            try
            {
                if (workingTimeType == null)
                {
                    throw new ArgumentNullException(nameof(workingTimeType), "Le type de temps de travail ne peut pas être null");
                }

                workingTimeType.WorkingTimeTypeId = _sequenceGenerator.GenerateSequence("seq_working_time_type_id", "WTT", 6, "-");
                _logger.LogInformation("ID généré pour le type de temps de travail: {WorkingTimeTypeId}", workingTimeType.WorkingTimeTypeId);

                await _repository.AddAsync(workingTimeType);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de temps de travail ajouté avec succès avec l'ID: {WorkingTimeTypeId}", workingTimeType.WorkingTimeTypeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du type de temps de travail");
                throw;
            }
        }

        public async Task UpdateAsync(string id, WorkingTimeType workingTimeType)
        {
            try
            {
                if (workingTimeType == null)
                {
                    throw new ArgumentNullException(nameof(workingTimeType), "Le type de temps de travail ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du type de temps de travail ne peut pas être null ou vide", nameof(id));
                }

                var existingWorkingTimeType = await _repository.GetByIdAsync(id);
                if (existingWorkingTimeType == null)
                {
                    throw new ArgumentException("Le type de temps de travail n'existe pas", nameof(id));
                }

                workingTimeType.WorkingTimeTypeId = id; // Conserver l'ID existant
                await _repository.UpdateAsync(workingTimeType);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de temps de travail mis à jour avec succès pour l'ID: {WorkingTimeTypeId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du type de temps de travail ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de temps de travail supprimé avec succès pour l'ID: {WorkingTimeTypeId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                throw;
            }
        }
    }
}