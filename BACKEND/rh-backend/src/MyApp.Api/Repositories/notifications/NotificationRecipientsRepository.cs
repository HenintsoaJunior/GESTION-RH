using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.notifications;

namespace MyApp.Api.Repositories.notifications
{
    public interface INotificationRecipientsRepository
    {
        Task<IEnumerable<NotificationRecipients>> GetAllAsync();
        Task<NotificationRecipients?> GetByIdAsync(string notificationId, string userId);
        Task<IEnumerable<NotificationRecipients>> GetByNotificationIdAsync(string notificationId);
        Task<IEnumerable<NotificationRecipients>> GetByUserIdAsync(string userId);
        Task AddAsync(NotificationRecipients notificationRecipient);
        Task DeleteAsync(NotificationRecipients notificationRecipient);
        Task SaveChangesAsync();
    }

    public class NotificationRecipientsRepository : INotificationRecipientsRepository
    {
        private readonly AppDbContext _context;

        public NotificationRecipientsRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<NotificationRecipients>> GetAllAsync()
        {
            return await _context.NotificationRecipients
                .Include(nr => nr.Notification)
                .Include(nr => nr.User)
                .ToListAsync();
        }

        public async Task<NotificationRecipients?> GetByIdAsync(string notificationId, string userId)
        {
            return await _context.NotificationRecipients
                .Include(nr => nr.Notification)
                .Include(nr => nr.User)
                .FirstOrDefaultAsync(nr => nr.NotificationId == notificationId && nr.UserId == userId);
        }

        public async Task<IEnumerable<NotificationRecipients>> GetByNotificationIdAsync(string notificationId)
        {
            return await _context.NotificationRecipients
                .Where(nr => nr.NotificationId == notificationId)
                .Include(nr => nr.Notification)
                .Include(nr => nr.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<NotificationRecipients>> GetByUserIdAsync(string userId)
        {
            return await _context.NotificationRecipients
                .Where(nr => nr.UserId == userId)
                .Include(nr => nr.Notification)
                .Include(nr => nr.User)
                .ToListAsync();
        }

        public async Task AddAsync(NotificationRecipients notificationRecipient)
        {
            await _context.NotificationRecipients.AddAsync(notificationRecipient);
        }

        public async Task DeleteAsync(NotificationRecipients notificationRecipient)
        {
            _context.NotificationRecipients.Remove(notificationRecipient);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}