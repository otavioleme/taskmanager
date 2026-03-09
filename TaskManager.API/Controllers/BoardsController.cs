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
public class BoardsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BoardsController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(claim!);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoard(CreateBoardDto dto)
    {
        var board = new Board
        {
            Name = dto.Name,
            Description = dto.Description,
            UserId = GetUserId()
        };

        _context.Boards.Add(board);
        await _context.SaveChangesAsync();

        return Ok(new BoardResponseDto
        {
            Id = board.Id,
            Name = board.Name,
            Description = board.Description,
            CreatedAt = board.CreatedAt
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetBoards()
    {
        var userId = GetUserId();

        var boards = await _context.Boards
            .Where(b => b.UserId == userId)
            .Select(b => new BoardResponseDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(boards);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(Guid id)
    {
        var userId = GetUserId();

        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (board == null)
            return NotFound(new { message = "Board not found" });

        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Board deleted successfully" });
    }
}