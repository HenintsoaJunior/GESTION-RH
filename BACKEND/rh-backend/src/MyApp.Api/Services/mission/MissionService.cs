using MyApp.Api.Entities.mission;
using MyApp.Api.Models.form.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IMissionService
    {
        Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Mission>> GetAllAsync();
        Task<Mission?> GetByIdAsync(string id);
        Task<string> CreateAsync(MissionDTOForm mission);
        Task<bool> UpdateAsync(string id,MissionDTOForm mission);
        Task<bool> DeleteAsync(string id);
        Task<MissionStats> GetStatisticsAsync();
        Task<bool> CancelAsync(string id);
    }

    public class MissionService : IMissionService
    {
        private readonly IMissionRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly IMissionAssignationService _missionAssignationService;
        private readonly ILogger<Mission> _logger;

        public MissionService(
            IMissionRepository repository,
            ISequenceGenerator sequenceGenerator,
            IMissionAssignationService missionAssignationService,
            ILogger<Mission> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _missionAssignationService = missionAssignationService ?? throw new ArgumentNullException(nameof(missionAssignationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize)
        {
            return await _repository.SearchAsync(filters, page, pageSize);
        }

        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les missions");
                throw;
            }
        }

        public async Task<Mission?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la mission {MissionId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(MissionDTOForm missionDTO)
        {
            try
            {
                var missionId = _sequenceGenerator.GenerateSequence("seq_mission_id", "MIS", 6, "-");
                var mission = new Mission(missionDTO) { MissionId = missionId };

                await _repository.AddAsync(mission);
                await _repository.SaveChangesAsync();

                if (missionDTO.Assignations != null && missionDTO.Assignations.Any())
                {
                    foreach (var assignationDTO in missionDTO.Assignations)
                    {
                        var missionAssignation = new MissionAssignation
                        {
                            EmployeeId = assignationDTO.EmployeeId,
                            MissionId = missionId,
                            TransportId = assignationDTO.TransportId,
                            DepartureDate = assignationDTO.DepartureDate ?? DateTime.Now,
                            DepartureTime = assignationDTO.DepartureTime,
                            ReturnDate = assignationDTO.ReturnDate,
                            ReturnTime = assignationDTO.ReturnTime,
                            Duration = assignationDTO.Duration
                        };

                        await _missionAssignationService.CreateAsync(missionAssignation);
                    }
                    _logger.LogInformation("Created {Count} mission assignations for mission {MissionId}", missionDTO.Assignations.Count, missionId);
                }

                _logger.LogInformation("Mission créée avec l'ID: {MissionId}", missionId);
                return missionId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la mission");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id,MissionDTOForm mission)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return false;

                entity.Name = mission.Name;
                entity.Description = mission.Description;
                entity.StartDate = mission.StartDate;
                entity.EndDate = mission.EndDate;
                entity.LieuId = mission.LieuId;

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la mission {MissionId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            await _repository.DeleteAsync(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelAsync(string id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            entity.Status = "Annulé";
            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();
            _logger.LogInformation("Mission {MissionId} annulée", id);
            return true;
        }

        public async Task<MissionStats> GetStatisticsAsync()
        {
            return await _repository.GetStatisticsAsync();
        }
    }
}