using MyApp.Api.Data;
using MyApp.Api.Entities.notifications;
using MyApp.Api.Repositories.notifications;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
        Task UpdateAsync(NotificationRecipients notificationRecipient); // AJOUT : Méthode pour mises à jour générales
        Task<IEnumerable<NotificationRecipients>> GetLastThreeUnreadAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<Dictionary<string, int>> GetUnreadCountByRelatedMenuAsync(string userId, string? relatedMenu = null);
        Task<IEnumerable<NotificationRecipients>> GetUnreadAsync(string userId);
        Task<bool> MarkAsReadAsync(string notificationId, string userId);
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
            await _repository.SaveChangesAsync(); // CORRECTION : Ajout de SaveChangesAsync pour persister la suppression
            return true;
        }

        // AJOUT : Implémentation de UpdateAsync (modifie et persiste ; assume EF tracke l'entité ou utilise repository.Update si nécessaire)
        public async Task UpdateAsync(NotificationRecipients notificationRecipient)
        {
            if (notificationRecipient == null)
            {
                throw new ArgumentNullException(nameof(notificationRecipient), "NotificationRecipient cannot be null");
            }

            // Optionnel : Marquer comme modifié si le repository le supporte (e.g., _repository.Update(notificationRecipient);)
            // Si l'entité est trackée (via GetByIdAsync), EF détecte les changements automatiquement.
            // Adaptez si votre repository n'a pas Update : await _repository.UpdateAsync(notificationRecipient);

            notificationRecipient.UpdatedAt = DateTime.UtcNow; // Mise à jour automatique du timestamp (optionnel, selon votre modèle)

            await _repository.SaveChangesAsync();
        }

        public async Task<bool> MarkAsReadAsync(string notificationId, string userId)
        {
            if (string.IsNullOrWhiteSpace(notificationId) || string.IsNullOrWhiteSpace(userId))
            {
                return false;
            }

            var existing = await _repository.GetByIdAsync(notificationId, userId);
            if (existing == null || existing.ReadAt != null)
            {
                return false;
            }

            existing.ReadAt = DateTime.UtcNow;
            await _repository.SaveChangesAsync();
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

        public async Task<IEnumerable<NotificationRecipients>> GetUnreadAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("UserId cannot be null or empty", nameof(userId));
            }

            var notificationRecipients = await _repository.GetByUserIdAsync(userId);
            return notificationRecipients
                .Where(nr => nr.ReadAt == null)
                .OrderByDescending(nr => nr.CreatedAt);
        }
    }
}