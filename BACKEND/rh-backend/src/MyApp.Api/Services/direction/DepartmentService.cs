using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using MyApp.Api.Repositories.direction;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.direction
{
    public interface IDepartmentService
    {
        Task<(IEnumerable<Department>, int)> SearchAsync(DepartmentSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Department>> GetAllAsync();
        Task<Department?> GetByIdAsync(string id);
        Task<Department> AddAsync(DepartmentDTOForm dto);
        Task UpdateAsync(Department department);
        Task DeleteAsync(string id);
    }

    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<DepartmentService> _logger;

        public DepartmentService(
            IDepartmentRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<DepartmentService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<(IEnumerable<Department>, int)> SearchAsync(DepartmentSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des départements avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des départements");
                throw;
            }
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

        public async Task<Department> AddAsync(DepartmentDTOForm dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de département ne peut pas être null");
                }

                var departmentId = _sequenceGenerator.GenerateSequence("seq_department_id", "DEPT", 6, "-");

                var department = new Department(dto) { DepartmentId = departmentId };

                await _repository.AddAsync(department);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Département ajouté avec succès avec l'ID: {DepartmentId}", department.DepartmentId);
                return department;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout du département");
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