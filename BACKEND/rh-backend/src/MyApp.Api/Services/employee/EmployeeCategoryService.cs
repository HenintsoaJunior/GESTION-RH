using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.employee
{
    public interface IEmployeeCategoryService
    {
        Task<IEnumerable<EmployeeCategory>> GetAllAsync();
        Task<EmployeeCategory?> GetByIdAsync(string id);
        Task<EmployeeCategory> AddAsync(CreateEmployeeCategoryDTO dto);
        Task UpdateAsync(EmployeeCategory category);
        Task DeleteAsync(string id);
    }

    public class EmployeeCategoryService : IEmployeeCategoryService
    {
        private readonly IEmployeeCategoryRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<EmployeeCategoryService> _logger;

        public EmployeeCategoryService(
            IEmployeeCategoryRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<EmployeeCategoryService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<EmployeeCategory>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les catégories d'employé");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les catégories d'employé");
                throw;
            }
        }

        public async Task<EmployeeCategory?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une catégorie d'employé avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la catégorie d'employé avec l'ID: {EmployeeCategoryId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la catégorie d'employé avec l'ID: {EmployeeCategoryId}", id);
                throw;
            }
        }

        public async Task<EmployeeCategory> AddAsync(CreateEmployeeCategoryDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de catégorie d'employé ne peut pas être null");
                }

                var employeeCategoryId = _sequenceGenerator.GenerateSequence("seq_employee_category_id", "EC", 6, "-");

                var category = new EmployeeCategory(dto) { EmployeeCategoryId = employeeCategoryId };

                await _repository.AddAsync(category);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Catégorie d'employé ajoutée avec succès avec l'ID: {EmployeeCategoryId}", category.EmployeeCategoryId);
                return category;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout de la catégorie d'employé");
                throw;
            }
        }

        public async Task UpdateAsync(EmployeeCategory category)
        {
            try
            {
                if (category == null)
                {
                    throw new ArgumentNullException(nameof(category), "La catégorie d'employé ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(category.EmployeeCategoryId))
                {
                    throw new ArgumentException("L'ID de la catégorie d'employé ne peut pas être null ou vide", nameof(category.EmployeeCategoryId));
                }

                await _repository.UpdateAsync(category);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Catégorie d'employé mise à jour avec succès pour l'ID: {EmployeeCategoryId}", category.EmployeeCategoryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la catégorie d'employé avec l'ID: {EmployeeCategoryId}", category?.EmployeeCategoryId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de la catégorie d'employé ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Catégorie d'employé supprimée avec succès pour l'ID: {EmployeeCategoryId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la catégorie d'employé avec l'ID: {EmployeeCategoryId}", id);
                throw;
            }
        }
    }
}