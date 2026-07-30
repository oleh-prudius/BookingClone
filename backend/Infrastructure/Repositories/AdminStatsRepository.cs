using Domain.Enums;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AdminStatsRepository(AppDbContext context) : IAdminStatsRepository
{
    public async Task<IReadOnlyList<BookingsPerDay>> GetBookingsPerDayAsync(DateOnly from, CancellationToken ct = default)
    {
        var fromInstant = new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

        var rows = await context.Bookings
            .Where(b => b.CreatedAtUtc >= fromInstant)
            .Select(b => new { b.CreatedAtUtc, b.AmountToPay, b.Status })
            .ToListAsync(ct);

        return rows
            .GroupBy(b => DateOnly.FromDateTime(b.CreatedAtUtc.UtcDateTime))
            .Select(g => new BookingsPerDay(
                g.Key,
                g.Count(),
                g.Where(b => b.Status != BookingStatus.Cancelled).Sum(b => b.AmountToPay)))
            .OrderBy(p => p.Date)
            .ToList()
            .AsReadOnly();
    }

    public async Task<IReadOnlyList<TopHotelStat>> GetTopHotelsAsync(DateOnly from, int take, CancellationToken ct = default)
    {
        var fromInstant = new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

        var rows = await context.Bookings
            .Where(b => b.CreatedAtUtc >= fromInstant && b.Status != BookingStatus.Cancelled)
            .Select(b => new
            {
                b.AmountToPay,
                Hotel = b.BookingRoomVariants
                    .Select(brv => brv.RoomVariant.Room.Hotel)
                    .FirstOrDefault()
            })
            .Where(x => x.Hotel != null)
            .ToListAsync(ct);

        return rows
            .GroupBy(x => new { x.Hotel!.Id, x.Hotel.Name })
            .Select(g => new TopHotelStat(g.Key.Id, g.Key.Name, g.Count(), g.Sum(x => x.AmountToPay)))
            .OrderByDescending(h => h.Revenue)
            .Take(take)
            .ToList()
            .AsReadOnly();
    }

    public async Task<IReadOnlyList<BookingStatusCount>> GetBookingStatusBreakdownAsync(CancellationToken ct = default)
    {
        var rows = await context.Bookings
            .GroupBy(b => b.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        return rows
            .Select(x => new BookingStatusCount(x.Status.ToString(), x.Count))
            .ToList()
            .AsReadOnly();
    }

    public async Task<IReadOnlyList<SignupsPerDay>> GetSignupsPerDayAsync(DateOnly from, CancellationToken ct = default)
    {
        var fromInstant = new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

        var rows = await context.Users
            .Where(u => u.CreatedAtUtc >= fromInstant)
            .Select(u => u.CreatedAtUtc)
            .ToListAsync(ct);

        return rows
            .GroupBy(c => DateOnly.FromDateTime(c.UtcDateTime))
            .Select(g => new SignupsPerDay(g.Key, g.Count()))
            .OrderBy(p => p.Date)
            .ToList()
            .AsReadOnly();
    }
}
