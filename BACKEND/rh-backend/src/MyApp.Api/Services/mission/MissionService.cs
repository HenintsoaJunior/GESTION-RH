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
        Task<bool> UpdateAsync(Mission mission);
        Task<bool> DeleteAsync(string id);
        Task<MissionStats> GetStatisticsAsync();
    }

    public class MissionService : IMissionService
    {
        private readonly IMissionRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<Mission> _logger;

        public MissionService(IMissionRepository repository, ISequenceGenerator sequenceGenerator, ILogger<Mission> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize)
        {
            return await _repository.SearchAsync(filters, page, pageSize);
        }

        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Mission?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<string> CreateAsync(MissionDTOForm missionDTO)
        {
            if (string.IsNullOrWhiteSpace(missionDTO.MissionId))
            {
                missionDTO.MissionId = _sequenceGenerator.GenerateSequence("seq_mission_id", "MIS", 6, "-");
            }

            var mission = new Mission(missionDTO);
            
            await _repository.AddAsync(mission);
            await _repository.SaveChangesAsync();
            _logger.LogInformation("Mission créée avec l'ID: {MissionId}", missionDTO.MissionId);
            return missionDTO.MissionId;
        }

        public async Task<bool> UpdateAsync(Mission mission)
        {
            var entity = await _repository.GetByIdAsync(mission.MissionId);
            if (entity == null) return false;

            entity.Name = mission.Name;
            entity.Description = mission.Description;
            entity.StartDate = mission.StartDate;
            entity.Site = mission.Site;

            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            await _repository.DeleteAsync(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<MissionStats> GetStatisticsAsync()
        {
            return await _repository.GetStatisticsAsync();
        }
    }
}