// using Microsoft.Extensions.Configuration;
// using Microsoft.Extensions.Logging;
// using MyApp.Api.Entities.notifications;
// using MyApp.Api.Entities.users;
// using MyApp.Api.Services.notifications;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Text.RegularExpressions;
// using System.Threading.Tasks;
// using System.Web;
// using MyApp.Api.Models.classes.notifications;

// namespace MyApp.Api.Services.notifications
// {
//     public interface IUserService
//     {
//         Task<User?> GetByIdAsync(string id);
//         Task<IEnumerable<User>> GetAllAsync();
//     }

//     public interface IEmailSender
//     {
//         Task SendEmailAsync(string toEmail, string subject, string htmlBody, string plainTextBody);
//     }

//     public interface INotificationReminderService
//     {
//         Task<int> SendDailyRemindersAsync(int daysThreshold = 1);
//     }

//     public class NotificationReminderService : INotificationReminderService
//     {
//         private readonly INotificationRecipientsService _notificationRecipientsService;
//         private readonly INotificationsService _notificationsService;
//         private readonly IEmailSender _emailSender;
//         private readonly IUserService _userService;
//         private readonly ILogger<NotificationReminderService> _logger;

//         public NotificationReminderService(
//             INotificationRecipientsService notificationRecipientsService,
//             INotificationsService notificationsService,
//             IEmailSender emailSender,
//             IUserService userService,
//             ILogger<NotificationReminderService> logger)
//         {
//             _notificationRecipientsService = notificationRecipientsService ?? throw new ArgumentNullException(nameof(notificationRecipientsService));
//             _notificationsService = notificationsService ?? throw new ArgumentNullException(nameof(notificationsService));
//             _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
//             _userService = userService ?? throw new ArgumentNullException(nameof(userService));
//             _logger = logger ?? throw new ArgumentNullException(nameof(logger));
//         }

//         public async Task<int> SendDailyRemindersAsync(int daysThreshold = 1)
//         {
//             var cutoffDate = DateTime.UtcNow.AddDays(-daysThreshold);
//             var allUnreadRecipients = await GetUnreadRecipientsOlderThanAsync(cutoffDate);

//             if (!allUnreadRecipients.Any())
//             {
//                 _logger.LogInformation("Aucune notification non lue à relancer aujourd'hui.");
//                 return 0;
//             }

//             var reminderCount = 0;
//             foreach (var recipient in allUnreadRecipients)
//             {
//                 try
//                 {
//                     var notification = await _notificationsService.GetByIdAsync(recipient.NotificationId);
//                     if (notification == null)
//                     {
//                         _logger.LogWarning($"Notification {recipient.NotificationId} non trouvée pour le destinataire {recipient.UserId}.");
//                         continue;
//                     }

//                     var user = await _userService.GetByIdAsync(recipient.UserId);
//                     if (user == null || string.IsNullOrWhiteSpace(user.Email))
//                     {
//                         _logger.LogWarning($"Utilisateur {recipient.UserId} sans email valide.");
//                         continue;
//                     }

//                     var reminderSubject = $"Rappel : {notification.Title}";
//                     var reminderMessage = Template.GenerateReminderNotificationHtml(notification, user, cutoffDate);
//                     var plainTextMessage = Template.GenerateReminderPlainText(notification, user, cutoffDate);

//                     await _emailSender.SendEmailAsync(
//                         toEmail: user.Email,
//                         subject: reminderSubject,
//                         htmlBody: reminderMessage,
//                         plainTextBody: plainTextMessage);

//                     recipient.SentAt = DateTime.UtcNow;
//                     recipient.UpdatedAt = DateTime.UtcNow;
//                     recipient.Status = "reminded";

//                     await UpdateRecipientAsync(recipient);

//                     reminderCount++;
//                 }
//                 catch (Exception ex)
//                 {
//                     _logger.LogError(ex, $"Erreur lors de la relance pour {recipient.NotificationId} et {recipient.UserId}.");
//                 }
//             }
//             return reminderCount;
//         }

//         private async Task UpdateRecipientAsync(NotificationRecipients recipient)
//         {
//             var existing = await _notificationRecipientsService.GetByIdAsync(recipient.NotificationId, recipient.UserId);
//             if (existing != null)
//             {
//                 existing.SentAt = recipient.SentAt;
//                 existing.UpdatedAt = recipient.UpdatedAt;
//                 existing.Status = recipient.Status;
//             }
//         }

//         private async Task<IEnumerable<NotificationRecipients>> GetUnreadRecipientsOlderThanAsync(DateTime cutoffDate)
//         {
//             var allUsers = await _userService.GetAllAsync();
//             var allUnread = new List<NotificationRecipients>();

//             foreach (var user in allUsers)
//             {
//                 var userUnread = await _notificationRecipientsService.GetUnreadAsync(user.UserId);
//                 var oldUnread = userUnread.Where(nr => nr.SentAt < cutoffDate || nr.SentAt == null).ToList();
//                 allUnread.AddRange(oldUnread);
//             }

//             return allUnread;
//         }

//         private async Task<User?> GetUserByIdAsync(string userId)
//         {
//             return await _userService.GetByIdAsync(userId);
//         }

//         private async Task<IEnumerable<User>> GetAllUsersAsync()
//         {
//             return await _userService.GetAllAsync();
//         }
//     }
// }