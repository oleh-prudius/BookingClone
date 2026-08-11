using Application.Features.Hotels.Queries.GetAllHotels;
using FluentAssertions;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Tests.Fixtures;
using Tests.Helpers;

namespace Tests.Hotels;

[Collection("Database")]
public class HotelFilterTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private Infrastructure.Data.AppDbContext _ctx = null!;

    public async Task InitializeAsync() => _ctx = fixture.CreateContext();
    public async Task DisposeAsync() => await _ctx.DisposeAsync();

    [Fact]
    public async Task GetFiltered_ByName_ReturnsOnlyMatchingHotels()
    {
        await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new HotelRepository(_ctx);

        var (items, _) = await repo.GetFilteredAsync("Test Hotel", null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 20);

        items.Should().NotBeEmpty();
        items.Should().AllSatisfy(h => h.Name.Should().Contain("Test Hotel"));
    }

    [Fact]
    public async Task GetFiltered_ByCity_ReturnsOnlyHotelsInThatCity()
    {
        await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new HotelRepository(_ctx);

        var (items, _) = await repo.GetFilteredAsync(null, null, "TestCity", null, null, null, null, null, null, null, null, null, null, null, 1, 20);

        items.Should().NotBeEmpty();
        items.Should().AllSatisfy(h => h.Address.City.Name.Should().Be("TestCity"));
    }

    [Fact]
    public async Task GetFiltered_ExcludesArchivedHotels()
    {
        var (_, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var hotel = await _ctx.Hotels.FindAsync(variant.Room.HotelId);
        if (hotel is not null)
        {
            hotel.IsArchived = true;
            await _ctx.SaveChangesAsync();
        }

        var repo = new HotelRepository(_ctx);
        var (items, _) = await repo.GetFilteredAsync(null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 100);

        items.Should().NotContain(h => h.IsArchived);
    }

    [Fact]
    public async Task GetFiltered_NonExistentCity_ReturnsEmpty()
    {
        var repo = new HotelRepository(_ctx);

        var (items, total) = await repo.GetFilteredAsync(null, null, "CityThatDoesNotExist_xyz", null, null, null, null, null, null, null, null, null, null, null, 1, 20);

        items.Should().BeEmpty();
        total.Should().Be(0);
    }

    [Fact]
    public async Task GetFiltered_ByPriceRange_IncludesHotelWithMatchingVariant()
    {
        var (_, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var room = await _ctx.Rooms.SingleAsync(r => r.Id == variant.RoomId);
        var repo = new HotelRepository(_ctx);

        // SeedHelper's room variant is priced at 100.
        var (items, _) = await repo.GetFilteredAsync(null, null, null, null, 90m, 110m, null, null, null, null, null, null, null, null, 1, 1000);

        items.Should().Contain(h => h.Id == room.HotelId);
    }

    [Fact]
    public async Task GetFiltered_ByPriceRange_ExcludesHotelOutsideRange()
    {
        var (_, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var room = await _ctx.Rooms.SingleAsync(r => r.Id == variant.RoomId);
        var repo = new HotelRepository(_ctx);

        var (items, _) = await repo.GetFilteredAsync(null, null, null, null, 500m, 600m, null, null, null, null, null, null, null, null, 1, 1000);

        items.Should().NotContain(h => h.Id == room.HotelId);
    }

    [Fact]
    public async Task GetFiltered_ByStarRating_ReturnsOnlyMatchingHotels()
    {
        var (_, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var room = await _ctx.Rooms.SingleAsync(r => r.Id == variant.RoomId);
        var hotel = await _ctx.Hotels.FindAsync(room.HotelId);
        hotel!.StarRating = 5;
        await _ctx.SaveChangesAsync();

        var repo = new HotelRepository(_ctx);
        var (items, _) = await repo.GetFilteredAsync(null, null, null, null, null, null, null, null, null, null, null, null, [5], null, 1, 1000);

        items.Should().Contain(h => h.Id == hotel.Id);
        items.Should().AllSatisfy(h => h.StarRating.Should().Be(5));
    }

    [Fact]
    public async Task Handler_SearchByName_ReturnsPagedDtoResult()
    {
        var (_, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var room = await _ctx.Rooms.SingleAsync(r => r.Id == variant.RoomId);
        var handler = new GetAllHotelsHandler(new HotelRepository(_ctx));

        // Shared DB across the test suite means many other "Test Hotel" rows may already
        // exist by the time this runs - use a large page size so this test's hotel isn't
        // pushed off the first page.
        var result = await handler.Handle(new GetAllHotelsQuery(Page: 1, PageSize: 1000, Name: "Test Hotel"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Items.Should().Contain(h => h.Id == room.HotelId);
        result.Value.Page.Should().Be(1);
        result.Value.PageSize.Should().Be(1000);
    }
}
