using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IExpenseReportService
    {
        Task<(IEnumerable<ExpenseReport> Reports, decimal TotalAmount)> GetByAssignationIdAsync(string assignationId);
        Task<IEnumerable<ExpenseReport>> GetAllAsync();
        Task<ExpenseReport> GetByIdAsync(string id);
        Task<string> CreateAsync(ExpenseReportDTOForm dto);
        Task<bool> UpdateAsync(string id, ExpenseReportDTOForm dto);
        Task<bool> DeleteAsync(string id, string userId);
    }

    public class ExpenseReportService : IExpenseReportService
    {
        private readonly IExpenseReportRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogService _logService;
        private readonly ILogger<ExpenseReportService> _logger;

        public ExpenseReportService(
            IExpenseReportRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogService logService,
            ILogger<ExpenseReportService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        public async Task<(IEnumerable<ExpenseReport> Reports, decimal TotalAmount)> GetByAssignationIdAsync(string assignationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(assignationId))
                {
                    _logger.LogWarning("Tentative de récupération des rapports de frais avec un assignationId null ou vide");
                    throw new ArgumentException("L'ID d'assignation ne peut pas être null ou vide", nameof(assignationId));
                }

                _logger.LogInformation("Récupération des rapports de frais pour assignationId: {AssignationId}", assignationId);
                var reports = await _repository.GetByAssignationIdAsync(assignationId);
                var expenseReports = reports as ExpenseReport[] ?? reports.ToArray();
                var totalAmount = expenseReports.Sum(r => r.Amount);
                return (expenseReports, totalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des rapports de frais pour assignationId: {AssignationId}", assignationId);
                throw;
            }
        }

        public async Task<IEnumerable<ExpenseReport>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les rapports de frais");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les rapports de frais");
                throw;
            }
        }

        public async Task<ExpenseReport> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un rapport de frais avec un ID null ou vide");
                    throw new ArgumentException("L'ID du rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                _logger.LogInformation("Récupération du rapport de frais avec l'ID: {ExpenseReportId}", id);
                var report = await _repository.GetByIdAsync(id);
                if (report != null) return report;
                _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} n'existe pas", id);
                throw new InvalidOperationException($"Le rapport de frais avec l'ID {id} n'existe pas");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du rapport de frais {ExpenseReportId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(ExpenseReportDTOForm? dto)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Tentative de création avec un ExpenseReportDTOForm null");
                    throw new ArgumentNullException(nameof(dto), "Les données du rapport de frais ne peuvent pas être nulles");
                }

                var entity = new ExpenseReport(dto)
                {
                    ExpenseReportId = _sequenceGenerator.GenerateSequence("seq_expense_report", "ER", 6, "-")
                };
                
                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rapport de frais créé avec l'ID: {ExpenseReportId}", entity.ExpenseReportId);
                await _logService.LogAsync("INSERTION", null, entity, dto.UserId);

                return entity.ExpenseReportId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du rapport de frais");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, ExpenseReportDTOForm? dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ID null ou vide");
                    throw new ArgumentException("L'ID du rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                if (dto == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ExpenseReportDTOForm null");
                    throw new ArgumentNullException(nameof(dto), "Les données du rapport de frais ne peuvent pas être nulles");
                }

                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} n'existe pas", id);
                    return false;
                }
                
                var updated = new ExpenseReport(dto)
                {
                    ExpenseReportId = existing.ExpenseReportId,
                };

                await _repository.UpdateAsync(updated);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rapport de frais mis à jour avec succès avec l'ID: {ExpenseReportId}", id);
                await _logService.LogAsync("MODIFICATION", existing, updated, dto.UserId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du rapport de frais {ExpenseReportId}", id);
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
                    throw new ArgumentException("L'ID du rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} n'existe pas", id);
                    return false;
                }

                await _repository.DeleteAsync(existing);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rapport de frais supprimé avec succès avec l'ID: {ExpenseReportId}", id);
                await _logService.LogAsync("SUPPRESSION", existing, null, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du rapport de frais {ExpenseReportId}", id);
                throw;
            }
        }
    }
}