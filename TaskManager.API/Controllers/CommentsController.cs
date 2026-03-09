using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CommentsController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(claim!);
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment(CreateCommentDto dto)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .Include(t => t.Column)
            .ThenInclude(c => c.Board)
            .FirstOrDefaultAsync(t => t.Id == dto.TaskItemId && t.Column.Board.UserId == userId);

        if (task == null)
            return NotFound(new { message = "Task not found" });

        var comment = new Comment
        {
            Content = dto.Content,
            TaskItemId = dto.TaskItemId,
            UserId = userId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return Ok(new CommentResponseDto
        {
            Id = comment.Id,
            Content = comment.Content,
            TaskItemId = comment.TaskItemId,
            UserId = comment.UserId,
            UserName = user!.Name,
            CreatedAt = comment.CreatedAt
        });
    }

    [HttpGet("task/{taskId}")]
    public async Task<IActionResult> GetComments(Guid taskId)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .Include(t => t.Column)
            .ThenInclude(c => c.Board)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.Column.Board.UserId == userId);

        if (task == null)
            return NotFound(new { message = "Task not found" });

        var comments = await _context.Comments
            .Include(c => c.User)
            .Where(c => c.TaskItemId == taskId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentResponseDto
            {
                Id = c.Id,
                Content = c.Content,
                TaskItemId = c.TaskItemId,
                UserId = c.UserId,
                UserName = c.User.Name,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(comments);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var userId = GetUserId();

        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (comment == null)
            return NotFound(new { message = "Comment not found" });

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Comment deleted successfully" });
    }
}