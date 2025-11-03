using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employee
{
    public interface ICategoriesOfEmployeeService
    {
        Task<IEnumerable<CategoriesOfEmployee>> GetCategoriesByEmployeeIdAsync(string employeeId, DateTime date);
        Task<IEnumerable<CategoriesOfEmployee>> GetCategoriesByEmployeeIdAsync(string employeeId);
        
        Task<CategoriesOfEmployee> AddAsync(CreateCategoriesOfEmployeeDTO dto);
        Task UpdateAsync(CategoriesOfEmployee entity);
        Task DeleteAsync(CategoriesOfEmployee entity);
        Task<IEnumerable<CategoriesOfEmployee>> GetAllAsync();
    }

    public class CategoriesOfEmployeeService : ICategoriesOfEmployeeService
    {
        private readonly ICategoriesOfEmployeeRepository _repository;
        private readonly AppDbContext _context;
        private readonly ILogger<CategoriesOfEmployeeService> _logger;

        public CategoriesOfEmployeeService(
            ICategoriesOfEmployeeRepository repository,
            AppDbContext context,
            ILogger<CategoriesOfEmployeeService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<CategoriesOfEmployee>> GetCategoriesByEmployeeIdAsync(string employeeId, DateTime date)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(employeeId))
                {
                    _logger.LogWarning("Tentative de récupération des catégories d'employé avec un ID d'employé null ou vide");
                    return Enumerable.Empty<CategoriesOfEmployee>();
                }

                _logger.LogInformation("Récupération des catégories d'employé pour l'ID {EmployeeId} avant la date {Date}", employeeId, date);
                return await _repository.GetByEmployeeIdBeforeDateAsync(employeeId, date);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des catégories d'employé pour l'ID {EmployeeId} avant la date {Date}", employeeId, date);
                throw;
            }
        }

        public async Task<IEnumerable<CategoriesOfEmployee>> GetCategoriesByEmployeeIdAsync(string employeeId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(employeeId))
                {
                    _logger.LogWarning("Tentative de récupération des catégories d'employé avec un ID d'employé null ou vide");
                    return Enumerable.Empty<CategoriesOfEmployee>();
                }

                return await _repository.GetByEmployeeIdBeforeDateAsync(employeeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des catégories d'employé pour l'ID {EmployeeId}", employeeId);
                throw;
            }
        }

        public async Task<IEnumerable<CategoriesOfEmployee>> GetAllAsync()
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

        public async Task<CategoriesOfEmployee> AddAsync(CreateCategoriesOfEmployeeDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de catégories d'employé ne peut pas être null");
                }

                var entity = new CategoriesOfEmployee(dto);

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Catégorie d'employé ajoutée avec succès pour l'employé {EmployeeId} et catégorie {EmployeeCategoryId}", entity.EmployeeId, entity.EmployeeCategoryId);
                return entity;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout de la catégorie d'employé");
                throw;
            }
        }

        public async Task UpdateAsync(CategoriesOfEmployee entity)
        {
            try
            {
                if (entity == null)
                {
                    throw new ArgumentNullException(nameof(entity), "La catégorie d'employé ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(entity.EmployeeId) || string.IsNullOrWhiteSpace(entity.EmployeeCategoryId))
                {
                    throw new ArgumentException("Les IDs de l'employé et de la catégorie ne peuvent pas être null ou vides");
                }

                _repository.Update(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Catégorie d'employé mise à jour avec succès pour l'employé {EmployeeId} et catégorie {EmployeeCategoryId}", entity.EmployeeId, entity.EmployeeCategoryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la catégorie d'employé pour l'employé {EmployeeId} et catégorie {EmployeeCategoryId}", entity?.EmployeeId, entity?.EmployeeCategoryId);
                throw;
            }
        }

        public async Task DeleteAsync(CategoriesOfEmployee entity)
        {
            try
            {
                if (entity == null)
                {
                    throw new ArgumentNullException(nameof(entity), "La catégorie d'employé ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(entity.EmployeeId) || string.IsNullOrWhiteSpace(entity.EmployeeCategoryId))
                {
                    throw new ArgumentException("Les IDs de l'employé et de la catégorie ne peuvent pas être null ou vides");
                }

                _repository.Delete(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Catégorie d'employé supprimée avec succès pour l'employé {EmployeeId} et catégorie {EmployeeCategoryId}", entity.EmployeeId, entity.EmployeeCategoryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la catégorie d'employé pour l'employé {EmployeeId} et catégorie {EmployeeCategoryId}", entity?.EmployeeId, entity?.EmployeeCategoryId);
                throw;
            }
        }
    }
}