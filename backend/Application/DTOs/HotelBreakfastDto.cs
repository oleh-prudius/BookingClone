namespace Application.DTOs;

public class HotelBreakfastDto
{
    public long HotelId { get; set; }
    public long BreakfastId { get; set; }
    public string BreakfastName { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
