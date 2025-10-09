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
        public async Task<IActionResult> CreateComment([FromBody] CommentFormDTO comment)
        {
            try
            {
                if (comment == null)
                {
                    return BadRequest(new { Message = "Comment data cannot be null" });
                }

                var commentId = await _commentsService.CreateAsync(comment);
                return CreatedAtAction(nameof(GetCommentsByMission), new { comment.MissionId }, new { CommentId = commentId });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while creating the comment", Error = ex.Message });
            }
        }

        [HttpGet("by-mission/{missionId}")]
        public async Task<IActionResult> GetCommentsByMission(string missionId)
        {
            try
            {
                var comments = await _missionCommentsService.GetByMissionIdAsync(missionId);
                return Ok(comments);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving comments", Error = ex.Message });
            }
        }

        [HttpPut("{commentId}")]
        public async Task<IActionResult> UpdateComment(string commentId, [FromBody] CommentFormDTO comment)
        {
            if (string.IsNullOrEmpty(commentId))
            {
                return BadRequest(new { message = "Comment ID cannot be null or empty" });
            }
            if (comment == null)
            {
                return BadRequest(new { message = "Comment data cannot be null" });
            }

            try
            {
                var updatedComment = await _commentsService.UpdateAsync(commentId, comment);
                
                return Ok(new { message = $"Comment with ID {commentId} successfully updated", data = updatedComment });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the comment", error = ex.Message });
            }
        }

        [HttpDelete("{commentId}/mission/{missionId}")]
        public async Task<IActionResult> DeleteComment(string commentId, string missionId, [FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(commentId) || string.IsNullOrEmpty(missionId) || string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "Comment ID, Mission ID, and User ID are required" });
            }

            try
            {
                var relationshipDeleted = await _missionCommentsService.DeleteAsync(missionId, commentId, userId);
                if (!relationshipDeleted)
                {
                    return NotFound(new { message = $"Relationship between Mission {missionId} and Comment {commentId} not found" });
                }

                var commentDeleted = await _commentsService.DeleteAsync(commentId, userId);
                if (!commentDeleted)
                {
                    return NotFound(new { message = $"Comment with ID {commentId} not found" });
                }

                return Ok(new { 
                    message = $"Comment with ID {commentId} and its relationship with Mission {missionId} successfully deleted",
                    data = new { commentId, missionId }
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the comment", error = ex.Message });
            }
        }
    }
}