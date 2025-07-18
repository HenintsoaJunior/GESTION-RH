using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.direction;
using MyApp.Api.Repositories.direction;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.direction
{
    public interface IDepartmentService
    {
        Task<IEnumerable<Department>> GetAllAsync();
        Task<Department?> GetByIdAsync(string id);
        Task AddAsync(Department department);
        Task UpdateAsync(Department department);
        Task DeleteAsync(string id);
    }

    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<DepartmentService> _logger;

        public DepartmentService(
            IDepartmentRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<DepartmentService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les départements");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des départements");
                throw;
            }
        }

        public async Task<Department?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un département avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération du département avec l'ID: {DepartmentId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du département avec l'ID: {DepartmentId}", id);
                throw;
            }
        }

        public async Task AddAsync(Department department)
        {
            try
            {
                if (department == null)
                {
                    throw new ArgumentNullException(nameof(department), "Le département ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(department.DepartmentId))
                {
                    department.DepartmentId = _sequenceGenerator.GenerateSequence("seq_department_id", "DEPT", 6, "-");
                    _logger.LogInformation("ID généré pour le département: {DepartmentId}", department.DepartmentId);
                }

                await _repository.AddAsync(department);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Département ajouté avec succès avec l'ID: {DepartmentId}", department.DepartmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du département avec l'ID: {DepartmentId}", department?.DepartmentId);
                throw;
            }
        }

        public async Task UpdateAsync(Department department)
        {
            try
            {
                if (department == null)
                {
                    throw new ArgumentNullException(nameof(department), "Le département ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(department.DepartmentId))
                {
                    throw new ArgumentException("L'ID du département ne peut pas être null ou vide", nameof(department.DepartmentId));
                }

                await _repository.UpdateAsync(department);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Département mis à jour avec succès pour l'ID: {DepartmentId}", department.DepartmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du département avec l'ID: {DepartmentId}", department?.DepartmentId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du département ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Département supprimé avec succès pour l'ID: {DepartmentId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du département avec l'ID: {DepartmentId}", id);
                throw;
            }
        }
    }
}