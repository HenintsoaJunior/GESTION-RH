using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.action_type;
using MyApp.Api.Entities.action_type;
using MyApp.Api.Repositories.action_type;

namespace MyApp.Api.Services.action_type
{
    public interface IActionTypeService
    {
        Task<IEnumerable<ActionTypeDto>> GetAllAsync();
        Task<ActionTypeDto?> GetByIdAsync(string id);
        Task<ActionTypeDto> CreateAsync(ActionTypeDto dto);
        Task<ActionTypeDto?> UpdateAsync(string id, ActionTypeDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class ActionTypeService : IActionTypeService
    {
        private readonly IActionTypeRepository _repository;

        public ActionTypeService(IActionTypeRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ActionTypeDto>> GetAllAsync()
        {
            try
            {
                var actionTypes = await _repository.GetAllAsync();
                return actionTypes.Select(MapToDto);
            }
            catch (Exception)
            {
                throw new Exception("Failed to retrieve action types.");
            }
        }

        public async Task<ActionTypeDto?> GetByIdAsync(string id)
        {
            try
            {
                var actionType = await _repository.GetByIdAsync(id);
                return actionType == null ? null : MapToDto(actionType);
            }
            catch (Exception)
            {
                throw new Exception($"Failed to retrieve action type with ID {id}.");
            }
        }

        public async Task<ActionTypeDto> CreateAsync(ActionTypeDto dto)
        {
            try
            {
                var actionType = new ActionType
                {
                    ActionTypeId = dto.ActionTypeId,
                    Type = dto.Type
                };
                var created = await _repository.CreateAsync(actionType);
                return MapToDto(created);
            }
            catch (DbUpdateException)
            {
                throw new Exception("An action type with this ID already exists.");
            }
            catch (Exception)
            {
                throw new Exception("Failed to create action type.");
            }
        }

        public async Task<ActionTypeDto?> UpdateAsync(string id, ActionTypeDto dto)
        {
            try
            {
                if (!await _repository.ExistsAsync(id))
                    return null;

                var actionType = new ActionType
                {
                    ActionTypeId = id,
                    Type = dto.Type
                };
                var updated = await _repository.UpdateAsync(actionType);
                return MapToDto(updated);
            }
            catch (DbUpdateException)
            {
                throw new Exception("Failed to update action type due to a database error.");
            }
            catch (Exception)
            {
                throw new Exception($"Failed to update action type with ID {id}.");
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
            catch (Exception)
            {
                throw new Exception($"Failed to delete action type with ID {id}.");
            }
        }

        private static ActionTypeDto MapToDto(ActionType actionType)
        {
            return new ActionTypeDto
            {
                ActionTypeId = actionType.ActionTypeId,
                Type = actionType.Type
            };
        }
    }
}