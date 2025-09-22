using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.users;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Utils.generator;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Api.Models.dto.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface ICommentsService
    {
        Task<IEnumerable<Comments>> GetAllAsync(bool includeRelated = false);
        Task<Comments?> GetByIdAsync(string id, bool includeRelated = false);
        Task<string> CreateAsync(CommentFormDTO comment);
        Task<bool> UpdateAsync(string id, CommentFormDTO comment);
        Task<bool> DeleteAsync(string id, string userId);
    }

    public class CommentsService : ICommentsService
    {
        private readonly ICommentsRepository _commentsRepository;
        private readonly IRecruitmentRequestCommentsRepository _recruitmentRequestCommentsRepository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly AppDbContext _context;

        public CommentsService(
            ICommentsRepository commentsRepository,
            IRecruitmentRequestCommentsRepository recruitmentRequestCommentsRepository,
            ISequenceGenerator sequenceGenerator,
            AppDbContext context)
        {
            _commentsRepository = commentsRepository ?? throw new ArgumentNullException(nameof(commentsRepository));
            _recruitmentRequestCommentsRepository = recruitmentRequestCommentsRepository ?? throw new ArgumentNullException(nameof(recruitmentRequestCommentsRepository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Comments>> GetAllAsync(bool includeRelated = false)
        {
            return await _commentsRepository.GetAllAsync(includeRelated);
        }

        public async Task<Comments?> GetByIdAsync(string id, bool includeRelated = false)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("Comment ID cannot be null or empty", nameof(id));
            }

            return await _commentsRepository.GetByIdAsync(id, includeRelated);
        }

        public async Task<string> CreateAsync(CommentFormDTO comment)
        {
            if (comment == null)
            {
                throw new ArgumentNullException(nameof(comment), "Comment cannot be null");
            }
            if (string.IsNullOrWhiteSpace(comment.RecruitmentRequestId))
            {
                throw new ArgumentException("RecruitmentRequestId cannot be null or empty", nameof(comment.RecruitmentRequestId));
            }
            if (string.IsNullOrWhiteSpace(comment.UserId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(comment.UserId));
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var commentId = _sequenceGenerator.GenerateSequence("seq_comments_id", "COM", 6, "-");
                var commentEntity = new Comments(comment) { CommentId = commentId };

                await _commentsRepository.AddAsync(commentEntity);

                var recruitmentRequestComment = new RecruitmentRequestComments
                {
                    RecruitmentRequestId = comment.RecruitmentRequestId,
                    CommentId = commentId
                };
                await _recruitmentRequestCommentsRepository.AddAsync(recruitmentRequestComment);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return commentId;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, CommentFormDTO comment)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("Comment ID cannot be null or empty", nameof(id));
            }
            if (comment == null)
            {
                throw new ArgumentNullException(nameof(comment), "Comment cannot be null");
            }
            if (string.IsNullOrWhiteSpace(comment.UserId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(comment.UserId));
            }

            var existingComment = await _commentsRepository.GetByIdAsync(id, includeRelated: true);
            if (existingComment == null)
            {
                throw new InvalidOperationException($"Comment with ID {id} does not exist");
            }

            // Authorization check: Ensure the user owns the comment
            if (existingComment.UserId != comment.UserId)
            {
                throw new UnauthorizedAccessException("User is not authorized to update this comment");
            }

            // Update only allowed fields from DTO
            existingComment.CommentText = comment.CommentText;
            existingComment.UpdatedAt = DateTime.UtcNow;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _commentsRepository.Update(existingComment);
                await _commentsRepository.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id, string userId)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("Comment ID cannot be null or empty", nameof(id));
            }
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(userId));
            }

            var existingComment = await _commentsRepository.GetByIdAsync(id, includeRelated: true);
            if (existingComment == null)
            {
                return false;
            }

            // Authorization check: Ensure the user owns the comment
            if (existingComment.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to delete this comment");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Delete related RecruitmentRequestComments
                var relatedComments = existingComment.RecruitmentRequestComments;
                foreach (var rrc in relatedComments)
                {
                    await _recruitmentRequestCommentsRepository.DeleteAsync(rrc);
                }

                _commentsRepository.Delete(existingComment);
                await _commentsRepository.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}