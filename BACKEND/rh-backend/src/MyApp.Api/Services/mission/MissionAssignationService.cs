using MyApp.Api.Entities.mission;
using MyApp.Api.Models.form.mission;
using MyApp.Api.Repositories.mission;

namespace MyApp.Api.Services.mission
{
    public interface IMissionAssignationService
    {
        Task<IEnumerable<MissionAssignation>> GetAllAsync();
        Task<MissionAssignation?> GetByKeyAsync(string employeeId, string missionId);
        Task CreateAsync(MissionAssignationDTOForm dto);
        Task<bool> UpdateAsync(MissionAssignationDTOForm dto);
        Task<bool> DeleteAsync(string employeeId, string missionId);
    }

    public class MissionAssignationService : IMissionAssignationService
    {
        private readonly IMissionAssignationRepository _repository;

        public MissionAssignationService(IMissionAssignationRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MissionAssignation>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<MissionAssignation?> GetByKeyAsync(string employeeId, string missionId)
        {
            return await _repository.GetByKeyAsync(employeeId, missionId);
        }

        public async Task CreateAsync(MissionAssignationDTOForm dto)
        {
            var entity = new MissionAssignation
            {
                EmployeeId = dto.EmployeeId,
                MissionId = dto.MissionId,
                TransportId = dto.TransportId,
                DepartureDate = dto.DepartureDate,
                DepartureTime = dto.DepartureTime,
                ReturnDate = dto.ReturnDate,
                ReturnTime = dto.ReturnTime,
                Duration = dto.Duration,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task<bool> UpdateAsync(MissionAssignationDTOForm dto)
        {
            var entity = await _repository.GetByKeyAsync(dto.EmployeeId, dto.MissionId);
            if (entity == null) return false;

            entity.DepartureDate = dto.DepartureDate;
            entity.DepartureTime = dto.DepartureTime;
            entity.ReturnDate = dto.ReturnDate;
            entity.ReturnTime = dto.ReturnTime;
            entity.Duration = dto.Duration;
            entity.UpdatedAt = DateTime.Now;

            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string employeeId, string missionId)
        {
            var entity = await _repository.GetByKeyAsync(employeeId, missionId);
            if (entity == null) return false;

            await _repository.DeleteAsync(entity);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
