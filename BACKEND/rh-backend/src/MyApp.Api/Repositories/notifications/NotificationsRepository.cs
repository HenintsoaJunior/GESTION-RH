using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.notifications;

namespace MyApp.Api.Repositories.notifications
{
    public interface INotificationsRepository
    {
        Task<IEnumerable<Notifications>> GetAllAsync(bool includeRelated = false);
        Task<Notifications?> GetByIdAsync(string id, bool includeRelated = false);
        Task AddAsync(Notifications notification);
        void Update(Notifications notification);
        void Delete(Notifications notification);
        Task SaveChangesAsync();
    }

    public class NotificationsRepository : INotificationsRepository
    {
        private readonly AppDbContext _context;

        public NotificationsRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Notifications>> GetAllAsync(bool includeRelated = false)
        {
            IQueryable<Notifications> query = _context.Notifications
                .OrderByDescending(n => n.CreatedAt);

            if (includeRelated)
            {
                query = query
                    .Include(n => n.NotificationRecipients)
                        .ThenInclude(nr => nr.User);
            }

            return await query.ToListAsync();
        }

        public async Task<Notifications?> GetByIdAsync(string id, bool includeRelated = false)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            IQueryable<Notifications> query = _context.Notifications;

            if (includeRelated)
            {
                query = query
                    .Include(n => n.NotificationRecipients)
                        .ThenInclude(nr => nr.User);
            }

            return await query.FirstOrDefaultAsync(n => n.NotificationId == id);
        }

        public async Task AddAsync(Notifications notification)
        {
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification));
            }

            await _context.Notifications.AddAsync(notification);
        }

        public void Update(Notifications notification)
        {
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification));
            }

            _context.Notifications.Update(notification);
        }

        public void Delete(Notifications notification)
        {
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification));
            }

            _context.Notifications.Remove(notification);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}