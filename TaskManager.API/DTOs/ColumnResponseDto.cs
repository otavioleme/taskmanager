namespace TaskManager.API.DTOs;

public class ColumnResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public Guid BoardId { get; set; }
}