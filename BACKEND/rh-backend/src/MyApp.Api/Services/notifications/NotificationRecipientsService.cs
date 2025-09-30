using MyApp.Api.Data;
using MyApp.Api.Entities.notifications;
using MyApp.Api.Repositories.notifications;
using Microsoft.EntityFrameworkCore;

namespace MyApp.Api.Services.notifications
{
    public interface INotificationRecipientsService
    {
        Task<IEnumerable<NotificationRecipients>> GetAllAsync();
        Task<NotificationRecipients?> GetByIdAsync(string notificationId, string userId);
        Task<IEnumerable<NotificationRecipients>> GetByNotificationIdAsync(string notificationId);
        Task<IEnumerable<NotificationRecipients>> GetByUserIdAsync(string userId);
        Task CreateAsync(NotificationRecipients notificationRecipient);
        Task<bool> DeleteAsync(string notificationId, string userId);
        Task<IEnumerable<NotificationRecipients>> GetLastThreeUnreadAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<Dictionary<string, int>> GetUnreadCountByRelatedMenuAsync(string userId, string? relatedMenu = null);
    }

    public class NotificationRecipientsService : INotificationRecipientsService
    {
        private readonly INotificationRecipientsRepository _repository;

        public NotificationRecipientsService(INotificationRecipientsRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<NotificationRecipients>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<NotificationRecipients?> GetByIdAsync(string notificationId, string userId)
        {
            if (string.IsNullOrWhiteSpace(notificationId) || string.IsNullOrWhiteSpace(userId))
            {
                return null;
            }
            return await _repository.GetByIdAsync(notificationId, userId);
        }

        public async Task<IEnumerable<NotificationRecipients>> GetByNotificationIdAsync(string notificationId)
        {
            if (string.IsNullOrWhiteSpace(notificationId))
            {
                throw new ArgumentException("NotificationId cannot be null or empty", nameof(notificationId));
            }
            return await _repository.GetByNotificationIdAsync(notificationId);
        }

        public async Task<IEnumerable<NotificationRecipients>> GetByUserIdAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(userId));
            }
            return await _repository.GetByUserIdAsync(userId);
        }

        public async Task CreateAsync(NotificationRecipients notificationRecipient)
        {
            if (notificationRecipient == null)
            {
                throw new ArgumentNullException(nameof(notificationRecipient), "NotificationRecipient cannot be null");
            }
            await _repository.AddAsync(notificationRecipient);
            await _repository.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(string notificationId, string userId)
        {
            if (string.IsNullOrWhiteSpace(notificationId) || string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("NotificationId and UserId cannot be null or empty");
            }
            var existing = await _repository.GetByIdAsync(notificationId, userId);
            if (existing == null)
            {
                return false;
            }
            await _repository.DeleteAsync(existing);
            return true;
        }

        public async Task<IEnumerable<NotificationRecipients>> GetLastThreeUnreadAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(userId));
            }

            return await _repository.GetByUserIdAsync(userId)
                .ContinueWith(task => task.Result
                    .Where(nr => nr.ReadAt == null)
                    .OrderByDescending(nr => nr.CreatedAt)
                    .Take(3)
                    .ToList());
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(userId));
            }

            return await _repository.GetByUserIdAsync(userId)
                .ContinueWith(task => task.Result
                    .Count(nr => nr.ReadAt == null));
        }

        public async Task<Dictionary<string, int>> GetUnreadCountByRelatedMenuAsync(string userId, string? relatedMenu = null)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(userId));
            }

            var notificationRecipients = await _repository.GetByUserIdAsync(userId);

            var query = notificationRecipients
                .Where(nr => nr.ReadAt == null && nr.Notification != null);

            if (!string.IsNullOrWhiteSpace(relatedMenu))
            {
                query = query.Where(nr => nr.Notification!.RelatedMenu == relatedMenu);
            }

            var unreadCounts = query
                .GroupBy(nr => nr.Notification!.RelatedMenu ?? "Unspecified")
                .Select(g => new
                {
                    RelatedMenu = g.Key,
                    Count = g.Count()
                })
                .ToDictionary(
                    item => item.RelatedMenu,
                    item => item.Count
                );

            if (!string.IsNullOrWhiteSpace(relatedMenu) && !unreadCounts.ContainsKey(relatedMenu))
            {
                return new Dictionary<string, int> { { relatedMenu, 0 } };
            }

            return unreadCounts;
        }
    }
}