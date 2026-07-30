namespace Domain.Interfaces.Repositories;

public record BookingsPerDay(DateOnly Date, int Count, decimal Revenue);

public record TopHotelStat(long HotelId, string HotelName, int BookingsCount, decimal Revenue);

public record BookingStatusCount(string Status, int Count);

public record SignupsPerDay(DateOnly Date, int Count);

public interface IAdminStatsRepository
{
    Task<IReadOnlyList<BookingsPerDay>> GetBookingsPerDayAsync(DateOnly from, CancellationToken ct = default);
    Task<IReadOnlyList<TopHotelStat>> GetTopHotelsAsync(DateOnly from, int take, CancellationToken ct = default);
    Task<IReadOnlyList<BookingStatusCount>> GetBookingStatusBreakdownAsync(CancellationToken ct = default);
    Task<IReadOnlyList<SignupsPerDay>> GetSignupsPerDayAsync(DateOnly from, CancellationToken ct = default);
}
