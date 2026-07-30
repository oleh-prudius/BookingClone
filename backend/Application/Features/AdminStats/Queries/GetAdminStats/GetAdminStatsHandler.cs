using Application.DTOs;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.AdminStats.Queries.GetAdminStats;

public class GetAdminStatsHandler(IAdminStatsRepository adminStatsRepository)
    : IRequestHandler<GetAdminStatsQuery, Result<AdminStatsDto>>
{
    public async Task<Result<AdminStatsDto>> Handle(GetAdminStatsQuery request, CancellationToken ct)
    {
        var from = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-request.Days);

        var bookingsPerDay = await adminStatsRepository.GetBookingsPerDayAsync(from, ct);
        var topHotels = await adminStatsRepository.GetTopHotelsAsync(from, request.TopHotelsCount, ct);
        var statusBreakdown = await adminStatsRepository.GetBookingStatusBreakdownAsync(ct);
        var signupsPerDay = await adminStatsRepository.GetSignupsPerDayAsync(from, ct);

        return new AdminStatsDto
        {
            BookingsOverTime = bookingsPerDay
                .Select(b => new BookingsPerDayDto { Date = b.Date, Count = b.Count, Revenue = b.Revenue })
                .ToList(),
            TopHotels = topHotels
                .Select(h => new TopHotelDto { HotelId = h.HotelId, HotelName = h.HotelName, BookingsCount = h.BookingsCount, Revenue = h.Revenue })
                .ToList(),
            BookingStatusBreakdown = statusBreakdown
                .Select(s => new BookingStatusCountDto { Status = s.Status, Count = s.Count })
                .ToList(),
            NewUserSignupsOverTime = signupsPerDay
                .Select(s => new SignupsPerDayDto { Date = s.Date, Count = s.Count })
                .ToList()
        };
    }
}
