using MyApp.Api.Entities.application;
using MyApp.Api.Models.dto.application;
using MyApp.Api.Repositories.application;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.application
{
    public interface IApplicationCommentService
    {
        Task<IEnumerable<ApplicationComment>> GetAllAsync();
        Task<ApplicationComment?> GetByIdAsync(string id);
        Task<IEnumerable<ApplicationComment>> GetByApplicationIdAsync(string applicationId);
        Task<string> CreateAsync(ApplicationCommentDTOForm dto);
        Task<ApplicationComment?> UpdateAsync(string id, ApplicationCommentDTOForm dto);
        Task<bool> DeleteAsync(string id);
    }

    public class ApplicationCommentService : IApplicationCommentService
    {
        private readonly IApplicationCommentRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ApplicationCommentService> _logger;

        public ApplicationCommentService(
            IApplicationCommentRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<ApplicationCommentService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<ApplicationComment>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les commentaires");
                throw;
            }
        }

        public async Task<ApplicationComment?> GetByIdAsync(string id)
        {
            try
            {
                var comment = await _repository.GetByIdAsync(id);
                return comment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du commentaire {CommentId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<ApplicationComment>> GetByApplicationIdAsync(string applicationId)
        {
            try
            {
                return await _repository.GetByApplicationIdAsync(applicationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des commentaires pour l'application {ApplicationId}", applicationId);
                throw;
            }
        }

        public async Task<string> CreateAsync(ApplicationCommentDTOForm dto)
        {
            try
            {
                var entity = new ApplicationComment(dto);
                if (string.IsNullOrWhiteSpace(entity.CommentId))
                {
                    entity.CommentId = _sequenceGenerator.GenerateSequence("seq_application_comment_id", "APPCOMM", 6, "-");
                }

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Commentaire {CommentId} créé", entity.CommentId);

                return entity.CommentId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'un commentaire");
                throw;
            }
        }

        public async Task<ApplicationComment?> UpdateAsync(string id, ApplicationCommentDTOForm dto)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return null;

                entity = new ApplicationComment(dto);

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Commentaire {CommentId} mis à jour", id);

                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du commentaire {CommentId}", id);
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

                _logger.LogInformation("Commentaire {CommentId} supprimé", id);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du commentaire {CommentId}", id);
                throw;
            }
        }
    }
}
