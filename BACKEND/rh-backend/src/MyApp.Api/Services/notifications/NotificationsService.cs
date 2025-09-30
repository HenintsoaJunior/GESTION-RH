using MyApp.Api.Data;
using MyApp.Api.Utils.generator;
using MyApp.Api.Entities.notifications;
using MyApp.Api.Repositories.notifications;
using MyApp.Api.Models.dto.notifications;
using Microsoft.EntityFrameworkCore.Storage;

namespace MyApp.Api.Services.notifications
{
    public interface INotificationsService
    {
        Task<IEnumerable<Notifications>> GetAllAsync(bool includeRelated = false);
        Task<Notifications?> GetByIdAsync(string id, bool includeRelated = false);
        Task<string> CreateAsync(NotificationFormDTO notification, IDbContextTransaction? existingTransaction = null);
        Task<bool> UpdateAsync(string id, NotificationFormDTO notification);
        Task<bool> DeleteAsync(string id);
    }

    public class NotificationsService : INotificationsService
    {
        private readonly INotificationsRepository _notificationsRepository;
        private readonly INotificationRecipientsRepository _notificationRecipientsRepository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly AppDbContext _context;

        public NotificationsService(
            INotificationsRepository notificationsRepository,
            INotificationRecipientsRepository notificationRecipientsRepository,
            ISequenceGenerator sequenceGenerator,
            AppDbContext context)
        {
            _notificationsRepository = notificationsRepository ?? throw new ArgumentNullException(nameof(notificationsRepository));
            _notificationRecipientsRepository = notificationRecipientsRepository ?? throw new ArgumentNullException(nameof(notificationRecipientsRepository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Notifications>> GetAllAsync(bool includeRelated = false)
        {
            return await _notificationsRepository.GetAllAsync(includeRelated);
        }

        public async Task<Notifications?> GetByIdAsync(string id, bool includeRelated = false)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("Notification ID cannot be null or empty", nameof(id));
            }

            return await _notificationsRepository.GetByIdAsync(id, includeRelated);
        }

        public async Task<string> CreateAsync(NotificationFormDTO notification, IDbContextTransaction? existingTransaction = null)
        {
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification), "Notification cannot be null");
            }
            if (!notification.UserIds.Any())
            {
                throw new ArgumentException("At least one recipient UserId must be provided", nameof(notification.UserIds));
            }

            bool ownsTransaction = existingTransaction == null;
            IDbContextTransaction transaction = existingTransaction ?? await _context.Database.BeginTransactionAsync();

            try
            {
                var notificationId = _sequenceGenerator.GenerateSequence("seq_notifications_id", "NOT", 6, "-");
                var notificationEntity = new Notifications(notification) { NotificationId = notificationId };

                await _notificationsRepository.AddAsync(notificationEntity);

                foreach (var userId in notification.UserIds)
                {
                    var recipient = new NotificationRecipients
                    {
                        NotificationId = notificationId,
                        UserId = userId,
                        Status = "pending",
                        CreatedAt = DateTime.UtcNow
                    };
                    await _notificationRecipientsRepository.AddAsync(recipient);
                }

                await _context.SaveChangesAsync();

                if (ownsTransaction)
                {
                    await transaction.CommitAsync();
                }

                return notificationId;
            }
            catch
            {
                if (ownsTransaction)
                {
                    await transaction.RollbackAsync();
                }
                throw;
            }
            finally
            {
                if (ownsTransaction)
                {
                    await transaction.DisposeAsync();
                }
            }
        }

        public async Task<bool> UpdateAsync(string id, NotificationFormDTO notification)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("Notification ID cannot be null or empty", nameof(id));
            }
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification), "Notification cannot be null");
            }

            var existingNotification = await _notificationsRepository.GetByIdAsync(id, includeRelated: true);
            if (existingNotification == null)
            {
                throw new InvalidOperationException($"Notification with ID {id} does not exist");
            }

            IDbContextTransaction transaction = _context.Database.CurrentTransaction ?? await _context.Database.BeginTransactionAsync();
            bool ownsTransaction = _context.Database.CurrentTransaction == null;

            try
            {
                // Update notification fields
                existingNotification.Title = notification.Title;
                existingNotification.Message = notification.Message;
                existingNotification.Type = notification.Type;
                existingNotification.RelatedTable = notification.RelatedTable;
                existingNotification.RelatedId = notification.RelatedId;
                existingNotification.Priority = notification.Priority;
                existingNotification.UpdatedAt = DateTime.UtcNow;

                // Update recipients
                var existingRecipients = existingNotification.NotificationRecipients.ToList();
                foreach (var recipient in existingRecipients)
                {
                    if (!notification.UserIds.Contains(recipient.UserId))
                    {
                        await _notificationRecipientsRepository.DeleteAsync(recipient);
                    }
                }

                foreach (var userId in notification.UserIds)
                {
                    if (!existingRecipients.Any(r => r.UserId == userId))
                    {
                        var newRecipient = new NotificationRecipients
                        {
                            NotificationId = id,
                            UserId = userId,
                            Status = "pending",
                            CreatedAt = DateTime.UtcNow
                        };
                        await _notificationRecipientsRepository.AddAsync(newRecipient);
                    }
                }

                _notificationsRepository.Update(existingNotification);
                await _notificationsRepository.SaveChangesAsync();

                if (ownsTransaction)
                {
                    await transaction.CommitAsync();
                }
                return true;
            }
            catch
            {
                if (ownsTransaction)
                {
                    await transaction.RollbackAsync();
                }
                throw;
            }
            finally
            {
                if (ownsTransaction)
                {
                    await transaction.DisposeAsync();
                }
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("Notification ID cannot be null or empty", nameof(id));
            }

            var existingNotification = await _notificationsRepository.GetByIdAsync(id, includeRelated: true);
            if (existingNotification == null)
            {
                return false;
            }

            IDbContextTransaction transaction = _context.Database.CurrentTransaction ?? await _context.Database.BeginTransactionAsync();
            bool ownsTransaction = _context.Database.CurrentTransaction == null;

            try
            {
                // Delete related NotificationRecipients
                var recipients = existingNotification.NotificationRecipients.ToList();
                foreach (var recipient in recipients)
                {
                    await _notificationRecipientsRepository.DeleteAsync(recipient);
                }

                _notificationsRepository.Delete(existingNotification);
                await _notificationsRepository.SaveChangesAsync();

                if (ownsTransaction)
                {
                    await transaction.CommitAsync();
                }
                return true;
            }
            catch
            {
                if (ownsTransaction)
                {
                    await transaction.RollbackAsync();
                }
                throw;
            }
            finally
            {
                if (ownsTransaction)
                {
                    await transaction.DisposeAsync();
                }
            }
        }
    }
}