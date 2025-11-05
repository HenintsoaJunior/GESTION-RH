using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IExpenseCompensationScaleService
    {
        Task<IEnumerable<ExpenseCompensationScale>> GetAllAsync();
        Task<ExpenseCompensationScale?> GetByIdAsync(string id);
        Task<IEnumerable<ExpenseCompensationScale>> GetByCriteriaAsync(ExpenseCompensationScaleDTOForm criteria);
        Task<string> CreateAsync(ExpenseCompensationScaleDTOForm? dto);
        Task<bool> UpdateAsync(string id, ExpenseCompensationScaleDTOForm? dto);
        Task<bool> DeleteAsync(string id, string userId);
        Task<List<string>> BulkSyncAsync(BulkExpenseCompensationScaleSyncRequest request, string userId);
    }

    public class ExpenseCompensationScaleService : IExpenseCompensationScaleService
    {
        private readonly IExpenseCompensationScaleRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ExpenseCompensationScaleService> _logger;
        private readonly ILogService _logService;

        public ExpenseCompensationScaleService(
            IExpenseCompensationScaleRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<ExpenseCompensationScaleService> logger,
            ILogService logService)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
        }

        public async Task<IEnumerable<ExpenseCompensationScale>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetAllAsync ExpenseCompensationScale");
                throw;
            }
        }

        public async Task<ExpenseCompensationScale?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByIdAsync ExpenseCompensationScale avec id={Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<ExpenseCompensationScale>> GetByCriteriaAsync(ExpenseCompensationScaleDTOForm criteria)
        {
            try
            {
                return await _repository.GetByCriteriaAsync(criteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByCriteriaAsync ExpenseCompensationScale");
                throw;
            }
        }

        public async Task<string> CreateAsync(ExpenseCompensationScaleDTOForm? dto)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Tentative de création avec un ExpenseCompensationScaleDTOForm null");
                    throw new ArgumentNullException(nameof(dto), "Les données du rapport de mission ne peuvent pas être nulles");
                }
                var entity = new ExpenseCompensationScale(dto)
                {
                    ExpenseCompensationScaleId = _sequenceGenerator.GenerateSequence("seq_expense_compensation_scale_id", "ECS", 6, "-")
                };

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                // Log
                await _logService.LogAsync("INSERTION", null, entity, dto.UserId, "Amount,CreatedAt");

                await transaction.CommitAsync();
                _logger.LogInformation("Échelle de compensation des frais créée : {ExpenseCompensationScaleId}", entity.ExpenseCompensationScaleId);
                return entity.ExpenseCompensationScaleId;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de CreateAsync ExpenseCompensationScale");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, ExpenseCompensationScaleDTOForm? dto)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ID null ou vide");
                    throw new ArgumentException("L'ID de la compensation ne peut pas être null ou vide", nameof(id));
                }

                if (dto == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec une ExpenseCompensationScaleDTOForm null");
                    throw new ArgumentNullException(nameof(dto), "Les données de la compensation ne peuvent pas être nulles");
                }
                
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null) return false;
                

                var updated = new ExpenseCompensationScale(dto)
                {
                    ExpenseCompensationScaleId = existing.ExpenseCompensationScaleId,
                };

                await _repository.UpdateAsync(updated);
                await _repository.SaveChangesAsync();

                // Log
                await _logService.LogAsync("MODIFICATION", existing, updated, dto.UserId,"Amount,UpdatedAt");

                await transaction.CommitAsync();
                _logger.LogInformation("Échelle de compensation des frais mise à jour : {ExpenseCompensationScaleId}", existing.ExpenseCompensationScaleId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de UpdateAsync ExpenseCompensationScale");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null) return false;

                await _repository.DeleteAsync(existing);
                await _repository.SaveChangesAsync();

                // Log
                await _logService.LogAsync("SUPPRESSION", existing, null, userId, "Amount");

                await transaction.CommitAsync();
                _logger.LogInformation("Échelle de compensation des frais supprimée : {ExpenseCompensationScaleId}", id);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de DeleteAsync ExpenseCompensationScale");
                throw;
            }
        }

        public async Task<List<string>> BulkSyncAsync(BulkExpenseCompensationScaleSyncRequest request, string userId)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                // Delete all existing scales
                var existingScales = await _repository.GetAllAsync();
                if (existingScales.Any())
                {
                    await _repository.BulkDeleteAsync(existingScales.ToList());
                }

                // Prepare new scales from ExpenseCompensationScales
                var allNewScales = new List<ExpenseCompensationScale>();
                var createdIds = new List<string>();

                foreach (var dto in request.ExpenseCompensationScales ?? new List<BulkExpenseCompensationScaleDTO>())
                {
                    var scale = new ExpenseCompensationScale
                    {
                        ExpenseCompensationScaleId = _sequenceGenerator.GenerateSequence("seq_expense_compensation_scale_id", "ECS", 6, "-"),
                        Amount = dto.Amount,
                        Devise = dto.Devise ?? "EUR",
                        ExpenseTypeId = dto.ExpenseTypeId,
                        ZoneId = dto.ZoneId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = null 
                    };
                    allNewScales.Add(scale);
                    createdIds.Add(scale.ExpenseCompensationScaleId);
                }

                // Bulk insert new scales
                if (allNewScales.Any())
                {
                    await _repository.BulkAddAsync(allNewScales);
                    await _repository.SaveChangesAsync();

                }

                await transaction.CommitAsync();
                return createdIds.Distinct().ToList(); // Return unique IDs if any duplicates (unlikely)
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de BulkSyncAsync ExpenseCompensationScale");
                throw;
            }
        }
    }
}