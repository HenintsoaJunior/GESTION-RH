using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.notifications;
using MyApp.Api.Services.notifications;

namespace MyApp.Api.Controllers.notifications
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationsService _notificationsService;
        private readonly INotificationRecipientsService _notificationRecipientsService;

        public NotificationsController(
            INotificationsService notificationsService,
            INotificationRecipientsService notificationRecipientsService)
        {
            _notificationsService = notificationsService ?? throw new ArgumentNullException(nameof(notificationsService));
            _notificationRecipientsService = notificationRecipientsService ?? throw new ArgumentNullException(nameof(notificationRecipientsService));
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationFormDTO notification)
        {
            try
            {
                if (notification == null)
                {
                    return BadRequest(new { Message = "Notification data cannot be null" });
                }

                var notificationId = await _notificationsService.CreateAsync(notification);
                return CreatedAtAction(nameof(GetNotificationById), new { id = notificationId }, new { NotificationId = notificationId });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while creating the notification", Error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotificationById(string id)
        {
            try
            {
                var notification = await _notificationsService.GetByIdAsync(id, includeRelated: true);
                if (notification == null)
                {
                    return NotFound(new { Message = $"Notification with ID {id} not found" });
                }
                return Ok(notification);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving the notification", Error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllNotifications()
        {
            try
            {
                var notifications = await _notificationsService.GetAllAsync(includeRelated: true);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving notifications", Error = ex.Message });
            }
        }

        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetNotificationsByUser(string userId)
        {
            try
            {
                var notificationRecipients = await _notificationRecipientsService.GetByUserIdAsync(userId);
                return Ok(notificationRecipients);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving notifications for user", Error = ex.Message });
            }
        }

        [HttpGet("by-user/{userId}/unread-count-by-menu")]
        public async Task<IActionResult> GetUnreadNotificationCountByMenu(string userId, [FromQuery] string? relatedMenu = null)
        {
            try
            {
                var unreadCounts = await _notificationRecipientsService.GetUnreadCountByRelatedMenuAsync(userId, relatedMenu);
                return Ok(unreadCounts);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving unread notification counts by menu", Error = ex.Message });
            }
        }
        [HttpGet("by-user/{userId}/last-three-unread")]
        public async Task<IActionResult> GetLastThreeUnreadNotifications(string userId)
        {
            try
            {
                var unreadNotifications = await _notificationRecipientsService.GetLastThreeUnreadAsync(userId);
                return Ok(unreadNotifications);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving unread notifications for user", Error = ex.Message });
            }
        }

        [HttpGet("by-user/{userId}/unread-count")]
        public async Task<IActionResult> GetUnreadNotificationCount(string userId)
        {
            try
            {
                var unreadCount = await _notificationRecipientsService.GetUnreadCountAsync(userId);
                return Ok(new { UnreadCount = unreadCount });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving unread notification count", Error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotification(string id, [FromBody] NotificationFormDTO notification)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { Message = "Notification ID cannot be null or empty" });
            }
            if (notification == null)
            {
                return BadRequest(new { Message = "Notification data cannot be null" });
            }

            try
            {
                var updated = await _notificationsService.UpdateAsync(id, notification);
                if (!updated)
                {
                    return NotFound(new { Message = $"Notification with ID {id} not found" });
                }
                return Ok(new { Message = $"Notification with ID {id} successfully updated", Data = id });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while updating the notification", Error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { Message = "Notification ID cannot be null or empty" });
            }

            try
            {
                var deleted = await _notificationsService.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { Message = $"Notification with ID {id} not found" });
                }
                return Ok(new { Message = $"Notification with ID {id} successfully deleted", Data = id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while deleting the notification", Error = ex.Message });
            }
        }

        [HttpDelete("{notificationId}/recipient/{userId}")]
        public async Task<IActionResult> DeleteNotificationRecipient(string notificationId, string userId)
        {
            if (string.IsNullOrEmpty(notificationId) || string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { Message = "Notification ID and User ID are required" });
            }

            try
            {
                var deleted = await _notificationRecipientsService.DeleteAsync(notificationId, userId);
                if (!deleted)
                {
                    return NotFound(new { Message = $"Recipient relationship for Notification {notificationId} and User {userId} not found" });
                }
                return Ok(new { 
                    Message = $"Recipient relationship for Notification {notificationId} and User {userId} successfully deleted",
                    Data = new { NotificationId = notificationId, UserId = userId }
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while deleting the recipient relationship", Error = ex.Message });
            }
        }
    }
}