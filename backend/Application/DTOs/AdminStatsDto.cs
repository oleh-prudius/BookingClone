namespace Application.DTOs;

public class AdminStatsDto
{
    public IReadOnlyList<BookingsPerDayDto> BookingsOverTime { get; set; } = [];
    public IReadOnlyList<TopHotelDto> TopHotels { get; set; } = [];
    public IReadOnlyList<BookingStatusCountDto> BookingStatusBreakdown { get; set; } = [];
    public IReadOnlyList<SignupsPerDayDto> NewUserSignupsOverTime { get; set; } = [];
}

public class BookingsPerDayDto
{
    public DateOnly Date { get; set; }
    public int Count { get; set; }
    public decimal Revenue { get; set; }
}

public class TopHotelDto
{
    public long HotelId { get; set; }
    public string HotelName { get; set; } = null!;
    public int BookingsCount { get; set; }
    public decimal Revenue { get; set; }
}

public class BookingStatusCountDto
{
    public string Status { get; set; } = null!;
    public int Count { get; set; }
}

public class SignupsPerDayDto
{
    public DateOnly Date { get; set; }
    public int Count { get; set; }
}
