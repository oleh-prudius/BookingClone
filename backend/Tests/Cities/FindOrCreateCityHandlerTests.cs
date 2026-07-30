using Application.Features.Cities.Commands.FindOrCreateCity;
using FluentAssertions;
using Infrastructure.Repositories;
using Tests.Fixtures;

namespace Tests.Cities;

[Collection("Database")]
public class FindOrCreateCityHandlerTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private Infrastructure.Data.AppDbContext _ctx = null!;

    public async Task InitializeAsync() => _ctx = fixture.CreateContext();
    public async Task DisposeAsync() => await _ctx.DisposeAsync();

    private FindOrCreateCityHandler CreateHandler() =>
        new(new CountryRepository(_ctx), new CityRepository(_ctx));

    [Fact]
    public async Task Handle_NewCountryAndCity_CreatesBoth()
    {
        var handler = CreateHandler();
        var countryName = $"Wakanda_{Guid.NewGuid():N}";

        var result = await handler.Handle(
            new FindOrCreateCityCommand(countryName, "Birnin Zana", 5.0, 10.0), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.CountryName.Should().Be(countryName);
        result.Value.Name.Should().Be("Birnin Zana");
        result.Value.Latitude.Should().Be(5.0);
        result.Value.Longitude.Should().Be(10.0);
    }

    [Fact]
    public async Task Handle_ExistingCountryNewCity_ReusesCountry()
    {
        var handler = CreateHandler();
        var countryName = $"Genovia_{Guid.NewGuid():N}";

        var first = await handler.Handle(
            new FindOrCreateCityCommand(countryName, "Pyrus", 1.0, 1.0), CancellationToken.None);
        var second = await handler.Handle(
            new FindOrCreateCityCommand(countryName, "Vulgaria", 2.0, 2.0), CancellationToken.None);

        second.Value!.CountryId.Should().Be(first.Value!.CountryId);
    }

    [Fact]
    public async Task Handle_ExistingCity_ReturnsSameCityWithoutDuplicating()
    {
        var handler = CreateHandler();
        var countryName = $"Latveria_{Guid.NewGuid():N}";

        var first = await handler.Handle(
            new FindOrCreateCityCommand(countryName, "Doomstadt", 3.0, 3.0), CancellationToken.None);
        var second = await handler.Handle(
            new FindOrCreateCityCommand(countryName, "Doomstadt", 3.0, 3.0), CancellationToken.None);

        second.Value!.Id.Should().Be(first.Value!.Id);
    }
}
