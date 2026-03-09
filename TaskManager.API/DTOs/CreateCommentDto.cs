namespace TaskManager.API.DTOs;

public class CreateCommentDto
{
    public string Content { get; set; } = string.Empty;
    public Guid TaskItemId { get; set; }
}