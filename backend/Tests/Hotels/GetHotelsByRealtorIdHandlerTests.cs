using Application.Features.Hotels.Queries.GetHotelsByRealtorId;
using Application.Interfaces;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace Tests.Hotels;

public class GetHotelsByRealtorIdHandlerTests
{
    [Fact]
    public async Task Realtor_CannotListAnotherRealtorsHotels()
    {
        var repo = new Mock<IHotelRepository>();
        repo.Setup(r => r.GetByRealtorIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Hotel>());

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new GetHotelsByRealtorIdHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new GetHotelsByRealtorIdQuery(999), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task Realtor_CanListOwnHotels()
    {
        var repo = new Mock<IHotelRepository>();
        repo.Setup(r => r.GetByRealtorIdAsync(17, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Hotel>());

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new GetHotelsByRealtorIdHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new GetHotelsByRealtorIdQuery(17), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Admin_CanListAnyRealtorsHotels()
    {
        var repo = new Mock<IHotelRepository>();
        repo.Setup(r => r.GetByRealtorIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Hotel>());

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(1L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(true);

        var handler = new GetHotelsByRealtorIdHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new GetHotelsByRealtorIdQuery(999), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }
}
