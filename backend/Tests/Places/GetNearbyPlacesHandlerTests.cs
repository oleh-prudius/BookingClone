using Application.Features.Places.Queries.GetNearbyPlaces;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using FluentAssertions;
using Moq;

namespace Tests.Places;

public class GetNearbyPlacesHandlerTests
{
    [Fact]
    public async Task NoHotelOrCity_ReturnsValidationError()
    {
        var handler = new GetNearbyPlacesHandler(Mock.Of<IPlaceRepository>(), Mock.Of<IHotelRepository>());

        var result = await handler.Handle(new GetNearbyPlacesQuery(null, null, null), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Validation");
    }

    [Fact]
    public async Task ByCityId_ReturnsPlacesWithoutDistance()
    {
        var placeRepo = new Mock<IPlaceRepository>();
        placeRepo.Setup(r => r.GetByCityIdAsync(1, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Place>
            {
                new() { Id = 1, Name = "Park", Category = "Park", Latitude = 50, Longitude = 30, CityId = 1 }
            });

        var handler = new GetNearbyPlacesHandler(placeRepo.Object, Mock.Of<IHotelRepository>());

        var result = await handler.Handle(new GetNearbyPlacesQuery(null, 1, null), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value![0].DistanceKm.Should().BeNull();
    }

    [Fact]
    public async Task ByHotelId_ResolvesCityAndComputesDistance()
    {
        var hotel = new Hotel
        {
            Id = 5,
            AddressId = 1,
            Address = new Address { Id = 1, CityId = 1, Latitude = 50.45, Longitude = 30.52, Street = "St", HouseNumber = "1" }
        };

        var hotelRepo = new Mock<IHotelRepository>();
        hotelRepo.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>())).ReturnsAsync(hotel);

        var placeRepo = new Mock<IPlaceRepository>();
        placeRepo.Setup(r => r.GetByCityIdAsync(1, "Park", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Place>
            {
                new() { Id = 1, Name = "Near Park", Category = "Park", Latitude = 50.451, Longitude = 30.521, CityId = 1 }
            });

        var handler = new GetNearbyPlacesHandler(placeRepo.Object, hotelRepo.Object);

        var result = await handler.Handle(new GetNearbyPlacesQuery(5, null, "Park"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value![0].DistanceKm.Should().NotBeNull();
        result.Value![0].DistanceKm.Should().BeLessThan(1);
    }

    [Fact]
    public async Task HotelNotFound_ReturnsNotFound()
    {
        var hotelRepo = new Mock<IHotelRepository>();
        hotelRepo.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync((Hotel?)null);

        var handler = new GetNearbyPlacesHandler(Mock.Of<IPlaceRepository>(), hotelRepo.Object);

        var result = await handler.Handle(new GetNearbyPlacesQuery(99, null, null), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("NotFound");
    }
}
