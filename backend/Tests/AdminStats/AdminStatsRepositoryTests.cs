using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Tests.Fixtures;
using Tests.Helpers;

namespace Tests.AdminStats;

[Collection("Database")]
public class AdminStatsRepositoryTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private Infrastructure.Data.AppDbContext _ctx = null!;

    public async Task InitializeAsync() => _ctx = fixture.CreateContext();
    public async Task DisposeAsync() => await _ctx.DisposeAsync();

    [Fact]
    public async Task GetBookingsPerDay_ExcludesCancelledFromRevenueButNotFromCount()
    {
        var (customer, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var today = DateTimeOffset.UtcNow;
        var todayDate = DateOnly.FromDateTime(today.UtcDateTime);

        var repo = new AdminStatsRepository(_ctx);
        var before = await repo.GetBookingsPerDayAsync(todayDate);
        var beforeStats = before.FirstOrDefault(r => r.Date == todayDate);
        var (beforeCount, beforeRevenue) = (beforeStats?.Count ?? 0, beforeStats?.Revenue ?? 0m);

        _ctx.Bookings.AddRange(
            new Booking
            {
                CustomerId = customer.Id,
                CreatedAtUtc = today,
                DateFrom = new DateOnly(2027, 1, 1),
                DateTo = new DateOnly(2027, 1, 5),
                AmountToPay = 100m,
                EstimatedTimeOfArrivalUtc = today,
                Status = BookingStatus.Confirmed,
                BookingRoomVariants = new List<BookingRoomVariant> { new() { RoomVariantId = variant.Id, Quantity = 1 } }
            },
            new Booking
            {
                CustomerId = customer.Id,
                CreatedAtUtc = today,
                DateFrom = new DateOnly(2027, 1, 1),
                DateTo = new DateOnly(2027, 1, 5),
                AmountToPay = 50m,
                EstimatedTimeOfArrivalUtc = today,
                Status = BookingStatus.Cancelled,
                BookingRoomVariants = new List<BookingRoomVariant> { new() { RoomVariantId = variant.Id, Quantity = 1 } }
            });
        await _ctx.SaveChangesAsync();

        var after = await repo.GetBookingsPerDayAsync(todayDate);
        var afterStats = after.Single(r => r.Date == todayDate);

        // Shared DB across the test suite means other tests' bookings may also land in
        // "today" - compare the delta caused by this test's own seeded data instead of
        // asserting an absolute total.
        afterStats.Count.Should().Be(beforeCount + 2);
        afterStats.Revenue.Should().Be(beforeRevenue + 100m);
    }

    [Fact]
    public async Task GetTopHotels_AttributesRevenueToCorrectHotel()
    {
        var (customer, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var today = DateTimeOffset.UtcNow;
        var room = await _ctx.Rooms.SingleAsync(r => r.Id == variant.RoomId);

        _ctx.Bookings.Add(new Booking
        {
            CustomerId = customer.Id,
            CreatedAtUtc = today,
            DateFrom = new DateOnly(2027, 2, 1),
            DateTo = new DateOnly(2027, 2, 5),
            AmountToPay = 300m,
            EstimatedTimeOfArrivalUtc = today,
            Status = BookingStatus.Confirmed,
            BookingRoomVariants = new List<BookingRoomVariant> { new() { RoomVariantId = variant.Id, Quantity = 1 } }
        });
        await _ctx.SaveChangesAsync();

        var repo = new AdminStatsRepository(_ctx);
        var result = await repo.GetTopHotelsAsync(DateOnly.FromDateTime(today.UtcDateTime), int.MaxValue);

        result.Should().ContainSingle(h => h.HotelId == room.HotelId && h.Revenue >= 300m);
    }

    [Fact]
    public async Task GetBookingStatusBreakdown_CountsAllStatuses()
    {
        var (customer, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);

        _ctx.Bookings.Add(new Booking
        {
            CustomerId = customer.Id,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            DateFrom = new DateOnly(2027, 3, 1),
            DateTo = new DateOnly(2027, 3, 5),
            AmountToPay = 100m,
            EstimatedTimeOfArrivalUtc = DateTimeOffset.UtcNow,
            Status = BookingStatus.Pending,
            BookingRoomVariants = new List<BookingRoomVariant> { new() { RoomVariantId = variant.Id, Quantity = 1 } }
        });
        await _ctx.SaveChangesAsync();

        var repo = new AdminStatsRepository(_ctx);
        var result = await repo.GetBookingStatusBreakdownAsync();

        result.Should().Contain(s => s.Status == nameof(BookingStatus.Pending) && s.Count >= 1);
    }

    [Fact]
    public async Task GetSignupsPerDay_CountsUsersCreatedWithinWindow()
    {
        var (customer, _) = await SeedHelper.SeedBookingChainAsync(_ctx);
        customer.CreatedAtUtc = DateTimeOffset.UtcNow;
        await _ctx.SaveChangesAsync();

        var repo = new AdminStatsRepository(_ctx);
        var result = await repo.GetSignupsPerDayAsync(DateOnly.FromDateTime(DateTime.UtcNow));

        result.Sum(s => s.Count).Should().BeGreaterThanOrEqualTo(1);
    }
}
