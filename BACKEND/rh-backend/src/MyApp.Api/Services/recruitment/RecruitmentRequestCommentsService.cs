using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestCommentsService
    {
        Task<IEnumerable<RecruitmentRequestComments>> GetAllAsync();
        Task<RecruitmentRequestComments?> GetByIdAsync(string recruitmentRequestId, string commentId);
        Task<IEnumerable<RecruitmentRequestComments>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId);
        Task<IEnumerable<RecruitmentRequestComments>> GetByCommentIdAsync(string commentId);
        Task CreateAsync(RecruitmentRequestComments recruitmentRequestComment, string userId);
        Task<bool> DeleteAsync(string recruitmentRequestId, string commentId, string userId);
    }

    public class RecruitmentRequestCommentsService : IRecruitmentRequestCommentsService
    {
        private readonly IRecruitmentRequestCommentsRepository _repository;

        public RecruitmentRequestCommentsService(IRecruitmentRequestCommentsRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<RecruitmentRequestComments>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RecruitmentRequestComments?> GetByIdAsync(string recruitmentRequestId, string commentId)
        {
            if (string.IsNullOrWhiteSpace(recruitmentRequestId) || string.IsNullOrWhiteSpace(commentId))
            {
                return null;
            }
            return await _repository.GetByIdAsync(recruitmentRequestId, commentId);
        }

        public async Task<IEnumerable<RecruitmentRequestComments>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId)
        {
            if (string.IsNullOrWhiteSpace(recruitmentRequestId))
            {
                throw new ArgumentException("RecruitmentRequestId cannot be null or empty", nameof(recruitmentRequestId));
            }
            return await _repository.GetByRecruitmentRequestIdAsync(recruitmentRequestId);
        }

        public async Task<IEnumerable<RecruitmentRequestComments>> GetByCommentIdAsync(string commentId)
        {
            if (string.IsNullOrWhiteSpace(commentId))
            {
                throw new ArgumentException("CommentId cannot be null or empty", nameof(commentId));
            }
            return await _repository.GetByCommentIdAsync(commentId);
        }

        public async Task CreateAsync(RecruitmentRequestComments recruitmentRequestComment, string userId)
        {
            if (recruitmentRequestComment == null)
            {
                throw new ArgumentNullException(nameof(recruitmentRequestComment), "RecruitmentRequestComment cannot be null");
            }
            await _repository.AddAsync(recruitmentRequestComment);
            await _repository.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(string recruitmentRequestId, string commentId, string userId)
        {
            if (string.IsNullOrWhiteSpace(recruitmentRequestId) || string.IsNullOrWhiteSpace(commentId))
            {
                throw new ArgumentException("RecruitmentRequestId and CommentId cannot be null or empty");
            }
            var existing = await _repository.GetByIdAsync(recruitmentRequestId, commentId);
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