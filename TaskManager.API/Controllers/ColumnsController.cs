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
public class ColumnsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ColumnsController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(claim!);
    }

    [HttpPost]
    public async Task<IActionResult> CreateColumn(CreateColumnDto dto)
    {
        var userId = GetUserId();

        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == dto.BoardId && b.UserId == userId);

        if (board == null)
            return NotFound(new { message = "Board not found" });

        var order = await _context.Columns
            .Where(c => c.BoardId == dto.BoardId)
            .CountAsync();

        var column = new Column
        {
            Name = dto.Name,
            BoardId = dto.BoardId,
            Order = order
        };

        _context.Columns.Add(column);
        await _context.SaveChangesAsync();

        return Ok(new ColumnResponseDto
        {
            Id = column.Id,
            Name = column.Name,
            Order = column.Order,
            BoardId = column.BoardId
        });
    }

    [HttpGet("board/{boardId}")]
    public async Task<IActionResult> GetColumns(Guid boardId)
    {
        var userId = GetUserId();

        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == boardId && b.UserId == userId);

        if (board == null)
            return NotFound(new { message = "Board not found" });

        var columns = await _context.Columns
            .Where(c => c.BoardId == boardId)
            .OrderBy(c => c.Order)
            .Select(c => new ColumnResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Order = c.Order,
                BoardId = c.BoardId
            })
            .ToListAsync();

        return Ok(columns);
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderColumns(UpdateColumnOrderDto dto)
    {
        var userId = GetUserId();

        for (int i = 0; i < dto.ColumnIds.Count; i++)
        {
            var column = await _context.Columns
                .Include(c => c.Board)
                .FirstOrDefaultAsync(c => c.Id == dto.ColumnIds[i] && c.Board.UserId == userId);

            if (column == null)
                return NotFound(new { message = "Column not found" });

            column.Order = i;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Columns reordered successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteColumn(Guid id)
    {
        var userId = GetUserId();

        var column = await _context.Columns
            .Include(c => c.Board)
            .FirstOrDefaultAsync(c => c.Id == id && c.Board.UserId == userId);

        if (column == null)
            return NotFound(new { message = "Column not found" });

        _context.Columns.Remove(column);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Column deleted successfully" });
    }
}