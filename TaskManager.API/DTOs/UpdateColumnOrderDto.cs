namespace TaskManager.API.DTOs;

public class UpdateColumnOrderDto
{
    public List<Guid> ColumnIds { get; set; } = new List<Guid>();
}