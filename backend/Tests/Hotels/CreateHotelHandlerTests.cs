using Application.Features.Hotels.Commands.CreateHotel;
using Application.Interfaces;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace Tests.Hotels;

public class CreateHotelHandlerTests
{
    private static CreateHotelCommand MakeCommand(long realtorId) => new(
        Name: "Test Hotel",
        Description: "Description",
        AddressId: 1,
        HotelCategoryId: 1,
        RealtorId: realtorId,
        ArrivalTimeUtcFrom: DateTimeOffset.UtcNow,
        ArrivalTimeUtcTo: DateTimeOffset.UtcNow.AddHours(8),
        DepartureTimeUtcFrom: DateTimeOffset.UtcNow,
        DepartureTimeUtcTo: DateTimeOffset.UtcNow.AddHours(4));

    private static Hotel WithEmptyNavigations(Hotel h)
    {
        h.Rooms = new List<Room>();
        h.Photos = new List<HotelPhoto>();
        h.HotelHotelAmenities = new List<HotelHotelAmenity>();
        return h;
    }

    [Fact]
    public async Task Realtor_CannotCreateHotelForAnotherRealtor()
    {
        var repo = new Mock<IHotelRepository>();
        repo.Setup(r => r.AddAsync(It.IsAny<Hotel>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Hotel h, CancellationToken _) => { h.Id = 42; return h; });
        repo.Setup(r => r.GetByIdAsync(42, It.IsAny<CancellationToken>()))
            .ReturnsAsync((long id, CancellationToken _) => WithEmptyNavigations(new Hotel { Id = id, RealtorId = 17 }));

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new CreateHotelHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(MakeCommand(realtorId: 999), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.RealtorId.Should().Be(17);
        repo.Verify(r => r.AddAsync(It.Is<Hotel>(h => h.RealtorId == 17), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Admin_CanCreateHotelForAnyRealtor()
    {
        var repo = new Mock<IHotelRepository>();
        repo.Setup(r => r.AddAsync(It.IsAny<Hotel>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Hotel h, CancellationToken _) => { h.Id = 42; return h; });
        repo.Setup(r => r.GetByIdAsync(42, It.IsAny<CancellationToken>()))
            .ReturnsAsync((long id, CancellationToken _) => WithEmptyNavigations(new Hotel { Id = id, RealtorId = 999 }));

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(1L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(true);

        var handler = new CreateHotelHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(MakeCommand(realtorId: 999), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.RealtorId.Should().Be(999);
        repo.Verify(r => r.AddAsync(It.Is<Hotel>(h => h.RealtorId == 999), It.IsAny<CancellationToken>()), Times.Once);
    }
}
