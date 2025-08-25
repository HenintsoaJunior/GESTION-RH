using MyApp.Api.Entities.mission;
using MyApp.Api.Models.form.mission;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IMissionValidationService
    {
        Task<MissionValidation?> VerifyMissionValidationByMissionIdAsync(string missionId);
        Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<MissionValidation>> GetAllAsync();
        Task<MissionValidation?> GetByIdAsync(string id);
        Task<string> CreateAsync(MissionValidationDTOForm missionValidation);
        Task<bool> UpdateAsync(string id, MissionValidationDTOForm missionValidation);
        Task<bool> DeleteAsync(string id);
        Task<bool> UpdateStatusAsync(string id, string status);
    }

    public class MissionValidationService : IMissionValidationService
    {
        private readonly IMissionValidationRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<MissionValidation> _logger;

        public MissionValidationService(
            IMissionValidationRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<MissionValidation> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MissionValidation?> VerifyMissionValidationByMissionIdAsync(string missionId)
        {
            var filters = new MissionValidationSearchFiltersDTO
            {
                MissionId = missionId
            };
            var (result, total) = await _repository.SearchAsync(filters, 1, 1);
            return result.FirstOrDefault();
        }

        public async Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize)
        {
            return await _repository.SearchAsync(filters, page, pageSize);
        }

        public async Task<IEnumerable<MissionValidation>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les validations de mission");
                throw;
            }
        }

        public async Task<MissionValidation?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la validation de mission {MissionValidationId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(MissionValidationDTOForm missionValidationDto)
        {
            try
            {
                var missionValidationId = _sequenceGenerator.GenerateSequence("seq_mission_validation_id", "MVAL", 6, "-");
                var missionValidation = new MissionValidation(missionValidationDto) { MissionValidationId = missionValidationId };
                
                await _repository.AddAsync(missionValidation);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Validation de mission créée avec l'ID: {MissionValidationId}", missionValidationId);
                return missionValidationId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la validation de mission");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, MissionValidationDTOForm missionValidationDto)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return false;

                entity.MissionId = missionValidationDto.MissionId;
                entity.MissionAssignationId = missionValidationDto.MissionAssignationId;
                entity.MissionCreator = missionValidationDto.MissionCreator;
                entity.Status = missionValidationDto.Status ?? "En Attente";
                entity.ToWhom = missionValidationDto.ToWhom;
                entity.ValidationDate = missionValidationDto.ValidationDate;
                entity.UpdatedAt = DateTime.UtcNow;

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la validation de mission {MissionValidationId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return false;

                await _repository.DeleteAsync(entity);
                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la validation de mission {MissionValidationId}", id);
                throw;
            }
        }

        public async Task<bool> UpdateStatusAsync(string id, string status)
        {
            try
            {
                var result = await _repository.UpdateStatusAsync(id, status);
                if (result)
                {
                    _logger.LogInformation("Statut de la validation de mission {MissionValidationId} mis à jour à {Status}", id, status);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut de la validation de mission {MissionValidationId}", id);
                throw;
            }
        }
    }
}