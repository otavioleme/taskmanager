namespace TaskManager.API.DTOs;

public class TaskResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public Guid ColumnId { get; set; }
    public DateTime CreatedAt { get; set; }
}