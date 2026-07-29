using Application.Features.RoomVariants.Commands.CreateRoomVariant;
using Application.Features.RoomVariants.Commands.DeleteRoomVariant;
using Application.Features.RoomVariants.Commands.UpdateRoomVariant;
using Application.Interfaces;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using FluentAssertions;
using Moq;

namespace Tests.RoomVariants;

public class RoomVariantOwnershipTests
{
    private static CreateRoomVariantCommand MakeCreateCommand(long roomId) =>
        new(100, null, roomId, 2, 0, 0, 1, 0, 0, 0);

    private static UpdateRoomVariantCommand MakeUpdateCommand(long id, long roomId) =>
        new(id, 120, null, roomId, 2, 0, 0, 1, 0, 0, 0);

    private static Mock<IHotelRepository> HotelOwnedBy(long hotelId, long realtorId)
    {
        var hotelRepo = new Mock<IHotelRepository>();
        hotelRepo.Setup(r => r.GetByIdAsync(hotelId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Hotel { Id = hotelId, RealtorId = realtorId });
        return hotelRepo;
    }

    private static Mock<IRoomRepository> RoomInHotel(long roomId, long hotelId)
    {
        var roomRepo = new Mock<IRoomRepository>();
        roomRepo.Setup(r => r.GetByIdAsync(roomId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Room { Id = roomId, HotelId = hotelId, Name = "Room" });
        return roomRepo;
    }

    [Fact]
    public async Task Create_ByNonOwningRealtor_ReturnsForbidden()
    {
        var roomRepo = RoomInHotel(10, 5);
        var hotelRepo = HotelOwnedBy(5, 999);
        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new CreateRoomVariantHandler(Mock.Of<IRoomVariantRepository>(), roomRepo.Object, hotelRepo.Object, currentUser.Object);

        var result = await handler.Handle(MakeCreateCommand(10), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task Create_ByOwningRealtor_Succeeds()
    {
        var roomRepo = RoomInHotel(10, 5);
        var hotelRepo = HotelOwnedBy(5, 17);
        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var variantRepo = new Mock<IRoomVariantRepository>();
        variantRepo.Setup(r => r.AddAsync(It.IsAny<RoomVariant>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((RoomVariant v, CancellationToken _) => v);
        variantRepo.Setup(r => r.GetByIdAsync(It.IsAny<long>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((long id, CancellationToken _) => new RoomVariant { Id = id, Price = 100, RoomId = 10 });

        var handler = new CreateRoomVariantHandler(variantRepo.Object, roomRepo.Object, hotelRepo.Object, currentUser.Object);

        var result = await handler.Handle(MakeCreateCommand(10), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Update_ByNonOwningRealtor_ReturnsForbidden()
    {
        var variantRepo = new Mock<IRoomVariantRepository>();
        variantRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RoomVariant { Id = 1, Price = 100, RoomId = 10 });

        var roomRepo = RoomInHotel(10, 5);
        var hotelRepo = HotelOwnedBy(5, 999);
        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new UpdateRoomVariantHandler(variantRepo.Object, roomRepo.Object, hotelRepo.Object, currentUser.Object);

        var result = await handler.Handle(MakeUpdateCommand(1, 10), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task Delete_ByNonOwningRealtor_ReturnsForbidden()
    {
        var variantRepo = new Mock<IRoomVariantRepository>();
        variantRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RoomVariant { Id = 1, Price = 100, RoomId = 10 });

        var roomRepo = RoomInHotel(10, 5);
        var hotelRepo = HotelOwnedBy(5, 999);
        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new DeleteRoomVariantHandler(variantRepo.Object, roomRepo.Object, hotelRepo.Object, currentUser.Object);

        var result = await handler.Handle(new DeleteRoomVariantCommand(1), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task Delete_ByOwningRealtor_Succeeds()
    {
        var variantRepo = new Mock<IRoomVariantRepository>();
        variantRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RoomVariant { Id = 1, Price = 100, RoomId = 10 });
        variantRepo.Setup(r => r.DeleteAsync(1, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var roomRepo = RoomInHotel(10, 5);
        var hotelRepo = HotelOwnedBy(5, 17);
        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new DeleteRoomVariantHandler(variantRepo.Object, roomRepo.Object, hotelRepo.Object, currentUser.Object);

        var result = await handler.Handle(new DeleteRoomVariantCommand(1), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }
}
