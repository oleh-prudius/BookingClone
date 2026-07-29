namespace Application.DTOs;

public class ChatDto
{
    public long Id { get; set; }
    public long CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public long RealtorId { get; set; }
    public string RealtorName { get; set; } = string.Empty;
}
