using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.departments;
using MyApp.Api.Entities.departments;
using MyApp.Api.Repositories.departments;

namespace MyApp.Api.Services.departments
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentDto>> GetAllAsync();
        Task<DepartmentDto?> GetByIdAsync(string id);
        Task<DepartmentDto> CreateAsync(DepartmentDto dto);
        Task<DepartmentDto?> UpdateAsync(string id, DepartmentDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repository;

        public DepartmentService(IDepartmentRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
        {
            try
            {
                var departments = await _repository.GetAllAsync();
                return departments.Select(MapToDto);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve departments.", ex);
            }
        }

        public async Task<DepartmentDto?> GetByIdAsync(string id)
        {
            try
            {
                var department = await _repository.GetByIdAsync(id);
                return department == null ? null : MapToDto(department);
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to retrieve department with ID {id}.", ex);
            }
        }

        public async Task<DepartmentDto> CreateAsync(DepartmentDto dto)
        {
            try
            {
                var department = new Department
                {
                    DepartmentId = dto.DepartmentId,
                    DepartmentName = dto.DepartmentName
                };
                var created = await _repository.CreateAsync(department);
                return MapToDto(created);
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("A department with this ID already exists.", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to create department.", ex);
            }
        }

        public async Task<DepartmentDto?> UpdateAsync(string id, DepartmentDto dto)
        {
            try
            {
                if (!await _repository.ExistsAsync(id))
                    return null;

                var department = new Department
                {
                    DepartmentId = id,
                    DepartmentName = dto.DepartmentName
                };
                var updated = await _repository.UpdateAsync(department);
                return MapToDto(updated);
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Failed to update department due to a database error.", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to update department with ID {id}.", ex);
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                if (!await _repository.ExistsAsync(id))
                    return false;

                await _repository.DeleteAsync(id);
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to delete department with ID {id}.", ex);
            }
        }

        private static DepartmentDto MapToDto(Department department)
        {
            return new DepartmentDto
            {
                DepartmentId = department.DepartmentId,
                DepartmentName = department.DepartmentName
            };
        }
    }
}