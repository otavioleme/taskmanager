namespace TaskManager.API.DTOs;

public class MoveTaskDto
{
    public Guid ColumnId { get; set; }
    public int Order { get; set; }
}