namespace Application.DTOs;

public class HotelReviewDto
{
    public long Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public double? Score { get; set; }
    public long BookingId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}
