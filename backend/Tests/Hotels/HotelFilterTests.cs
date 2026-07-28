using Application.Features.Hotels.Queries.GetAllHotels;
using FluentAssertions;
using Infrastructure.Repositories;
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

        var (items, _) = await repo.GetFilteredAsync("Test Hotel", null, null, null, null, null, null, null, null, null, null, 1, 20);

        items.Should().NotBeEmpty();
        items.Should().AllSatisfy(h => h.Name.Should().Contain("Test Hotel"));
    }

    [Fact]
    public async Task GetFiltered_ByCity_ReturnsOnlyHotelsInThatCity()
    {
        await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new HotelRepository(_ctx);

        var (items, _) = await repo.GetFilteredAsync(null, null, "TestCity", null, null, null, null, null, null, null, null, 1, 20);

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
        var (items, _) = await repo.GetFilteredAsync(null, null, null, null, null, null, null, null, null, null, null, 1, 100);

        items.Should().NotContain(h => h.IsArchived);
    }

    [Fact]
    public async Task GetFiltered_NonExistentCity_ReturnsEmpty()
    {
        var repo = new HotelRepository(_ctx);

        var (items, total) = await repo.GetFilteredAsync(null, null, "CityThatDoesNotExist_xyz", null, null, null, null, null, null, null, null, 1, 20);

        items.Should().BeEmpty();
        total.Should().Be(0);
    }
}
