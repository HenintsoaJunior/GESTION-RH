using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentsService _commentsService;
        private readonly IMissionCommentsService _missionCommentsService;

        public CommentsController(
            ICommentsService commentsService,
            IMissionCommentsService missionService)
        {
            _commentsService = commentsService ?? throw new ArgumentNullException(nameof(commentsService));
            _missionCommentsService = missionService ?? throw new ArgumentNullException(nameof(missionService));
        }

        [HttpPost("mission")]
        [AllowAnonymous]
        public async Task<ActionResult> CreateComment([FromBody] CommentFormDTO comment)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (comment == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Comment data cannot be null" });
            }

            try
            {
                var commentId = await _commentsService.CreateAsync(comment);
                var responseData = new { CommentId = commentId };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("by-mission/{missionId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetCommentsByMission(string missionId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(missionId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Mission ID cannot be null or empty" });
            }

            try
            {
                var comments = await _missionCommentsService.GetByMissionIdAsync(missionId);
                var responseData = comments;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{commentId}")]
        [AllowAnonymous]
        public async Task<ActionResult> UpdateComment(string commentId, [FromBody] CommentFormDTO comment)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(commentId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Comment ID cannot be null or empty" });
            }

            if (comment == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Comment data cannot be null" });
            }

            try
            {
                var updatedComment = await _commentsService.UpdateAsync(commentId, comment);
                var responseData = new { message = $"Comment with ID {commentId} successfully updated", data = updatedComment };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { data = (object?)null, status = 403, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpDelete("{commentId}/mission/{missionId}")]
        [AllowAnonymous]
        public async Task<ActionResult> DeleteComment(string commentId, string missionId, [FromQuery] string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(commentId) || string.IsNullOrEmpty(missionId) || string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Comment ID, Mission ID, and User ID are required" });
            }

            try
            {
                var relationshipDeleted = await _missionCommentsService.DeleteAsync(missionId, commentId, userId);
                if (!relationshipDeleted)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Relationship between Mission {missionId} and Comment {commentId} not found" });
                }

                var commentDeleted = await _commentsService.DeleteAsync(commentId, userId);
                if (!commentDeleted)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Comment with ID {commentId} not found" });
                }

                var responseData = new { 
                    message = $"Comment with ID {commentId} and its relationship with Mission {missionId} successfully deleted",
                    data = new { commentId, missionId }
                };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { data = (object?)null, status = 403, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}