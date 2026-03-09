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
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(claim!);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(CreateTaskDto dto)
    {
        var userId = GetUserId();

        var column = await _context.Columns
            .Include(c => c.Board)
            .FirstOrDefaultAsync(c => c.Id == dto.ColumnId && c.Board.UserId == userId);

        if (column == null)
            return NotFound(new { message = "Column not found" });

        var order = await _context.Tasks
            .Where(t => t.ColumnId == dto.ColumnId)
            .CountAsync();

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            ColumnId = dto.ColumnId,
            Order = order
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return Ok(new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Order = task.Order,
            ColumnId = task.ColumnId,
            CreatedAt = task.CreatedAt
        });
    }

    [HttpGet("column/{columnId}")]
    public async Task<IActionResult> GetTasks(Guid columnId)
    {
        var userId = GetUserId();

        var column = await _context.Columns
            .Include(c => c.Board)
            .FirstOrDefaultAsync(c => c.Id == columnId && c.Board.UserId == userId);

        if (column == null)
            return NotFound(new { message = "Column not found" });

        var tasks = await _context.Tasks
            .Where(t => t.ColumnId == columnId)
            .OrderBy(t => t.Order)
            .Select(t => new TaskResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Order = t.Order,
                ColumnId = t.ColumnId,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, UpdateTaskDto dto)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .Include(t => t.Column)
            .ThenInclude(c => c.Board)
            .FirstOrDefaultAsync(t => t.Id == id && t.Column.Board.UserId == userId);

        if (task == null)
            return NotFound(new { message = "Task not found" });

        task.Title = dto.Title;
        task.Description = dto.Description;

        await _context.SaveChangesAsync();

        return Ok(new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Order = task.Order,
            ColumnId = task.ColumnId,
            CreatedAt = task.CreatedAt
        });
    }

    [HttpPut("{id}/move")]
    public async Task<IActionResult> MoveTask(Guid id, MoveTaskDto dto)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .Include(t => t.Column)
            .ThenInclude(c => c.Board)
            .FirstOrDefaultAsync(t => t.Id == id && t.Column.Board.UserId == userId);

        if (task == null)
            return NotFound(new { message = "Task not found" });

        var targetColumn = await _context.Columns
            .Include(c => c.Board)
            .FirstOrDefaultAsync(c => c.Id == dto.ColumnId && c.Board.UserId == userId);

        if (targetColumn == null)
            return NotFound(new { message = "Target column not found" });

        task.ColumnId = dto.ColumnId;
        task.Order = dto.Order;

        await _context.SaveChangesAsync();

        return Ok(new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Order = task.Order,
            ColumnId = task.ColumnId,
            CreatedAt = task.CreatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .Include(t => t.Column)
            .ThenInclude(c => c.Board)
            .FirstOrDefaultAsync(t => t.Id == id && t.Column.Board.UserId == userId);

        if (task == null)
            return NotFound(new { message = "Task not found" });

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Task deleted successfully" });
    }
}