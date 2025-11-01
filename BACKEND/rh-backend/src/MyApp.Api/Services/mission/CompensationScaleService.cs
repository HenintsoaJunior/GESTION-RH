using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.dto.compensation_scale;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface ICompensationScaleService
    {
        Task<IEnumerable<CompensationScale>> GetAllAsync();
        Task<CompensationScale?> GetByIdAsync(string id);
        Task<IEnumerable<CompensationScale>> GetByEmployeeCategoryAsync(string categoryId);
        Task<IEnumerable<CompensationScale>> GetByCriteriaAsync(CompensationScaleDTOForm criteria);
        Task<string> CreateAsync(CompensationScaleDTOForm? dto);
        Task<bool> UpdateAsync(string id, CompensationScaleDTOForm? dto);
        Task<bool> DeleteAsync(string id, string userId);
        Task<List<string>> BulkSyncAsync(BulkCompensationScaleSyncRequest request, string userId);
    }

    public class CompensationScaleService : ICompensationScaleService
    {
        private readonly ICompensationScaleRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<CompensationScaleService> _logger;
        private readonly ILogService _logService;

        public CompensationScaleService(
            ICompensationScaleRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<CompensationScaleService> logger,
            ILogService logService)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
        }

        public async Task<IEnumerable<CompensationScale>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetAllAsync CompensationScale");
                throw;
            }
        }

        public async Task<CompensationScale?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByIdAsync CompensationScale avec id={Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<CompensationScale>> GetByEmployeeCategoryAsync(string categoryId)
        {
            try
            {
                return await _repository.GetByEmployeeCategoryAsync(categoryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByEmployeeCategoryAsync CompensationScale avec categoryId={CategoryId}", categoryId);
                throw;
            }
        }

        public async Task<IEnumerable<CompensationScale>> GetByCriteriaAsync(CompensationScaleDTOForm criteria)
        {
            try
            {
                return await _repository.GetByCriteriaAsync(criteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByCriteriaAsync CompensationScale");
                throw;
            }
        }

        public async Task<string> CreateAsync(CompensationScaleDTOForm? dto)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Tentative de création avec un CompensationScaleDTOForm null");
                    throw new ArgumentNullException(nameof(dto), "Les données du rapport de mission ne peuvent pas être nulles");
                }
                var entity = new CompensationScale(dto)
                {
                    CompensationScaleId = _sequenceGenerator.GenerateSequence("seq_compensation_scale_id", "CMP", 6, "-")
                };

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                // Log
                await _logService.LogAsync("INSERTION", null, entity, dto.UserId, "Amont,Place,CreatedAt");

                await transaction.CommitAsync();
                _logger.LogInformation("Grille de compensation créée : {CompensationScaleId}", entity.CompensationScaleId);
                return entity.CompensationScaleId;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de CreateAsync CompensationScale");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, CompensationScaleDTOForm? dto)
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
                    _logger.LogWarning("Tentative de mise à jour avec une CompensationScaleDTOForm null");
                    throw new ArgumentNullException(nameof(dto), "Les données de la compensation ne peuvent pas être nulles");
                }
                
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null) return false;
                

                var updated = new CompensationScale(dto)
                {
                    CompensationScaleId = existing.CompensationScaleId,
                };

                await _repository.UpdateAsync(updated);
                await _repository.SaveChangesAsync();

                // Log
                await _logService.LogAsync("MODIFICATION", existing, updated, dto.UserId,"Amont,Place,UpdatedAt");

                await transaction.CommitAsync();
                _logger.LogInformation("Grille de compensation mise à jour : {CompensationScaleId}", existing.CompensationScaleId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de UpdateAsync CompensationScale");
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
                await _logService.LogAsync("SUPPRESSION", existing, null, userId, "Amont,Place");

                await transaction.CommitAsync();
                _logger.LogInformation("Grille de compensation supprimée : {CompensationScaleId}", id);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de DeleteAsync CompensationScale");
                throw;
            }
        }

        public async Task<List<string>> BulkSyncAsync(BulkCompensationScaleSyncRequest request, string userId)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request.CategoryIds == null || !request.CategoryIds.Any())
                throw new ArgumentException("At least one CategoryId is required", nameof(request.CategoryIds));

            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                // Delete existing scales for the categories
                await _repository.BulkDeleteByCategoryIdsAsync(request.CategoryIds);

                // Prepare new scales from combined CompensationScales
                var allNewScales = new List<CompensationScale>();
                var createdIds = new List<string>();

                // Separate transport and expense scales from CompensationScales
                var transportScales = request.CompensationScales?
                    .Where(cs => !string.IsNullOrEmpty(cs.TransportId))
                    .Select(cs => (Amount: cs.Amount, Place: cs.Place ?? string.Empty, TypeId: cs.TransportId!))
                    .ToList() ?? new List<(decimal Amount, string Place, string TypeId)>();

                var expenseScales = request.CompensationScales?
                    .Where(cs => !string.IsNullOrEmpty(cs.ExpenseTypeId))
                    .Select(cs => (Amount: cs.Amount, Place: cs.Place ?? string.Empty, TypeId: cs.ExpenseTypeId!))
                    .ToList() ?? new List<(decimal Amount, string Place, string TypeId)>();

                foreach (var categoryId in request.CategoryIds)
                {
                    // Transport scales
                    foreach (var (amount, place, typeId) in transportScales)
                    {
                        var scale = new CompensationScale
                        {
                            CompensationScaleId = _sequenceGenerator.GenerateSequence("seq_compensation_scale_id", "CMP", 6, "-"),
                            Amount = amount,
                            Place = place,
                            TransportId = typeId,
                            EmployeeCategoryId = categoryId,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = null // Will be set on first update if needed
                        };
                        allNewScales.Add(scale);
                        createdIds.Add(scale.CompensationScaleId);
                    }

                    // Expense scales
                    foreach (var (amount, place, typeId) in expenseScales)
                    {
                        var scale = new CompensationScale
                        {
                            CompensationScaleId = _sequenceGenerator.GenerateSequence("seq_compensation_scale_id", "CMP", 6, "-"),
                            Amount = amount,
                            Place = place,
                            ExpenseTypeId = typeId,
                            EmployeeCategoryId = categoryId,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = null
                        };
                        allNewScales.Add(scale);
                        createdIds.Add(scale.CompensationScaleId);
                    }
                }

                // Bulk insert new scales
                if (allNewScales.Any())
                {
                    await _repository.BulkAddAsync(allNewScales);
                    await _repository.SaveChangesAsync();

                    // Log for bulk operation (simplified, log as one entry or loop if needed)
                    // For now, log a summary
                    _logger.LogInformation("Bulk sync completed for {CategoryCount} categories, created {ScaleCount} scales", request.CategoryIds.Count, allNewScales.Count);
                    // Optionally: await _logService.LogAsync("BULK_SYNC", null, allNewScales, userId, "All fields");
                }

                await transaction.CommitAsync();
                return createdIds.Distinct().ToList(); // Return unique IDs if any duplicates (unlikely)
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de BulkSyncAsync CompensationScale for categories {Categories}", string.Join(",", request.CategoryIds));
                throw;
            }
        }
    }
}