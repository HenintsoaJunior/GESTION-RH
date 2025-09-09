using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IExpenseReportTypeService
    {
        Task<IEnumerable<ExpenseReportType>> GetAllAsync();
        Task<ExpenseReportType?> GetByIdAsync(string id);
        Task<string> CreateAsync(ExpenseReportType expenseReportType);
        Task<bool> UpdateAsync(string id, ExpenseReportType expenseReportType);
        Task<bool> DeleteAsync(string id, string userId);
    }

    public class ExpenseReportTypeService : IExpenseReportTypeService
    {
        private readonly IExpenseReportTypeRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogService _logService;
        private readonly ILogger<ExpenseReportTypeService> _logger;

        public ExpenseReportTypeService(
            IExpenseReportTypeRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogService logService,
            ILogger<ExpenseReportTypeService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<ExpenseReportType>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les types de rapports de frais");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les types de rapports de frais");
                throw;
            }
        }

        public async Task<ExpenseReportType?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un type de rapport de frais avec un ID null ou vide");
                    throw new ArgumentException("L'ID du type de rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                _logger.LogInformation("Récupération du type de rapport de frais avec l'ID: {ExpenseReportTypeId}", id);
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Type de rapport de frais avec l'ID {ExpenseReportTypeId} n'existe pas", id);
                }
                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du type de rapport de frais {ExpenseReportTypeId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(ExpenseReportType? expenseReportType)
        {
            try
            {
                if (expenseReportType == null)
                {
                    _logger.LogWarning("Tentative de création avec un ExpenseReportType null");
                    throw new ArgumentNullException(nameof(expenseReportType), "Les données du type de rapport de frais ne peuvent pas être nulles");
                }

                var entity = new ExpenseReportType
                {
                    ExpenseReportTypeId = _sequenceGenerator.GenerateSequence("seq_expense_report_type", "ERT", 6, "-"),
                    Type = expenseReportType.Type,
                    CreatedAt = DateTime.UtcNow
                };

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de rapport de frais créé avec l'ID: {ExpenseReportTypeId}", entity.ExpenseReportTypeId);
                // await _logService.LogAsync("INSERTION", null, entity, null); // Assuming userId is optional for logging

                return entity.ExpenseReportTypeId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du type de rapport de frais");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, ExpenseReportType? expenseReportType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ID null ou vide");
                    throw new ArgumentException("L'ID du type de rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                if (expenseReportType == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ExpenseReportType null");
                    throw new ArgumentNullException(nameof(expenseReportType), "Les données du type de rapport de frais ne peuvent pas être nulles");
                }

                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Type de rapport de frais avec l'ID {ExpenseReportTypeId} n'existe pas", id);
                    return false;
                }

                var old = new ExpenseReportType
                {
                    ExpenseReportTypeId = existing.ExpenseReportTypeId,
                    Type = existing.Type,
                    CreatedAt = existing.CreatedAt,
                    UpdatedAt = existing.UpdatedAt
                };

                existing.Type = expenseReportType.Type;
                existing.UpdatedAt = DateTime.UtcNow;

                await _repository.UpdateAsync(existing);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de rapport de frais mis à jour avec succès avec l'ID: {ExpenseReportTypeId}", id);
                // await _logService.LogAsync("MODIFICATION", old, existing, null); // Assuming userId is optional for logging

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du type de rapport de frais {ExpenseReportTypeId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id, string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression avec un ID null ou vide");
                    throw new ArgumentException("L'ID du type de rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Type de rapport de frais avec l'ID {ExpenseReportTypeId} n'existe pas", id);
                    return false;
                }

                await _repository.DeleteAsync(existing);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Type de rapport de frais supprimé avec succès avec l'ID: {ExpenseReportTypeId}", id);
                await _logService.LogAsync("SUPPRESSION", existing, null, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du type de rapport de frais {ExpenseReportTypeId}", id);
                throw;
            }
        }
    }
}