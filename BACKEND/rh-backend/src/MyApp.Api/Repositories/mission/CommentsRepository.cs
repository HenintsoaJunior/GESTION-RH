using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface ICommentsRepository
    {
        Task<IEnumerable<Comments>> GetAllAsync(bool includeRelated = false);
        Task<Comments?> GetByIdAsync(string id, bool includeRelated = false);
        Task AddAsync(Comments comment);
        void Update(Comments comment); // Changed from Task to void
        void Delete(Comments comment); // Changed from Task to void
        Task SaveChangesAsync();
    }

    public class CommentsRepository : ICommentsRepository
    {
        private readonly AppDbContext _context;

        public CommentsRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Comments>> GetAllAsync(bool includeRelated = false)
        {
            IQueryable<Comments> query = _context.Comments
                .OrderByDescending(c => c.CreatedAt);

            if (includeRelated)
            {
                query = query
                    .Include(c => c.User)
                    .Include(c => c.MissionComments);
            }

            return await query.ToListAsync();
        }

        public async Task<Comments?> GetByIdAsync(string id, bool includeRelated = false)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            IQueryable<Comments> query = _context.Comments;

            if (includeRelated)
            {
                query = query
                    .Include(c => c.User)
                    .Include(c => c.MissionComments);
            }

            return await query.FirstOrDefaultAsync(c => c.CommentId == id);
        }

        public async Task AddAsync(Comments comment)
        {
            if (comment == null)
            {
                throw new ArgumentNullException(nameof(comment));
            }

            await _context.Comments.AddAsync(comment);
        }

        public void Update(Comments comment)
        {
            if (comment == null)
            {
                throw new ArgumentNullException(nameof(comment));
            }

            _context.Comments.Update(comment);
            // SaveChangesAsync is called in the service layer to ensure transaction consistency
        }

        public void Delete(Comments comment)
        {
            if (comment == null)
            {
                throw new ArgumentNullException(nameof(comment));
            }

            _context.Comments.Remove(comment);
            // SaveChangesAsync is called in the service layer to ensure transaction consistency
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}