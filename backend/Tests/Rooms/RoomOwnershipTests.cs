using Application.Features.Rooms.Commands.CreateRoom;
using Application.Features.Rooms.Commands.UpdateRoom;
using Application.Interfaces;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace Tests.Rooms;

public class RoomOwnershipTests
{
    private static CreateRoomCommand MakeCreateCommand(long hotelId) =>
        new("Standard Room", 20, 1, 5, hotelId, 1);

    private static UpdateRoomCommand MakeUpdateCommand(long id) =>
        new(id, "Updated Room", 25, 1, 3, 1);

    [Fact]
    public async Task Create_ByNonOwningRealtor_ReturnsForbidden()
    {
        var hotelRepo = new Mock<IHotelRepository>();
        hotelRepo.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Hotel { Id = 5, RealtorId = 999 });

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new CreateRoomHandler(Mock.Of<IRoomRepository>(), hotelRepo.Object, currentUser.Object);

        var result = await handler.Handle(MakeCreateCommand(5), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task Create_ByOwningRealtor_Succeeds()
    {
        var hotelRepo = new Mock<IHotelRepository>();
        hotelRepo.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Hotel { Id = 5, RealtorId = 17 });

        var roomRepo = new Mock<IRoomRepository>();
        roomRepo.Setup(r => r.AddAsync(It.IsAny<Room>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Room r, CancellationToken _) => r);

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new CreateRoomHandler(roomRepo.Object, hotelRepo.Object, currentUser.Object);

        var result = await handler.Handle(MakeCreateCommand(5), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Update_ByNonOwningRealtor_ReturnsForbidden()
    {
        var roomRepo = new Mock<IRoomRepository>();
        roomRepo.Setup(r => r.GetByIdAsync(10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Room { Id = 10, HotelId = 5, Name = "Old" });

        var hotelRepo = new Mock<IHotelRepository>();
        hotelRepo.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Hotel { Id = 5, RealtorId = 999 });

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new UpdateRoomHandler(roomRepo.Object, hotelRepo.Object, currentUser.Object);

        var result = await handler.Handle(MakeUpdateCommand(10), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task Update_Admin_Succeeds_ForAnyHotel()
    {
        var roomRepo = new Mock<IRoomRepository>();
        roomRepo.Setup(r => r.GetByIdAsync(10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Room { Id = 10, HotelId = 5, Name = "Old" });

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(1L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(true);

        var handler = new UpdateRoomHandler(roomRepo.Object, Mock.Of<IHotelRepository>(), currentUser.Object);

        var result = await handler.Handle(MakeUpdateCommand(10), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }
}
