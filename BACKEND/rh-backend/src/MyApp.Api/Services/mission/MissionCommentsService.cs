
using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;

namespace MyApp.Api.Services.mission
{
    public interface IMissionCommentsService
    {
        Task<IEnumerable<MissionComments>> GetAllAsync();
        Task<MissionComments?> GetByIdAsync(string misisonId, string commentId);
        Task<IEnumerable<MissionComments>> GetByMissionIdAsync(string misisonId);
        Task<IEnumerable<MissionComments>> GetByCommentIdAsync(string commentId);
        Task CreateAsync(MissionComments MissionComments, string userId);
        Task<bool> DeleteAsync(string misisonId, string commentId, string userId);
    }

    public class MissionCommentsService : IMissionCommentsService
    {
        private readonly IMissionCommentsRepository _repository;

        public MissionCommentsService(IMissionCommentsRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<MissionComments>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<MissionComments?> GetByIdAsync(string misisonId, string commentId)
        {
            if (string.IsNullOrWhiteSpace(misisonId) || string.IsNullOrWhiteSpace(commentId))
            {
                return null;
            }
            return await _repository.GetByIdAsync(misisonId, commentId);
        }

        public async Task<IEnumerable<MissionComments>> GetByMissionIdAsync(string misisonId)
        {
            if (string.IsNullOrWhiteSpace(misisonId))
            {
                throw new ArgumentException("misisonId cannot be null or empty", nameof(misisonId));
            }
            return await _repository.GetByMissionIdAsync(misisonId);
        }

        public async Task<IEnumerable<MissionComments>> GetByCommentIdAsync(string commentId)
        {
            if (string.IsNullOrWhiteSpace(commentId))
            {
                throw new ArgumentException("CommentId cannot be null or empty", nameof(commentId));
            }
            return await _repository.GetByCommentIdAsync(commentId);
        }

        public async Task CreateAsync(MissionComments MissionComments, string userId)
        {
            if (MissionComments == null)
            {
                throw new ArgumentNullException(nameof(MissionComments), "MissionComments cannot be null");
            }
            await _repository.AddAsync(MissionComments);
            await _repository.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(string misisonId, string commentId, string userId)
        {
            if (string.IsNullOrWhiteSpace(misisonId) || string.IsNullOrWhiteSpace(commentId))
            {
                throw new ArgumentException("misisonId and CommentId cannot be null or empty");
            }
            var existing = await _repository.GetByIdAsync(misisonId, commentId);
            if (existing == null)
            {
                return false;
            }
            await _repository.DeleteAsync(existing);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}