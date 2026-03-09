namespace TaskManager.API.DTOs;

public class CreateColumnDto
{
    public string Name { get; set; } = string.Empty;
    public Guid BoardId { get; set; }
}